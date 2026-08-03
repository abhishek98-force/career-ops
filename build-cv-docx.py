#!/usr/bin/env python3
"""Build a tailored DOCX by cloning paragraph styles from a master resume.

The script uses only Python's standard library. It preserves the source DOCX
package and replaces word/document.xml in the generated copy. The source file
is never modified.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import sys
import xml.etree.ElementTree as ET
from copy import deepcopy
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = f"{{{W_NS}}}"
MC_NS = "http://schemas.openxmlformats.org/markup-compatibility/2006"
ET.register_namespace("w", W_NS)


def paragraph_text(paragraph: ET.Element) -> str:
    return "".join(node.text or "" for node in paragraph.iter(W + "t"))


def clone_run_properties(paragraph: ET.Element, bold: bool) -> ET.Element | None:
    for run in paragraph.findall(W + "r"):
        props = run.find(W + "rPr")
        if props is None:
            continue
        is_bold = props.find(W + "b") is not None
        if is_bold == bold:
            return deepcopy(props)
    return None


def clear_content(paragraph: ET.Element) -> None:
    for child in list(paragraph):
        if child.tag != W + "pPr":
            paragraph.remove(child)


def add_run(
    paragraph: ET.Element,
    text: str = "",
    *,
    run_properties: ET.Element | None = None,
    tab: bool = False,
) -> None:
    run = ET.SubElement(paragraph, W + "r")
    if run_properties is not None:
        run.append(deepcopy(run_properties))
    if tab:
        ET.SubElement(run, W + "tab")
        return
    text_node = ET.SubElement(run, W + "t")
    if text.startswith(" ") or text.endswith(" "):
        text_node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    text_node.text = text


def replace_runs(
    paragraph: ET.Element,
    parts: list[tuple[str, ET.Element | None, bool]],
) -> ET.Element:
    result = deepcopy(paragraph)
    clear_content(result)
    for text, properties, is_tab in parts:
        add_run(result, text, run_properties=properties, tab=is_tab)
    return result


def required_text(value: object, label: str) -> str:
    text = str(value or "").strip()
    if not text:
        raise ValueError(f"Missing required value: {label}")
    return text


def load_prototypes(root: ET.Element) -> tuple[ET.Element, dict[str, ET.Element]]:
    body = root.find(".//" + W + "body")
    if body is None:
        raise ValueError("Template is missing word/document.xml body")

    paragraphs = body.findall(W + "p")
    by_text = {paragraph_text(p).strip(): p for p in paragraphs if paragraph_text(p).strip()}
    required = [
        "SKILLS",
        "RELEVANT EXPERIENCE",
        "OPEN SOURCE CONTRIBUTIONS",
        "SELECT PROJECTS",
        "EDUCATION",
    ]
    missing = [name for name in required if name not in by_text]
    if missing:
        raise ValueError(f"Word template is missing sections: {', '.join(missing)}")

    def first_after(title: str, *, style: str | None = None) -> ET.Element:
        start = paragraphs.index(by_text[title]) + 1
        for paragraph in paragraphs[start:]:
            text = paragraph_text(paragraph).strip()
            if not text:
                continue
            if text in required:
                break
            ppr = paragraph.find(W + "pPr")
            pstyle = ppr.find(W + "pStyle") if ppr is not None else None
            value = pstyle.get(W + "val") if pstyle is not None else ""
            if style is None or value == style:
                return paragraph
        raise ValueError(f"No paragraph prototype found after {title}")

    name = next((p for p in paragraphs if "Abhishek" in paragraph_text(p)), None)
    contact = [p for p in paragraphs if "Location:" in paragraph_text(p) or "Portfolio:" in paragraph_text(p)]
    if name is None or len(contact) < 2:
        raise ValueError("Word template is missing the expected header structure")

    prototypes = {
        "name": name,
        "contact_1": contact[0],
        "contact_2": contact[1],
        "skills_heading": by_text["SKILLS"],
        "skill": first_after("SKILLS", style="ListParagraph"),
        "experience_heading": by_text["RELEVANT EXPERIENCE"],
        "role": first_after("RELEVANT EXPERIENCE"),
        "bullet": first_after("RELEVANT EXPERIENCE", style="ListParagraph"),
        "open_source_heading": by_text["OPEN SOURCE CONTRIBUTIONS"],
        "open_source_role": first_after("OPEN SOURCE CONTRIBUTIONS"),
        "open_source_bullet": first_after("OPEN SOURCE CONTRIBUTIONS", style="ListParagraph"),
        "projects_heading": by_text["SELECT PROJECTS"],
        "project": first_after("SELECT PROJECTS", style="ListParagraph"),
        "education_heading": by_text["EDUCATION"],
        "education": first_after("EDUCATION", style="ListParagraph"),
    }
    return body, prototypes


def build_document_xml(document_xml: bytes, payload: dict) -> bytes:
    for _, namespace in ET.iterparse(io.BytesIO(document_xml), events=("start-ns",)):
        prefix, uri = namespace
        try:
            ET.register_namespace(prefix or "", uri)
        except ValueError:
            # ElementTree reserves generated nsN prefixes. The named OOXML
            # prefixes referenced by mc:Ignorable are registered successfully.
            pass
    root = ET.fromstring(document_xml)
    # ElementTree emits namespace declarations only for prefixes still used in
    # element or attribute names. The master document's mc:Ignorable list names
    # several extension prefixes that disappear when the body is rebuilt; Word
    # rejects the package if that list retains undeclared prefixes.
    root.set(f"{{{MC_NS}}}Ignorable", "w14")
    body, p = load_prototypes(root)
    section_properties = body.find(W + "sectPr")
    if section_properties is None:
        raise ValueError("Word template is missing page setup")

    bold_props = clone_run_properties(p["skill"], True)
    normal_props = clone_run_properties(p["skill"], False)
    if normal_props is None:
        normal_props = clone_run_properties(p["bullet"], False)
    name_props = clone_run_properties(p["name"], True)
    heading_props = clone_run_properties(p["skills_heading"], True)
    role_props = clone_run_properties(p["role"], True)
    project_bold_props = clone_run_properties(p["project"], True)
    if project_bold_props is None:
        project_bold_props = bold_props
    project_normal_props = clone_run_properties(p["project"], False)
    if project_normal_props is None:
        project_normal_props = normal_props

    candidate = payload.get("candidate") or {}
    name = required_text(candidate.get("name"), "candidate.name")
    phone = required_text(candidate.get("phone"), "candidate.phone")
    email = required_text(candidate.get("email"), "candidate.email")
    location = required_text(candidate.get("location"), "candidate.location")
    portfolio = candidate.get("portfolio") or candidate.get("github") or {}
    portfolio_text = required_text(portfolio.get("display") or portfolio.get("url"), "candidate portfolio")

    new_children: list[ET.Element] = []
    new_children.append(replace_runs(p["name"], [(name, name_props, False)]))
    new_children.append(
        replace_runs(
            p["contact_1"],
            [
                ("Location: ", bold_props, False),
                (location + "  ", normal_props, False),
                ("Phone: ", bold_props, False),
                (phone, normal_props, False),
            ],
        )
    )
    new_children.append(
        replace_runs(
            p["contact_2"],
            [
                ("Portfolio: ", bold_props, False),
                (portfolio_text + "  ", normal_props, False),
                ("Email: ", bold_props, False),
                (email, normal_props, False),
            ],
        )
    )

    new_children.append(replace_runs(p["skills_heading"], [("SKILLS", heading_props, False)]))
    for skill in payload.get("skills") or []:
        category = required_text(skill.get("category"), "skills.category")
        items = skill.get("items") or ""
        if isinstance(items, list):
            items = ", ".join(str(item) for item in items if item)
        new_children.append(
            replace_runs(
                p["skill"],
                [(category + ": ", bold_props, False), (required_text(items, "skills.items"), normal_props, False)],
            )
        )

    new_children.append(
        replace_runs(p["experience_heading"], [("RELEVANT EXPERIENCE", heading_props, False)])
    )
    for entry in payload.get("experience") or []:
        heading = required_text(entry.get("heading") or entry.get("company"), "experience.heading")
        dates = required_text(entry.get("dates") or entry.get("period"), "experience.dates")
        new_children.append(
            replace_runs(
                p["role"],
                [(heading, role_props, False), ("", role_props, True), (dates, role_props, False)],
            )
        )
        for bullet in entry.get("bullets") or []:
            new_children.append(replace_runs(p["bullet"], [(required_text(bullet, "experience bullet"), normal_props, False)]))

    open_source = [item for item in payload.get("projects") or [] if item.get("kind") == "open_source"]
    if open_source:
        new_children.append(
            replace_runs(p["open_source_heading"], [("OPEN SOURCE CONTRIBUTIONS", heading_props, False)])
        )
        for item in open_source:
            title = required_text(item.get("name"), "open source name")
            new_children.append(replace_runs(p["open_source_role"], [(title, role_props, False)]))
            description = item.get("description") or ""
            bullets = item.get("bullets") or ([description] if description else [])
            for bullet in bullets:
                new_children.append(
                    replace_runs(p["open_source_bullet"], [(required_text(bullet, "open source bullet"), normal_props, False)])
                )

    projects = [item for item in payload.get("projects") or [] if item.get("kind") != "open_source"]
    if projects:
        new_children.append(replace_runs(p["projects_heading"], [("SELECT PROJECTS", heading_props, False)]))
        for item in projects:
            title = required_text(item.get("name"), "project name")
            description = item.get("description") or " ".join(item.get("bullets") or [])
            new_children.append(
                replace_runs(
                    p["project"],
                    [(title + ": ", project_bold_props, False), (required_text(description, "project description"), project_normal_props, False)],
                )
            )

    new_children.append(replace_runs(p["education_heading"], [("EDUCATION", heading_props, False)]))
    for item in payload.get("education") or []:
        title = required_text(item.get("title"), "education.title")
        org = required_text(item.get("org"), "education.org")
        year = required_text(item.get("year"), "education.year")
        title_and_org = f"{title} {org}" if title.endswith(",") else f"{title}, {org}"
        new_children.append(
            replace_runs(
                p["education"],
                [(title_and_org, normal_props, False), ("", normal_props, True), (year, normal_props, False)],
            )
        )

    for child in list(body):
        body.remove(child)
    for child in new_children:
        body.append(child)
    body.append(deepcopy(section_properties))

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def extract_text(document_xml: bytes) -> str:
    root = ET.fromstring(document_xml)
    paragraphs = root.findall(".//" + W + "body/" + W + "p")
    return "\n".join(text for text in (paragraph_text(p).strip() for p in paragraphs) if text) + "\n"


def build_docx(
    template: Path,
    payload_path: Path,
    output: Path,
    text_output: Path | None = None,
) -> dict:
    template_hash_before = sha256(template)
    payload = json.loads(payload_path.read_text(encoding="utf-8"))

    with ZipFile(template, "r") as source:
        document_xml = source.read("word/document.xml")
        rendered_xml = build_document_xml(document_xml, payload)
        output.parent.mkdir(parents=True, exist_ok=True)
        with ZipFile(output, "w", compression=ZIP_DEFLATED) as target:
            for info in source.infolist():
                data = rendered_xml if info.filename == "word/document.xml" else source.read(info.filename)
                target.writestr(info, data)

    template_hash_after = sha256(template)
    if template_hash_before != template_hash_after:
        output.unlink(missing_ok=True)
        raise RuntimeError("Source Word template changed during generation")

    with ZipFile(output, "r") as generated:
        final_document_xml = generated.read("word/document.xml")
        ET.fromstring(final_document_xml)

    if text_output is not None:
        text_output.parent.mkdir(parents=True, exist_ok=True)
        text_output.write_text(extract_text(final_document_xml), encoding="utf-8")

    return {
        "template": str(template),
        "template_sha256": template_hash_after,
        "output": str(output),
        "output_bytes": output.stat().st_size,
        "source_unchanged": True,
        "text_output": str(text_output) if text_output is not None else None,
        "experience_entries": len(payload.get("experience") or []),
        "project_entries": len(payload.get("projects") or []),
        "education_entries": len(payload.get("education") or []),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a tailored DOCX from a Word resume template")
    parser.add_argument("template", type=Path)
    parser.add_argument("payload", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--text-output", type=Path)
    args = parser.parse_args()

    for path, label in [(args.template, "template"), (args.payload, "payload")]:
        if not path.is_file():
            parser.error(f"{label} file not found: {path}")
    if args.output.resolve() == args.template.resolve():
        parser.error("output must not overwrite the source template")

    try:
        result = build_docx(
            args.template.resolve(),
            args.payload.resolve(),
            args.output.resolve(),
            args.text_output.resolve() if args.text_output else None,
        )
    except Exception as exc:
        print(f"DOCX generation failed: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
