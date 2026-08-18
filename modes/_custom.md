# Custom Instructions -- career-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Put your own house rules, custom workflows, and automations
     here -- anything you want the agent to ALWAYS do (or never do).

     This is for PROCEDURAL rules ("HOW I want things done").
     For WHO you are (archetypes, narrative, comp, negotiation),
     use modes/_profile.md instead. Keeping the two separate keeps
     each one readable.

     The agent reads this file alongside the system instructions;
     your rules here take precedence over the defaults, as long as
     they don't break the Data Contract (your files are never
     touched, and we never auto-submit an application for you).

     Because this is a user-layer file, anything you write here
     survives `node update-system.mjs`. Put customizations HERE,
     not in CLAUDE.md / modes/_shared.md / other system files --
     those get overwritten on update.
     ============================================================ -->

## House Rules

<!-- Rules the agent should always follow. Examples:
     - Always write evaluation summaries in British English.
     - Never include a photo in my CV (US / ATS-first market).
     - Cap each batch run at 20 listings unless I say otherwise.
     - If a report scores below 6, skip the cover letter. -->

- Treat `data/templates/Abhishek_Resume_LLM_Flexible_Template_v8.tex` as the protected LaTeX layout source. Never modify it during tailoring; generate a company-specific `.tex` copy under `output/`.

## Custom Workflows

<!-- Multi-step routines you run often, given a short name. Examples:
     - "weekly review": scan my saved portals, evaluate the new roles,
       then give me a one-paragraph summary of the top 3.
     - "prep <company>": pull the JD, generate STAR stories from
       article-digest.md, and draft 5 likely interview questions. -->

- For every tailored resume, use the user-owned `latex.source` selected in `config/profile.yml` and the `latex-tex` extraction/patch pipeline instead of the built-in `templates/cv-template.tex`. This overrides the standard `latex` route when `cv.output_format` is `latex`.
- Map the protected template slots in order: `bullet-0..5` Sedai Labs, `bullet-6..12` Augesys, `bullet-13..16` IpserLabs, `bullet-17..20` Wipro, `bullet-21..22` Boston Liquor License Tracker, `skill-0..4` the five removable skills rows, and `project-0` Visual Objects. The protected source intentionally uses only career-ops' officially supported macros so this mapping survives system updates.
- For every employment slot in the protected template, either patch it with a distinct, source-backed bullet or explicitly remove it with `{ "remove": true }`. Select all distinct JD-relevant evidence before removing slots; do not converge on the same bullet count for every role merely for visual uniformity. Put the strongest evidence in the earliest slot IDs for that role.
- Organize skills adaptively for each JD. Use three to five coherent categories, defaulting to four. Keep programming languages separate; group every other verified skill by role-relevant function; patch both each skill row's `label` and `text`; remove unused rows; never duplicate a skill across categories; never pad a category or add an unsupported skill.
- Compile with `PATH="$PWD/data/bin:$PATH" node generate-latex.mjs ... --compile-only --max-pages=1 --strict-pages --min-bottom-gap-in=0.35 --max-bottom-gap-in=0.70 --strict-fit`, run the CV fact gate before reporting success, and reject output containing `Bullet N` or bracketed skills placeholders.
- Treat the one-page balanced-fill gate as a content-selection loop, never a layout-adjustment loop. Rank every source-backed bullet by JD relevance and evidence strength. If the draft exceeds one page, remove the lowest-ranked removable bullet one at a time. Once it fits, test omitted bullets from strongest to weakest and restore the strongest combination that remains one page with a physical bottom gap between 0.35 and 0.70 inches. Never add weak filler solely to occupy space. If no valid combination exists, report the fit failure instead of changing the template.
- Preserve every existing employment heading, the open-source entry, the Visual Objects project, and both education entries in every one-page resume. Keep at least one distinct, source-backed bullet under each employer and the open-source entry. Only achievement bullets, skill rows, and project prose may be removed or rewritten through the supported patch slots.
- Never change the protected template or generated copy's font family, font size, margins, line spacing, section order, section headings, employer names, role titles, dates, project name, education structure, or LaTeX macros to satisfy the one-page gate. Normalize candidate identity and location in the generated company-specific copy from `config/profile.yml` without modifying the protected source or its visual structure.

## Output Preferences

<!-- How you like results formatted. Examples:
     - Reports: lead with the score and the one-line verdict.
     - Show the per-step token breakdown after a batch run.
     - Save PDFs date-first: YYYY-MM-DD-company.pdf -->

- Use the protected Calibri-compatible LaTeX layout as the default PDF design.
- Choose employment bullet counts by evidence and JD relevance, not a fixed default. Keep an additional distinct bullet only when it materially strengthens the application and the resume still passes the strict one-page balanced-fill gate. Never pad a role, invent evidence, remove an entry, or alter fonts, margins, spacing, macros, or section structure to force one page.
- Produce `.tex` and PDF resume files for each application. Do not generate a DOCX companion.

## Off-Limits

<!-- Things the agent must never do for you. Examples:
     - Never auto-fill or submit an application without showing me first.
     - Never edit a system file to customize my setup -- put it here. -->

(none yet -- add yours above)
