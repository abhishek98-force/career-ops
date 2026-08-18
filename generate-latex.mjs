#!/usr/bin/env node

/**
 * generate-latex.mjs — Validate and compile a generated .tex CV file to PDF
 *
 * Usage:
 *   node generate-latex.mjs <input.tex> [output.pdf]
 *   node generate-latex.mjs <input.tex> [output.pdf] --compile-only
 *   node generate-latex.mjs <input.tex> [output.pdf] --max-pages=1 --strict-pages \
 *     --min-bottom-gap-in=0.35 --max-bottom-gap-in=0.70 --strict-fit
 *
 * Default: validates career-ops template structure (from templates/cv-template.tex).
 * --compile-only: skip template validation; compile any user-owned .tex (latex-tex mode).
 *
 * Requires: tectonic (preferred) or pdflatex on PATH.
 */

import { readFile, writeFile, stat, copyFile, rm } from 'fs/promises';
import { resolve, basename, dirname, join } from 'path';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const MIN_SECTIONS = 4;

const REQUIRED_COMMANDS = [
  '\\\\resumeSubheading',
  '\\\\resumeItem',
  '\\\\resumeProjectHeading',
];

const CJK_RE = /[぀-ヿ㐀-鿿豈-﫿ｦ-ﾟ가-힯ᄀ-ᇿ]/;
const POINTS_PER_INCH = 72;

/**
 * Parse page count from pdfinfo output.
 *
 * @param {string} text
 * @returns {number}
 */
export function parsePdfInfoPageCount(text) {
  const match = String(text || '').match(/^Pages:\s+(\d+)\s*$/m);
  const pages = match ? Number(match[1]) : 0;
  if (!Number.isInteger(pages) || pages < 1) {
    throw new Error('Could not determine PDF page count from pdfinfo output.');
  }
  return pages;
}

/**
 * Parse page dimensions and the final rendered word position from
 * `pdftotext -bbox` XHTML.
 *
 * @param {string} xml
 * @returns {{pageCount: number, pages: Array<{heightPoints: number, lastTextYPoints: number, bottomGapPoints: number}>}}
 */
export function parsePdftotextBbox(xml) {
  const pages = [];
  const pageRe = /<page\b([^>]*)>([\s\S]*?)<\/page>/g;
  for (const pageMatch of String(xml || '').matchAll(pageRe)) {
    const heightMatch = pageMatch[1].match(/\bheight="([0-9]+(?:\.[0-9]+)?)"/);
    const heightPoints = heightMatch ? Number(heightMatch[1]) : NaN;
    const yValues = [...pageMatch[2].matchAll(/<word\b[^>]*\byMax="([0-9]+(?:\.[0-9]+)?)"[^>]*>/g)]
      .map((match) => Number(match[1]))
      .filter(Number.isFinite);
    if (!Number.isFinite(heightPoints) || heightPoints <= 0 || yValues.length === 0) {
      throw new Error('Could not determine rendered text bounds from pdftotext bbox output.');
    }
    const lastTextYPoints = Math.max(...yValues);
    pages.push({
      heightPoints,
      lastTextYPoints,
      bottomGapPoints: heightPoints - lastTextYPoints,
    });
  }
  if (pages.length === 0) {
    throw new Error('Could not find any rendered PDF pages in pdftotext bbox output.');
  }
  return { pageCount: pages.length, pages };
}

/**
 * Measure rendered PDF pages and physical whitespace below the final word.
 *
 * @param {string} pdfPath
 * @returns {{pageCount: number, pages: Array, bottomGapPoints: number, bottomGapInches: number}}
 */
