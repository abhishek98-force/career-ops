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
- Compile with `PATH="$PWD/data/bin:$PATH" node generate-latex.mjs ... --compile-only`, run the CV fact gate before reporting success, and reject output containing `Bullet N` or bracketed skills placeholders.

## Output Preferences

<!-- How you like results formatted. Examples:
     - Reports: lead with the score and the one-line verdict.
     - Show the per-step token breakdown after a batch run.
     - Save PDFs date-first: YYYY-MM-DD-company.pdf -->

- Use the protected Calibri-compatible LaTeX layout as the default PDF design.
- Choose employment bullet counts by evidence and JD relevance, not a fixed default: highly relevant roles typically use four to five bullets, moderately relevant roles three to four, and less relevant or older roles two to three. Keep an additional distinct bullet when it materially strengthens the application and the resume remains within the two-page target. Never pad a role, invent evidence, or remove a relevant bullet solely to make role counts uniform. Allow the initial tailored resume to span two pages; do not compress fonts, margins, or spacing to force one page.
- Produce `.tex` and PDF resume files for each application. Do not generate a DOCX companion.

## Off-Limits

<!-- Things the agent must never do for you. Examples:
     - Never auto-fill or submit an application without showing me first.
     - Never edit a system file to customize my setup -- put it here. -->

(none yet -- add yours above)
