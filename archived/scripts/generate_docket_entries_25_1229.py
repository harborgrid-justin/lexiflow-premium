#!/usr/bin/env python3
"""
Helper: Generate INSERTs for docket_entries_insert_25_1229.sql from a simple
pipe-delimited text file of CA4 docket entries.

Input format (one ENTRY per line):

  ENTRY|MM/DD/YYYY|<full docket text>|<ECF URL>

Example:
  ENTRY|03/12/2025|Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. [1001734848] [25-1229] AW|https://ecf.ca4.uscourts.gov/docs1/004010166501

This script will:
  - auto-increment sequence_number
  - parse date_filed from the second field
  - infer type from the full text (Motion, Order, Notice, etc.)
  - set document_title to the first sentence
  - set description to the full text
  - extract ecf_document_number from [1001xxxxxxxx] token
  - leave case_id as a placeholder ({CASE_ID}) so you can either:
      * replace it manually, or
      * wrap in a DO $$ block that selects case_id for 25-1229.

Usage:
  python archived/scripts/generate_docket_entries_25_1229.py \
    input_entries.txt > archived/docket_entries_insert_25_1229.generated.sql
"""

import re
import sys
from datetime import datetime
from typing import List, Tuple


def parse_line(line: str) -> Tuple[str, str, str]:
    parts = [p.strip() for p in line.rstrip("\n").split("|")]
    if len(parts) < 4 or parts[0].upper() != "ENTRY":
        raise ValueError(f"Invalid ENTRY line: {line!r}")
    date_str, text, url = parts[1], parts[2], parts[3]
    return date_str, text, url


def parse_date(date_str: str) -> str:
    """Convert MM/DD/YYYY to YYYY-MM-DD."""
    dt = datetime.strptime(date_str, "%m/%d/%Y")
    return dt.strftime("%Y-%m-%d")


def infer_type(text: str) -> str:
    upper = text.upper()
    if "CERTIFICATE OF SERVICE" in upper or "CERTIFICATE OF COMPLIANCE" in upper:
        return "Filing"
    if "MOTION" in upper:
        return "Motion"
    if "ORDER" in upper or "COURT ORDER" in upper:
        return "Order"
    if "NOTICE" in upper:
        return "Notice"
    if "BRIEF" in upper:
        return "Filing"
    if "JUDGMENT" in upper:
        return "Judgment"
    if "DISCLOSURE STATEMENT" in upper:
        return "Filing"
    return "Filing"


def extract_ecf_number(text: str) -> str:
    m = re.search(r"\[(\d{10,})\]", text)
    return m.group(1) if m else ""


def extract_filed_by(text: str) -> str:
    # Try trailing name pattern "... Justin Saadein-Morales" etc.
    m = re.search(r"\]\s*([^\[\]]+)$", text)
    if m:
        tail = m.group(1).strip()
        # Trim case number brackets and excess whitespace
        tail = re.sub(r"\s+", " ", tail)
        if len(tail) <= 255:
            return tail
    return ""


def first_sentence(text: str) -> str:
    m = re.split(r"(?<=[.!?])\s+", text.strip(), maxsplit=1)
    return m[0][:255]


def generate_inserts(lines: List[str]) -> str:
    seq = 1
    inserts: List[str] = []
    for raw in lines:
        if not raw.strip() or raw.lstrip().startswith("--"):
            continue
        date_str, text, url = parse_line(raw)
        date_sql = parse_date(date_str)
        entry_type = infer_type(text)
        title = first_sentence(text)
        ecf_number = extract_ecf_number(text)
        filed_by = extract_filed_by(text)

        # Escape single quotes for SQL
        esc_title = title.replace("'", "''")
        esc_text = text.replace("'", "''")
        esc_filed_by = filed_by.replace("'", "''")
        esc_url = url.replace("'", "''")

        insert = f"    INSERT INTO docket_entries (\n" \
                 f"        id,\n" \
                 f"        case_id,\n" \
                 f"        sequence_number,\n" \
                 f"        date_filed,\n" \
                 f"        entry_date,\n" \
                 f"        type,\n" \
                 f"        document_title,\n" \
                 f"        description,\n" \
                 f"        filed_by,\n" \
                 f"        ecf_document_number,\n" \
                 f"        ecf_url,\n" \
                 f"        is_sealed,\n" \
                 f"        created_at\n" \
                 f"    ) VALUES (\n" \
                 f"        gen_random_uuid(),\n" \
                 f"        {{CASE_ID}},\n" \
                 f"        {seq},\n" \
                 f"        '{date_sql}',\n" \
                 f"        '{date_sql}',\n" \
                 f"        '{entry_type}',\n" \
                 f"        '{esc_title}',\n" \
                 f"        '{esc_text}',\n" \
                 f"        '{esc_filed_by}',\n" \
                 f"        '{ecf_number}',\n" \
                 f"        '{esc_url}',\n" \
                 f"        FALSE,\n" \
                 f"        CURRENT_TIMESTAMP\n" \
                 f"    );\n"

        inserts.append(insert)
        seq += 1

    return "".join(inserts)


def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: generate_docket_entries_25_1229.py <input_entries.txt>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    with open(input_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    body = generate_inserts(lines)

    # Wrap with DO $$ to resolve case_id for 25-1229
    print("DO $$")
    print("DECLARE")
    print("    v_case_id UUID;")
    print("BEGIN")
    print("    SELECT id INTO v_case_id FROM cases WHERE case_number = '25-1229' LIMIT 1;")
    print("    IF v_case_id IS NULL THEN")
    print("        RAISE EXCEPTION 'Case 25-1229 not found.';")
    print("    END IF;\n")

    # Substitute placeholder
    body = body.replace("{CASE_ID}", "v_case_id")
    print(body.rstrip("\n"))

    print("END $$;")


if __name__ == "__main__":
    main()
