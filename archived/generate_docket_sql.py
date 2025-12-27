#!/usr/bin/env python3
"""
Enterprise Agent 3: Docket Entries Loader
Generate SQL INSERT statements for all docket entries
"""

import xml.etree.ElementTree as ET
import uuid
import re
from datetime import datetime
from collections import Counter

# XML file path
XML_FILE = "04_24-2160_Docket.xml"
SQL_OUTPUT = "docket_entries_insert.sql"

def parse_date(date_str):
    """Convert MM/DD/YYYY to YYYY-MM-DD"""
    if not date_str:
        return None
    try:
        dt = datetime.strptime(date_str, "%m/%d/%Y")
        return dt.strftime("%Y-%m-%d")
    except:
        return None

def extract_type(text):
    """Extract document type from docket text"""
    text_upper = text.upper()

    # Order matters - check specific patterns first
    if "CERTIFICATE OF SERVICE" in text_upper or "CERT OF SERVICE" in text_upper:
        return "Certificate"
    elif "CERTIFICATE" in text_upper:
        return "Certificate"
    elif "MOTION" in text_upper:
        return "Motion"
    elif "ORDER" in text_upper:
        return "Order"
    elif "RESPONSE" in text_upper or "OPPOSITION" in text_upper:
        return "Response"
    elif "REPLY" in text_upper:
        return "Reply"
    elif "NOTICE" in text_upper:
        return "Notice"
    elif "BRIEF" in text_upper or "MEMORANDUM" in text_upper:
        return "Brief"
    elif "APPEAL" in text_upper:
        return "Appeal"
    elif "PETITION" in text_upper:
        return "Petition"
    elif "TRANSCRIPT" in text_upper:
        return "Transcript"
    elif "JUDGMENT" in text_upper:
        return "Judgment"
    elif "DOCKETING STATEMENT" in text_upper:
        return "Statement"
    elif "APPENDIX" in text_upper:
        return "Appendix"
    elif "EXHIBITS" in text_upper or "EXHIBIT" in text_upper:
        return "Exhibit"
    else:
        return "Filing"

def extract_filed_by(text):
    """Extract who filed the document"""
    # Pattern: "by [Name]"
    match = re.search(r'\bby\s+([^\.]+?)(?:\.|$)', text, re.IGNORECASE)
    if match:
        filed_by = match.group(1).strip()
        # Clean up common patterns
        filed_by = re.sub(r'\s*\([^)]*\)\s*', ' ', filed_by).strip()
        if len(filed_by) > 255:
            filed_by = filed_by[:255]
        return filed_by
    return None

def extract_ecf_number(text):
    """Extract ECF number from [10010xxxxx] pattern"""
    match = re.search(r'\[(\d{10,})\]', text)
    if match:
        return match.group(1)
    return None

def get_title(text):
    """Get shortened title from text"""
    # Remove case number patterns like [24-2160]
    cleaned = re.sub(r'\[\d{2}-\d{4}\]', '', text)
    # Remove ECF numbers
    cleaned = re.sub(r'\[\d{10,}\]', '', cleaned)
    # Clean up whitespace
    cleaned = ' '.join(cleaned.split())
    # Limit to 1000 chars
    if len(cleaned) > 1000:
        return cleaned[:997] + "..."
    return cleaned

