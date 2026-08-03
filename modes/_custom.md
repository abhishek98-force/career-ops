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

- Treat `/home/wsl/resume_optimizer/MASTER_RESUME.docx` as a visual-format reference only. Candidate facts must still come from the approved career-ops source files.
- Never modify or overwrite `MASTER_RESUME.docx`. Generate a company-specific copy and verify the source checksum is unchanged.
- Treat `data/templates/Abhishek_Resume_LLM_Flexible_Template_v8.tex` as the protected LaTeX layout source. Never modify it during tailoring; generate a company-specific `.tex` copy under `output/`.

## Custom Workflows

<!-- Multi-step routines you run often, given a short name. Examples:
     - "weekly review": scan my saved portals, evaluate the new roles,
       then give me a one-paragraph summary of the top 3.
     - "prep <company>": pull the JD, generate STAR stories from
       article-digest.md, and draft 5 likely interview questions. -->

- For every tailored resume, use the user-owned `latex.source` selected in `config/profile.yml` and the `latex-tex` extraction/patch pipeline instead of the built-in `templates/cv-template.tex`. This overrides the standard `latex` route when `cv.output_format` is `latex`.
- Map the protected template slots in order: `bullet-0..2` Sedai Labs, `bullet-3..5` Augesys, `bullet-6..8` IpserLabs, `bullet-9..11` Wipro, `bullet-12..13` Boston Liquor License Tracker, `skill-0..2` the three skills rows, and `skill-3` Visual Objects. The protected source intentionally uses only career-ops' officially supported macros so this mapping survives system updates.
- Compile with `PATH="$PWD/data/bin:$PATH" node generate-latex.mjs ... --compile-only`, run the CV fact gate before reporting success, and reject output containing `Bullet N` or bracketed skills placeholders.
- Generate a matching editable DOCX from the same tailored content with `build-cv-docx.py` and the configured `cv.word_template`. Verify the Word source checksum remains unchanged.

## Output Preferences

<!-- How you like results formatted. Examples:
     - Reports: lead with the score and the one-line verdict.
     - Show the per-step token breakdown after a batch run.
     - Save PDFs date-first: YYYY-MM-DD-company.pdf -->

- Use the protected Calibri-compatible LaTeX layout as the default PDF design; retain the Word Classic layout for the editable DOCX companion.
- Default to three bullets per employment role. Use two when a role is less relevant or space is better spent on stronger evidence. Never pad a role to reach three bullets. Allow the initial tailored resume to span two pages; do not compress fonts, margins, or spacing to force one page.
- Produce `.tex`, PDF, and DOCX resume files for each application.

## Off-Limits

<!-- Things the agent must never do for you. Examples:
     - Never auto-fill or submit an application without showing me first.
     - Never edit a system file to customize my setup -- put it here. -->

(none yet -- add yours above)