export function measureLatexPdfFit(pdfPath) {
  let info;
  let bbox;
  try {
    info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    bbox = execFileSync('pdftotext', ['-bbox', pdfPath, '-'], { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    throw new Error(`PDF fit measurement requires pdfinfo and pdftotext: ${err.message}`);
  }
  const pageCount = parsePdfInfoPageCount(info);
  const bounds = parsePdftotextBbox(bbox);
  if (bounds.pageCount !== pageCount) {
    throw new Error(`PDF measurement disagreement: pdfinfo reports ${pageCount} pages, bbox reports ${bounds.pageCount}.`);
  }
  const bottomGapPoints = bounds.pages.at(-1).bottomGapPoints;
  return {
    pageCount,
    pages: bounds.pages,
    bottomGapPoints,
    bottomGapInches: bottomGapPoints / POINTS_PER_INCH,
  };
}

/**
 * Evaluate a rendered PDF against page and bottom-whitespace constraints.
 * This is a decision gate only; it never mutates or re-renders the document.
 *
 * @param {{pageCount: number, bottomGapPoints: number}} metrics
 * @param {{maxPages?: number|null, minBottomGapPoints?: number|null, maxBottomGapPoints?: number|null}} options
 * @returns {{valid: boolean, issues: string[]}}
 */
export function evaluateLatexFit(metrics, {
  maxPages = null,
  minBottomGapPoints = null,
  maxBottomGapPoints = null,
} = {}) {
  const issues = [];
  if (maxPages !== null && metrics.pageCount > maxPages) {
    issues.push(`CV is ${metrics.pageCount} pages; the allowed maximum is ${maxPages}.`);
  }
  if (metrics.pageCount === 1 && minBottomGapPoints !== null && metrics.bottomGapPoints < minBottomGapPoints) {
    issues.push(`Bottom gap is ${(metrics.bottomGapPoints / POINTS_PER_INCH).toFixed(2)}in; minimum is ${(minBottomGapPoints / POINTS_PER_INCH).toFixed(2)}in.`);
  }
  if (metrics.pageCount === 1 && maxBottomGapPoints !== null && metrics.bottomGapPoints > maxBottomGapPoints) {
    issues.push(`Bottom gap is ${(metrics.bottomGapPoints / POINTS_PER_INCH).toFixed(2)}in; maximum is ${(maxBottomGapPoints / POINTS_PER_INCH).toFixed(2)}in.`);
  }
  return { valid: issues.length === 0, issues };
}

/**
 * @param {string} content
 * @param {boolean} compileOnly
 * @returns {{ issues: string[], counts: object }}
 */
export function validateLatexContent(content, compileOnly) {
  const issues = [];
  let resumeItemCount = 0;
  let subheadingCount = 0;
  let projectHeadingCount = 0;

  if (!content.includes('\\begin{document}')) {
    issues.push('Missing \\begin{document}');
  }
  if (!content.includes('\\end{document}')) {
    issues.push('Missing \\end{document}');
  }

  if (compileOnly) {
    return {
      issues,
      counts: { resumeItems: 0, subheadings: 0, projectHeadings: 0 },
    };
  }

  const sectionCount = (content.match(/\\section\{/g) || []).length;
  if (sectionCount < MIN_SECTIONS) {
    issues.push(`Expected at least ${MIN_SECTIONS} \\section{} blocks (Education, Work Experience, Projects, Skills — or localized equivalents), found ${sectionCount}`);
  }

  if (CJK_RE.test(content)) {
    issues.push('CJK characters detected. The LaTeX template does not support Japanese/Chinese/Korean yet (pdfLaTeX setup with no CJK font). Use `pdf` mode (HTML to PDF, which renders CJK) for these CVs.');
  }

  for (const cmd of REQUIRED_COMMANDS) {
    if (!new RegExp(cmd).test(content)) {
      issues.push(`Missing command: ${cmd}`);
    }
  }

  const unresolvedMatch = content.match(/\{\{[A-Z_]+\}\}/g);
  if (unresolvedMatch) {
    issues.push(`Unresolved placeholders: ${[...new Set(unresolvedMatch)].join(', ')}`);
  }

  const lines = content.split('\n');
  for (const line of lines) {
    if (/\\resumeItem\{/.test(line)) resumeItemCount++;
    if (/\\resumeSubheading(?!Continue)/.test(line)) subheadingCount++;
    if (/\\resumeProjectHeading/.test(line)) projectHeadingCount++;
  }

  if (!content.includes('\\pdfgentounicode=1')) {
    issues.push('Missing \\pdfgentounicode=1 (ATS compatibility)');
  }

  return {
    issues,
    counts: {
      resumeItems: resumeItemCount,
      subheadings: subheadingCount,
      projectHeadings: projectHeadingCount,
    },
  };
}

/**
 * @param {string} absPath
 * @param {string} content
 * @param {string|null} outputPath
 * @param {boolean} compileOnly
 * @returns {Promise<object>}
 */
export async function compileLatexFile(absPath, content, outputPath, compileOnly, fitOptions = {}) {
  const { issues, counts } = validateLatexContent(content, compileOnly);
  const fileInfo = await stat(absPath);
  const sizeKB = (fileInfo.size / 1024).toFixed(1);

  const report = {
    file: basename(absPath),
    path: absPath,
    sizeKB: parseFloat(sizeKB),
    counts,
    issues,
    valid: issues.length === 0,
    compileOnly,
  };

  if (issues.length > 0) {
    return report;
  }

  const texDir = dirname(absPath);
  const texBase = basename(absPath, '.tex');
  const defaultPdf = join(texDir, `${texBase}.pdf`);
  const targetPdf = outputPath ? resolve(outputPath) : defaultPdf;

  const targetDir = dirname(targetPdf);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  let engine = null;
  for (const candidate of ['tectonic', 'pdflatex']) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'pipe' });
      engine = candidate;
      break;
    } catch { /* not found */ }
  }

  if (!engine) {
    report.compiled = false;
    report.compileError = 'No LaTeX engine found. Install tectonic (brew install tectonic) or pdflatex.';
    return report;
  }

  report.engine = engine;

  let compilePath = absPath;
  if (engine === 'tectonic') {
    const patched = content
      .replace(/\\pdfgentounicode\s*=\s*\d+[^\n]*\n?/g, '')
      .replace(/\\input\{glyphtounicode\}[^\n]*\n?/g, '');
    compilePath = join(texDir, `${texBase}._tectonic.tex`);
    await writeFile(compilePath, patched, 'utf-8');
  }

  try {
    if (engine === 'tectonic') {
      execFileSync('tectonic', ['--outdir', texDir, compilePath], {
        cwd: texDir,
        stdio: 'pipe',
        timeout: 120_000,
      });
    } else {
      const pdflatexArgs = [
        '-no-shell-escape',
        '-interaction=nonstopmode',
        '-halt-on-error',
        `-output-directory=${texDir}`,
        absPath,
      ];
      execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
      execFileSync('pdflatex', pdflatexArgs, { cwd: texDir, stdio: 'pipe', timeout: 120_000 });
    }

    report.compiled = true;
  } catch (err) {
    const logPath = join(texDir, `${texBase}.log`);
    let latexError = err.message;
    try {
      const log = await readFile(logPath, 'utf-8');
      const errorLines = log.split('\n').filter(l => l.startsWith('!'));
      if (errorLines.length > 0) {
        latexError = errorLines.join('\n');
      }
    } catch { /* no log */ }

    report.compiled = false;
    report.compileError = latexError;
  }

  if (report.compiled) {
    const compileBase = basename(compilePath, '.tex');
    const compiledPdf = join(texDir, `${compileBase}.pdf`);

    try {
      await copyFile(compiledPdf, targetPdf);
      if (resolve(compiledPdf) !== resolve(targetPdf)) {
        await rm(compiledPdf).catch(() => {});
      }

      const pdfStat = await stat(targetPdf);
      report.pdf = {
        path: targetPdf,
        sizeKB: parseFloat((pdfStat.size / 1024).toFixed(1)),
      };

      const fitRequested = fitOptions.maxPages != null ||
        fitOptions.minBottomGapPoints != null ||
        fitOptions.maxBottomGapPoints != null;
      if (fitRequested) {
        try {
          const metrics = measureLatexPdfFit(targetPdf);
          const decision = evaluateLatexFit(metrics, fitOptions);
          report.fit = {
            ...metrics,
            maxPages: fitOptions.maxPages,
            minBottomGapPoints: fitOptions.minBottomGapPoints,
            maxBottomGapPoints: fitOptions.maxBottomGapPoints,
            valid: decision.valid,
            issues: decision.issues,
          };
          const pageFailure = fitOptions.strictPages &&
            fitOptions.maxPages !== null && metrics.pageCount > fitOptions.maxPages;
          const gapFailure = fitOptions.strictFit && metrics.pageCount === 1 && (
            (fitOptions.minBottomGapPoints !== null && metrics.bottomGapPoints < fitOptions.minBottomGapPoints) ||
            (fitOptions.maxBottomGapPoints !== null && metrics.bottomGapPoints > fitOptions.maxBottomGapPoints)
          );
          report.strictFitFailure = pageFailure || gapFailure;
        } catch (err) {
          report.fit = { valid: false, issues: [err.message] };
          report.strictFitFailure = Boolean(fitOptions.strictPages || fitOptions.strictFit);
        }
      }
    } catch (err) {
      report.postCompileError = `Failed to finalize PDF: ${err.message}`;
    }

    const auxExts = ['.aux', '.log', '.out', '.fls', '.fdb_latexmk', '.synctex.gz'];
    for (const ext of auxExts) {
      await rm(join(texDir, `${compileBase}${ext}`)).catch(() => {});
    }
    if (engine === 'tectonic') {
      await rm(compilePath).catch(() => {});
    }
  }

  return report;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const compileOnly = rawArgs.includes('--compile-only');
  const strictPages = rawArgs.includes('--strict-pages');
  const strictFit = rawArgs.includes('--strict-fit');
  const readFlag = (name) => {
    const prefix = `--${name}=`;
    const arg = rawArgs.find(value => value.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : null;
  };
  const parsePositive = (name, raw, { integer = false } = {}) => {
    if (raw === null) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0 || (integer && !Number.isInteger(value))) {
      throw new Error(`Invalid --${name} "${raw}". Use a positive ${integer ? 'integer' : 'number'}.`);
    }
    return value;
  };
  let maxPages;
  let minBottomGapInches;
  let maxBottomGapInches;
  try {
    maxPages = parsePositive('max-pages', readFlag('max-pages'), { integer: true });
    minBottomGapInches = parsePositive('min-bottom-gap-in', readFlag('min-bottom-gap-in'));
    maxBottomGapInches = parsePositive('max-bottom-gap-in', readFlag('max-bottom-gap-in'));
    if (minBottomGapInches !== null && maxBottomGapInches !== null && minBottomGapInches > maxBottomGapInches) {
      throw new Error('--min-bottom-gap-in cannot exceed --max-bottom-gap-in.');
    }
    if (strictPages && maxPages === null) {
      throw new Error('--strict-pages requires --max-pages=N.');
    }
    if (strictFit && minBottomGapInches === null && maxBottomGapInches === null) {
      throw new Error('--strict-fit requires --min-bottom-gap-in=N or --max-bottom-gap-in=N.');
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const args = rawArgs.filter(a =>
    a !== '--compile-only' &&
    a !== '--strict-pages' &&
    a !== '--strict-fit' &&
    !a.startsWith('--max-pages=') &&
    !a.startsWith('--min-bottom-gap-in=') &&
    !a.startsWith('--max-bottom-gap-in='));
  const inputPath = args[0];
  const outputPath = args[1];

  if (!inputPath) {
    console.error('Usage: node generate-latex.mjs <input.tex> [output.pdf] [--compile-only] [--max-pages=N] [--strict-pages] [--min-bottom-gap-in=N] [--max-bottom-gap-in=N] [--strict-fit]');
    process.exit(1);
  }

  const absPath = resolve(inputPath);
  let content;
  try {
    content = await readFile(absPath, 'utf-8');
  } catch (err) {
    console.error(`Error reading ${absPath}: ${err.message}`);
    process.exit(1);
  }

  const report = await compileLatexFile(absPath, content, outputPath || null, compileOnly, {
    maxPages,
    minBottomGapPoints: minBottomGapInches === null ? null : minBottomGapInches * POINTS_PER_INCH,
    maxBottomGapPoints: maxBottomGapInches === null ? null : maxBottomGapInches * POINTS_PER_INCH,
    strictPages,
    strictFit,
  });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.compiled && !report.strictFitFailure ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main();
}
