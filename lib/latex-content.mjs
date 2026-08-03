/**
 * Content-level extract/patch for user-owned LaTeX CV templates.
 * v1 families: resumeSubheading | tabularx-itemize
 */

import { escapeLatex } from './latex-escape.mjs';

export const SUPPORTED_FAMILIES = ['resumeSubheading', 'tabularx-itemize'];

export const UNSUPPORTED_HINT =
  'Unsupported LaTeX CV layout. v1 supports \\resumeSubheading + \\resumeItem macros, ' +
  'or tabularx + itemize without resume macros. Use /career-ops latex (cv.md → career-ops template) instead.';

/**
 * @param {string} tex
 * @returns {number}
 */
export function findMatchingBrace(tex, openIdx) {
  if (tex[openIdx] !== '{') return -1;
  let depth = 0;
  let escaped = false;
  for (let i = openIdx; i < tex.length; i++) {
    const ch = tex[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * @param {string} tex
 * @returns {'resumeSubheading'|'tabularx-itemize'|null}
 */
export function detectFamily(tex) {
  if (typeof tex !== 'string' || !tex.trim()) return null;
  const hasResumeSubheading = /\\resumeSubheading(?:Inline|Right)?\b/.test(tex);
  const hasResumeContent = /\\(resumeItem|resumeItemWithoutTitle|resumeSubItem|resumeSkill|resumeProject)\b/.test(tex);
  if (hasResumeSubheading && hasResumeContent) {
    return 'resumeSubheading';
  }
  const hasTabularx = /\\usepackage\{[^}]*tabularx[^}]*\}/.test(tex) || /\\begin\{tabularx\}/.test(tex);
  const hasItemize = /\\begin\{itemize\}/.test(tex);
  if (hasTabularx && hasItemize && !hasResumeSubheading) {
    return 'tabularx-itemize';
  }
  return null;
}

/**
 * Index where the document body starts, so extraction can skip macro
 * definitions in the preamble (e.g. `\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}}`
 * would otherwise be captured as a `#1` slot).
 *
 * @param {string} tex
 * @returns {number}
 */
function bodyStart(tex) {
  const docStart = tex.indexOf('\\begin{document}');
  return docStart === -1 ? 0 : docStart;
}

/**
 * True when `idx` sits on a line that is commented out at that position —
 * i.e. an unescaped `%` appears earlier on the same line. Commented macro
 * calls are inert LaTeX (often old bullets kept for reference) and must not
 * become editable slots.
 *
 * @param {string} tex
 * @param {number} idx
 * @returns {boolean}
 */
function isCommentedAt(tex, idx) {
  const lineStart = tex.lastIndexOf('\n', idx - 1) + 1;
  for (let i = lineStart; i < idx; i++) {
    if (tex[i] === '\\') {
      i++; // skip escaped char (\% is a literal percent)
      continue;
    }
    if (tex[i] === '%') return true;
  }
  return false;
}

/**
 * Extract macro argument bodies as editable slots. Spans are absolute
 * offsets into `tex`; scanning starts at the document body.
 *
 * `useNextGroupIfEmpty` handles the common `\resumeItemWithoutTitle{}{Text}`
 * pattern (one-parameter macro called with an empty first group followed by a
 * plain braced group): when the captured group is empty/whitespace, the slot
 * points at the immediately following braced group instead.
 *
 * @param {string} tex
 * @param {string} macroName
 * @param {string} kind
 * @param {{useNextGroupIfEmpty?: boolean}} [opts]
 * @returns {Array<{id: string, kind: string, text: string, span: {start: number, end: number}}>}
 */
function extractMacroBodies(tex, macroName, kind, { useNextGroupIfEmpty = false } = {}) {
  const slots = [];
  const needle = `\\${macroName}{`;
  let searchFrom = bodyStart(tex);
  while (searchFrom < tex.length) {
    const idx = tex.indexOf(needle, searchFrom);
    if (idx === -1) break;
    if (isCommentedAt(tex, idx)) {
      searchFrom = idx + needle.length;
      continue;
    }
    const openBrace = idx + needle.length - 1;
    const closeBrace = findMatchingBrace(tex, openBrace);
    if (closeBrace === -1) break;
    let innerStart = openBrace + 1;
    let innerEnd = closeBrace;
    let callEnd = closeBrace + 1;
    searchFrom = closeBrace + 1;

    if (useNextGroupIfEmpty && !tex.slice(innerStart, innerEnd).trim()) {
      let cursor = closeBrace + 1;
      while (cursor < tex.length && /\s/.test(tex[cursor])) cursor++;
      if (tex[cursor] !== '{') continue; // empty group with no follow-up group — nothing editable
      const openNext = cursor;
      const closeNext = findMatchingBrace(tex, openNext);
      if (closeNext === -1) break;
      innerStart = openNext + 1;
      innerEnd = closeNext;
      callEnd = closeNext + 1;
      searchFrom = closeNext + 1;
    }

    slots.push({
      id: `${kind}-${slots.length}`,
      kind,
      text: tex.slice(innerStart, innerEnd),
      span: { start: innerStart, end: innerEnd },
      callSpan: { start: idx, end: callEnd },
    });
  }
  return slots;
}

/**
 * Extract the value argument of `\resumeSubItem{Category}{Items}` calls as
 * skill slots. The category (first group) is left untouched; only the second
 * group is editable.
 *
 * @param {string} tex
 * @returns {Array<{kind: string, text: string, span: {start: number, end: number}}>}
 */
function extractSubItemValues(tex) {
  const slots = [];
  const needle = '\\resumeSubItem{';
  let searchFrom = bodyStart(tex);
  while (searchFrom < tex.length) {
    const idx = tex.indexOf(needle, searchFrom);
    if (idx === -1) break;
    if (isCommentedAt(tex, idx)) {
      searchFrom = idx + needle.length;
      continue;
    }
    const openCat = idx + needle.length - 1;
    const closeCat = findMatchingBrace(tex, openCat);
    if (closeCat === -1) break;
    searchFrom = closeCat + 1;

    let cursor = closeCat + 1;
    while (cursor < tex.length && /\s/.test(tex[cursor])) cursor++;
    if (tex[cursor] !== '{') continue;
    const openVal = cursor;
    const closeVal = findMatchingBrace(tex, openVal);
    if (closeVal === -1) break;

    slots.push({
      kind: 'skill',
      text: tex.slice(openVal + 1, closeVal),
      span: { start: openVal + 1, end: closeVal },
      callSpan: { start: idx, end: closeVal + 1 },
    });
    searchFrom = closeVal + 1;
  }
  return slots;
}

/**
 * Extract the editable second argument of a two-argument macro while leaving
 * its first (label/name) argument untouched.
 *
 * @param {string} tex
 * @param {string} macroName
 * @param {string} kind
 * @returns {Array<{kind: string, text: string, span: {start: number, end: number}}>}
 */
function extractSecondArgValues(tex, macroName, kind) {
  const slots = [];
  const needle = `\\${macroName}{`;
  let searchFrom = bodyStart(tex);
  while (searchFrom < tex.length) {
    const idx = tex.indexOf(needle, searchFrom);
    if (idx === -1) break;
    if (isCommentedAt(tex, idx)) {
      searchFrom = idx + needle.length;
      continue;
    }

    const openFirst = idx + needle.length - 1;
    const closeFirst = findMatchingBrace(tex, openFirst);
    if (closeFirst === -1) break;

    let cursor = closeFirst + 1;
    while (cursor < tex.length && /\s/.test(tex[cursor])) cursor++;
    if (tex[cursor] !== '{') {
      searchFrom = closeFirst + 1;
      continue;
    }

    const closeSecond = findMatchingBrace(tex, cursor);
    if (closeSecond === -1) break;
    slots.push({
      kind,
      text: tex.slice(cursor + 1, closeSecond),
      span: { start: cursor + 1, end: closeSecond },
      callSpan: { start: idx, end: closeSecond + 1 },
    });
    searchFrom = closeSecond + 1;
  }
  return slots;
}

/**
 * @param {string} tex
 * @returns {Array<{id: string, kind: string, text: string, span: {start: number, end: number}}>}
 */
function extractSkillValues(tex) {
  const slots = [];
  let searchFrom = bodyStart(tex);
  while (searchFrom < tex.length) {
    const idx = tex.indexOf('\\textbf{', searchFrom);
    if (idx === -1) break;
    if (isCommentedAt(tex, idx)) {
      searchFrom = idx + 8;
      continue;
    }
    const openCat = tex.indexOf('{', idx);
    const closeCat = findMatchingBrace(tex, openCat);
    if (closeCat === -1) break;

    let cursor = closeCat + 1;
    while (cursor < tex.length && /\s/.test(tex[cursor])) cursor++;
    if (tex[cursor] !== '{') {
      searchFrom = closeCat + 1;
      continue;
    }

    const openVal = cursor;
    const closeVal = findMatchingBrace(tex, openVal);
    if (closeVal === -1) break;

    const rawValue = tex.slice(openVal + 1, closeVal);
    const colon = rawValue.match(/^:\s*/);
    if (!colon) {
      searchFrom = closeVal + 1;
      continue;
    }

    const itemsStart = openVal + 1 + colon[0].length;
    const itemsText = tex.slice(itemsStart, closeVal);
    slots.push({
      kind: 'skill',
      text: itemsText,
      span: { start: itemsStart, end: closeVal },
      callSpan: { start: idx, end: closeVal + 1 },
    });
    searchFrom = closeVal + 1;
  }
  return slots;
}

/**
 * @param {string} tex
 * @returns {Array<{id: string, kind: string, text: string, span: {start: number, end: number}}>}
 */
function extractItemizeItems(tex) {
  const docStart = tex.indexOf('\\begin{document}');
  const body = docStart === -1 ? tex : tex.slice(docStart);
  const offset = docStart === -1 ? 0 : docStart;
  const slots = [];
  const itemRe = /\\item\b/g;
  let match;
  while ((match = itemRe.exec(body)) !== null) {
    if (isCommentedAt(body, match.index)) continue;
    let i = match.index + match[0].length;
    while (i < body.length && /\s/.test(body[i])) i++;

    if (body[i] === '{') {
      const openBrace = i;
      const closeBrace = findMatchingBrace(body, openBrace);
      if (closeBrace === -1) continue;
      slots.push({
        id: `item-${slots.length}`,
        kind: 'item',
        text: body.slice(openBrace + 1, closeBrace),
        span: { start: offset + openBrace + 1, end: offset + closeBrace },
        callSpan: { start: offset + match.index, end: offset + closeBrace + 1 },
      });
      continue;
    }

    const lineEnd = body.indexOf('\n', i);
    const end = lineEnd === -1 ? body.length : lineEnd;
    const text = body.slice(i, end).trim();
    if (!text) continue;
    slots.push({
      id: `item-${slots.length}`,
      kind: 'item',
      text,
      span: { start: offset + i, end: offset + end },
      callSpan: { start: offset + match.index, end: offset + end },
    });
  }
  return slots;
}

/**
 * @param {string} tex
 * @param {'resumeSubheading'|'tabularx-itemize'} family
 * @returns {Array<{id: string, kind: string, text: string, span: {start: number, end: number}}>}
 */
export function extractSlots(tex, family) {
  if (family === 'resumeSubheading') {
    const byPosition = (a, b) => a.span.start - b.span.start;
    const dedupe = (list) => {
      const seen = new Set();
      return list.filter(s => {
        const key = `${s.span.start}-${s.span.end}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    const bullets = dedupe([
      ...extractMacroBodies(tex, 'resumeItem', 'bullet'),
      ...extractMacroBodies(tex, 'resumeItemWithoutTitle', 'bullet', { useNextGroupIfEmpty: true }),
    ].sort(byPosition)).map((s, i) => ({ ...s, id: `bullet-${i}` }));
    const skills = dedupe([
      ...extractSkillValues(tex),
      ...extractSubItemValues(tex),
      ...extractSecondArgValues(tex, 'resumeSkill', 'skill'),
    ].sort(byPosition)).map((s, i) => ({ ...s, id: `skill-${i}` }));
    const projects = dedupe([
      ...extractSecondArgValues(tex, 'resumeProject', 'project'),
    ].sort(byPosition)).map((s, i) => ({ ...s, id: `project-${i}` }));
    return [...bullets, ...skills, ...projects];
  }
  if (family === 'tabularx-itemize') {
    return extractItemizeItems(tex);
  }
  return [];
}

/**
 * @param {string} texPath
 * @param {string} tex
 * @returns {{supported: boolean, family: string|null, source: string, slots: Array, error?: string, hint?: string}}
 */
export function buildManifest(texPath, tex) {
  const family = detectFamily(tex);
  if (!family) {
    return {
      supported: false,
      family: null,
      source: texPath,
      slots: [],
      error: UNSUPPORTED_HINT,
      hint: 'Place resume.tex in the project root or set latex.source in config/profile.yml.',
    };
  }

  const slots = extractSlots(tex, family);
  if (slots.length === 0) {
    return {
      supported: false,
      family,
      source: texPath,
      slots: [],
      error: 'LaTeX layout matched a supported family but exposed no editable prose slots.',
      hint: 'Use supported macro calls in the document body, not only wrapper definitions in the preamble.',
    };
  }
  return {
    supported: true,
    family,
    source: texPath,
    slots,
  };
}

/**
 * @param {string} tex
 * @param {Array<{id: string, text: string}>} patches
 * @param {Array<{id: string, span: {start: number, end: number}}>} slots
 * @param {{escape?: boolean}} [opts]
 * @returns {string}
 */
export function applyPatches(tex, patches, slots, { escape = true } = {}) {
  const slotById = new Map(slots.map(s => [s.id, s]));
  const ordered = [...patches]
    .map(p => {
      const slot = slotById.get(p.id);
      if (!slot) return null;
      return { slot, text: p.text, remove: p.remove === true };
    })
    .filter(Boolean)
    .sort((a, b) => (b.slot.callSpan?.start ?? b.slot.span.start) - (a.slot.callSpan?.start ?? a.slot.span.start));

  let out = tex;
  for (const { slot, text, remove } of ordered) {
    if (remove) {
      const callSpan = slot.callSpan || slot.span;
      const lineStart = out.lastIndexOf('\n', callSpan.start - 1) + 1;
      const nextNewline = out.indexOf('\n', callSpan.end);
      const lineEnd = nextNewline === -1 ? out.length : nextNewline;
      const before = out.slice(lineStart, callSpan.start);
      const after = out.slice(callSpan.end, lineEnd);
      const removeWholeLine = !before.trim() && !after.trim();
      const start = removeWholeLine ? lineStart : callSpan.start;
      const end = removeWholeLine && nextNewline !== -1 ? nextNewline + 1 : (removeWholeLine ? lineEnd : callSpan.end);
      out = out.slice(0, start) + out.slice(end);
      continue;
    }
    const replacement = escape ? escapeLatex(text) : text;
    out = out.slice(0, slot.span.start) + replacement + out.slice(slot.span.end);
  }
  return out;
}