def sql_escape(value):
    """Escape strings for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    # Escape single quotes
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def main():
    print("=" * 80)
    print("AGENT 3: DOCKET ENTRIES LOADER (SQL GENERATOR)")
    print("=" * 80)
    print()

    # Parse XML file
    print(f"[1/4] Parsing XML file: {XML_FILE}")
    try:
        tree = ET.parse(XML_FILE)
        root = tree.getroot()
    except Exception as e:
        print(f"ERROR: Failed to parse XML: {e}")
        return

    # Find all docketText elements
    print("[2/4] Extracting docketText entries...")
    docket_texts = root.findall('.//docketText')

    if not docket_texts:
        print("ERROR: No docketText elements found in XML")
        return

    total_entries = len(docket_texts)
    print(f"✓ Found {total_entries} docket entries")
    print()

    # Parse entries
    print("[3/4] Parsing docket entry data...")
    entries = []
    type_counter = Counter()
    dates = []

    for idx, docket_text in enumerate(docket_texts, 1):
        date_filed = docket_text.get('dateFiled', '')
        text = docket_text.get('text', '')
        doc_link = docket_text.get('docLink', '')

        # Parse data
        parsed_date = parse_date(date_filed)
        doc_type = extract_type(text)
        filed_by = extract_filed_by(text)
        ecf_number = extract_ecf_number(text)
        title = get_title(text)

        # Track statistics
        type_counter[doc_type] += 1
        if parsed_date:
            dates.append(parsed_date)

        entry = {
            'id': str(uuid.uuid4()),
            'sequence_number': idx,
            'date_filed': parsed_date,
            'type': doc_type,
            'title': title,
            'description': text,
            'filed_by': filed_by,
            'ecf_number': ecf_number,
            'doc_link': doc_link
        }
        entries.append(entry)

    # Print statistics
    print(f"✓ Parsed {len(entries)} entries")
    print()
    print("Entry Type Distribution:")
    for doc_type, count in sorted(type_counter.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {count:3d} {doc_type}(s)")

    if dates:
        dates_sorted = sorted(dates)
        print()
        print(f"Date Range: {dates_sorted[0]} to {dates_sorted[-1]}")
    print()

    # Generate SQL
    print(f"[4/4] Generating SQL INSERT statements...")
    with open(SQL_OUTPUT, 'w') as f:
        f.write("-- Docket Entries INSERT Statements\n")
        f.write(f"-- Generated from: {XML_FILE}\n")
        f.write(f"-- Total entries: {total_entries}\n")
        f.write(f"-- Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("\n")
        f.write("-- First, get the case_id for case 24-2160\n")
        f.write("DO $$\n")
        f.write("DECLARE\n")
        f.write("    v_case_id UUID;\n")
        f.write("BEGIN\n")
        f.write("    -- Get case_id\n")
        f.write("    SELECT id INTO v_case_id FROM cases WHERE case_number = '24-2160';\n")
        f.write("\n")
        f.write("    IF v_case_id IS NULL THEN\n")
        f.write("        RAISE EXCEPTION 'Case 24-2160 not found';\n")
        f.write("    END IF;\n")
        f.write("\n")
        f.write("    -- Insert docket entries\n")

        for entry in entries:
            date_val = sql_escape(entry['date_filed']) if entry['date_filed'] else 'NULL'

            f.write(f"    INSERT INTO docket_entries (id, case_id, sequence_number, date_filed, type, title, description, filed_by, is_sealed, ecf_number, created_at)\n")
            f.write(f"    VALUES (\n")
            f.write(f"        {sql_escape(entry['id'])},\n")
            f.write(f"        v_case_id,\n")
            f.write(f"        {entry['sequence_number']},\n")
            f.write(f"        {date_val},\n")
            f.write(f"        {sql_escape(entry['type'])},\n")
            f.write(f"        {sql_escape(entry['title'])},\n")
            f.write(f"        {sql_escape(entry['description'])},\n")
            f.write(f"        {sql_escape(entry['filed_by'])},\n")
            f.write(f"        FALSE,\n")
            f.write(f"        {sql_escape(entry['ecf_number'])},\n")
            f.write(f"        CURRENT_TIMESTAMP\n")
            f.write(f"    );\n")
            f.write("\n")

        f.write("    RAISE NOTICE 'Successfully inserted % docket entries', {0};\n".format(total_entries))
        f.write("END $$;\n")
        f.write("\n")
        f.write("-- Verify insertion\n")
        f.write("SELECT COUNT(*) as total_entries, MIN(date_filed) as earliest_date, MAX(date_filed) as latest_date\n")
        f.write("FROM docket_entries\n")
        f.write("WHERE case_id = (SELECT id FROM cases WHERE case_number = '24-2160');\n")

    print(f"✓ SQL file generated: {SQL_OUTPUT}")
    print()

    # Show sample entries
    print("Sample Entries (first 5):")
    print("-" * 80)
    for i, entry in enumerate(entries[:5], 1):
        print(f"{i}. [{entry['date_filed']}] {entry['type']}: {entry['title'][:60]}...")
        if entry['filed_by']:
            print(f"   Filed by: {entry['filed_by']}")
        print()

    print("=" * 80)
    print("SUMMARY REPORT")
    print("=" * 80)
    print(f"Total entries found in XML: {total_entries}")
    print(f"SQL statements generated:   {total_entries}")
    print()
    print("Entry Type Summary:")
    for doc_type, count in sorted(type_counter.items(), key=lambda x: x[1], reverse=True):
        print(f"  {count:3d} {doc_type}(s)")
    print()
    if dates:
        print(f"Date Range: {dates_sorted[0]} to {dates_sorted[-1]}")
    print()
    print(f"Output File: {SQL_OUTPUT}")
    print()
    print("To execute: psql [connection-string] < docket_entries_insert.sql")
    print()
    print("✓ AGENT 3 SQL GENERATION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
