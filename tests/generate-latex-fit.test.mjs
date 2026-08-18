import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { pass, fail, ROOT, NODE } from './helpers.mjs';
import {
  parsePdfInfoPageCount,
  parsePdftotextBbox,
  evaluateLatexFit,
} from '../generate-latex.mjs';
import { applyPatches, buildManifest } from '../lib/latex-content.mjs';

const balancedBbox = `<?xml version="1.0" encoding="UTF-8"?>
<doc>
  <page width="612.000000" height="792.000000">
    <word xMin="36.0" yMin="40.0" xMax="90.0" yMax="52.0">Header</word>
    <word xMin="36.0" yMin="744.0" xMax="120.0" yMax="756.0">Education</word>
  </page>
</doc>`;

try {
  if (parsePdfInfoPageCount('Title: Resume\nPages:          1\nPage size: 612 x 792 pts') === 1) {
    pass('generate-latex parses structural page count from pdfinfo');
  } else {
    fail('generate-latex returned the wrong pdfinfo page count');
  }
} catch (err) {
  fail(`generate-latex rejected valid pdfinfo output: ${err.message}`);
}

try {
  const parsed = parsePdftotextBbox(balancedBbox);
  const gap = parsed.pages[0]?.bottomGapPoints;
  if (parsed.pageCount === 1 && gap === 36) {
    pass('generate-latex measures physical whitespace below the final rendered word');
  } else {
    fail(`generate-latex bbox measurement was incorrect: ${JSON.stringify(parsed)}`);
  }
} catch (err) {
  fail(`generate-latex rejected valid bbox output: ${err.message}`);
}

const balanced = evaluateLatexFit(
  { pageCount: 1, bottomGapPoints: 36 },
  { maxPages: 1, minBottomGapPoints: 25.2, maxBottomGapPoints: 50.4 },
);
if (balanced.valid && balanced.issues.length === 0) {
  pass('generate-latex accepts a balanced one-page physical bottom gap');
} else {
  fail(`generate-latex rejected balanced one-page output: ${balanced.issues.join('; ')}`);
}

const underfilled = evaluateLatexFit(
  { pageCount: 1, bottomGapPoints: 72 },
  { maxPages: 1, minBottomGapPoints: 25.2, maxBottomGapPoints: 50.4 },
);
if (!underfilled.valid && underfilled.issues.some(issue => issue.includes('maximum is 0.70in'))) {
  pass('generate-latex rejects an underfilled one-page resume');
} else {
  fail('generate-latex accepted excessive bottom whitespace');
}

const overcrowded = evaluateLatexFit(
  { pageCount: 1, bottomGapPoints: 18 },
  { maxPages: 1, minBottomGapPoints: 25.2, maxBottomGapPoints: 50.4 },
);
if (!overcrowded.valid && overcrowded.issues.some(issue => issue.includes('minimum is 0.35in'))) {
  pass('generate-latex rejects content placed too close to the page edge');
} else {
  fail('generate-latex accepted an overcrowded bottom edge');
}

const overflow = evaluateLatexFit(
  { pageCount: 2, bottomGapPoints: 36 },
  { maxPages: 1, minBottomGapPoints: 25.2, maxBottomGapPoints: 50.4 },
);
if (!overflow.valid && overflow.issues.some(issue => issue.includes('2 pages'))) {
  pass('generate-latex rejects a two-page resume against a one-page budget');
} else {
  fail('generate-latex accepted a two-page resume against a one-page budget');
}

const script = join(ROOT, 'generate-latex.mjs');
const invalidCases = [
  {
    args: ['missing.tex', '--strict-pages'],
    expected: '--strict-pages requires --max-pages=N',
  },
  {
    args: ['missing.tex', '--strict-fit'],
    expected: '--strict-fit requires --min-bottom-gap-in=N or --max-bottom-gap-in=N',
  },
  {
    args: ['missing.tex', '--min-bottom-gap-in=0.70', '--max-bottom-gap-in=0.35'],
    expected: '--min-bottom-gap-in cannot exceed --max-bottom-gap-in',
  },
];

for (const testCase of invalidCases) {
  const result = spawnSync(NODE, [script, ...testCase.args], {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 30_000,
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0 && output.includes(testCase.expected) && !output.includes('Error reading')) {
    pass(`generate-latex validates fit flags before reading the input: ${testCase.expected}`);
  } else {
    fail(`generate-latex flag validation regressed: ${output.trim()}`);
  }
}

const protectedTemplatePath = join(ROOT, 'data', 'templates', 'Abhishek_Resume_LLM_Flexible_Template_v8.tex');
const protectedTemplate = readFileSync(protectedTemplatePath, 'utf-8');
const manifest = buildManifest(protectedTemplatePath, protectedTemplate);
const patchedTemplate = applyPatches(protectedTemplate, [
  { id: 'bullet-0', text: 'Source-backed tailored evidence.' },
  { id: 'bullet-1', remove: true },
], manifest.slots);
const immutableMarkers = [
  '\\documentclass[letterpaper,10pt]{article}',
  '\\usepackage[letterpaper,top=18bp,bottom=18bp,left=36.1bp,right=36bp]{geometry}',
  '\\fontsize{10bp}{12.2bp}\\selectfont',
  '\\resumeSection{SKILLS}',
  '\\resumeSection{RELEVANT EXPERIENCE}',
  '\\resumeSubheading{Software Engineering Intern, Sedai Labs - Spot Intelligence}{July 2026 - Present}',
  '\\resumeSubheading{Software Development Engineer, Augesys}{March 2026 - Present}',
  '\\resumeSubheading{Software Development Intern, IpserLabs}{January 2025 - May 2025}',
  '\\resumeSubheading{Software Engineer, Wipro}{July 2021 - August 2023}',
  '\\resumeSection{OPEN SOURCE CONTRIBUTIONS}',
  '\\resumeSection{SELECT PROJECTS}',
  '\\resumeSection{EDUCATION}',
];
if (
  immutableMarkers.every(marker => patchedTemplate.includes(marker)) &&
  patchedTemplate.includes('Source-backed tailored evidence.') &&
  (patchedTemplate.match(/\\resumeItem\{Bullet 2\}/g) || []).length ===
    (protectedTemplate.match(/\\resumeItem\{Bullet 2\}/g) || []).length - 1 &&
  readFileSync(protectedTemplatePath, 'utf-8') === protectedTemplate
) {
  pass('LaTeX slot fitting preserves the protected layout and source file');
} else {
  fail('LaTeX slot fitting changed protected layout structure or source content');
}

const profile = readFileSync(join(ROOT, 'config', 'profile.yml'), 'utf-8');
const custom = readFileSync(join(ROOT, 'modes', '_custom.md'), 'utf-8');
if (
  /cv:\s*[\s\S]*?page_target:\s*1\b/.test(profile) &&
  custom.includes('--max-pages=1 --strict-pages') &&
  custom.includes('--min-bottom-gap-in=0.35 --max-bottom-gap-in=0.70 --strict-fit') &&
  custom.includes('Keep at least one distinct, source-backed bullet under each employer')
) {
  pass('one-page balanced-fill preference and entry minimum are persistent');
} else {
  fail('one-page balanced-fill preference is incomplete');
}
