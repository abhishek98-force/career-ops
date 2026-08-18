# Mode: latex-tex — Tailor a user-owned LaTeX CV in place

Opt-in mode for candidates who already maintain a hand-tuned `.tex` CV. **Does not change the global source of truth** — `cv.md` remains the default for evaluations, apply mode, and auto-pipeline. Invoke explicitly via `/career-ops latex-tex`.

## When to use

- User has `resume.tex` (or `config/profile.yml → latex.source`) in a supported layout
- User wants JD-tailored bullets/skills while keeping their preamble, macros, colors, and spacing

## Supported layouts (v1)

| Family | Detection | Editable prose |
|--------|-----------|----------------|
| `resumeSubheading` | `\resumeSubheading`, `\resumeSubheadingInline`, or `\resumeSubheadingRight` + supported content macros | `\resumeItem{...}` and `\resumeItemWithoutTitle{}{...}` bullets; `\textbf{Category}{: items}`, `\resumeSubItem{Category}{items}`, and `\resumeSkill{Category}{items}` skill values; `\resumeProject{Name}{description}` descriptions |
| `tabularx-itemize` | `tabularx` + `itemize`, no resume macros | `\item` body text in the document body |

Extraction only reads the document body (preamble macro definitions are skipped) and ignores commented-out macro calls — old bullets kept as `%` comments never become editable slots.

Any other layout → stop with the script error and suggest `/career-ops latex` (cv.md → career-ops template).

## Source file resolution

1. `config/profile.yml → latex.source` if set
2. Else `resume.tex` in project root
3. Else `cv.tex` in project root

If none exist, stop and ask the user to add their `.tex` file or set `latex.source`.

```yaml
# config/profile.yml (optional, user layer)
latex:
  source: resume.tex
```

## Pipeline

1. Resolve source `.tex` path (see above)
2. Run: `node extract-latex-content.mjs <source.tex> --out /tmp/cv-slots-{company}.json`
3. If `supported: false` → show `error` + `hint`; do not proceed
4. Read JD (from context, report, or ask user)
5. Tailor the editable slot values for JD fit (same ethics as `modes/latex.md` / `pdf`):
    - Extract 15–20 JD keywords
    - Reorder bullets by relevance by assigning the strongest text to the earliest slot ids; patch-list order itself does not change document order
    - Inject keywords into existing achievements — **NEVER invent skills**
    - Skill slots may expose `label` and `labelSpan`; when present, patch both `label` and `text` to organize skills into coherent role-specific categories
    - Remove unused skill rows instead of padding them or duplicating skills across categories
    - If `cv.md` exists, cross-check claims against it; omit anything not backed by in-scope sources
6. Write patches file:

```json
{
    "patches": [
      { "id": "bullet-0", "text": "Tailored plain-text bullet (no LaTeX escaping — the script escapes)" },
      { "id": "skill-0", "label": "Backend & APIs", "text": "FastAPI, Flask, REST APIs" },
      { "id": "bullet-1", "remove": true }
    ]
}
```

7. Run: `node patch-latex-content.mjs <source.tex> /tmp/cv-patches-{company}.json output/cv-{candidate}-{company}-{YYYY-MM-DD}.tex`. Use `{ "id": "...", "remove": true }` to remove a lower-priority macro call cleanly (including its otherwise-empty source line). The patcher re-extracts slots from the source; when the JSON also carries `slots`, it rejects stale or mismatched manifests instead of applying unsafe offsets.
8. Run: `node generate-latex.mjs output/cv-{candidate}-{company}-{YYYY-MM-DD}.tex output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --compile-only`. If `config/profile.yml` sets `cv.page_target`, pass `--max-pages={page_target}`; when the target is a hard requirement, also pass `--strict-pages`. A user may additionally require physical bottom-fill bounds with `--min-bottom-gap-in=N --max-bottom-gap-in=N --strict-fit`. These flags validate the rendered PDF only and never change typography, margins, spacing, or structure.
9. Report: family, slot count, patched count, `.tex` path, `.pdf` path (or compile error)

### Fixed-layout one-page fitting

When the profile or custom instructions require one page, satisfy it through content selection only:

1. Rank source-backed bullets by JD relevance and evidence strength before patching.
2. Preserve all headings and entries required by `_custom.md`.
3. Compile and inspect the `fit` object returned by `generate-latex.mjs`.
4. On page overflow, remove the lowest-ranked removable bullet one at a time and recompile.
5. On excessive bottom whitespace, try omitted bullets from highest to lowest relevance and retain the strongest combination that passes both page and gap bounds.
6. Never insert filler or alter the source/generated layout to pass. If no valid content combination exists, stop with the fit diagnostics and ask the user which content boundary to relax.

Strict bottom-fill measurement requires `pdfinfo` and `pdftotext`. If either is unavailable, strict fit fails rather than silently accepting an unmeasured PDF.

**Requires:** `tectonic` or `pdflatex` on PATH (same as `latex` mode).

## Ethical rules (mandatory)

Same as `modes/latex.md` and `modes/pdf.md`:

- Keywords get **reformulated, never fabricated**
- Never add tools, skills, or metrics the candidate does not already have in the source `.tex` or `cv.md`
- Preserve inline LaTeX markup inside bullets when possible; when rewriting, output **plain text** in patch JSON (the patch script escapes skill labels and content as well as bullet text)
- Do **not** rewrite preamble, macro definitions, section titles, dates, company names, or job titles unless the user explicitly asks

## What this mode does NOT do

- Does not replace `cv.md` as the system source of truth
- Does not parse arbitrary LaTeX templates
- Does not auto-run during auto-pipeline or evaluation
- Does not submit applications

## Relationship to `latex` mode

| Mode | Input | Output |
|------|-------|--------|
| `latex` | `cv.md` | career-ops `templates/cv-template.tex` → `.tex` + PDF |
| `latex-tex` | user's `resume.tex` | same template shape, tailored prose only → `.tex` + PDF |
