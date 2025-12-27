#!/usr/bin/env python3
"""
Enterprise Agent 3: Docket Entries Loader (using pg8000)
Parse all docket entries from XML and load into PostgreSQL
"""

import xml.etree.ElementTree as ET
import pg8000.native
import uuid
import re
from datetime import datetime
from collections import Counter

# Database connection parameters
DB_PARAMS = {
    "user": "neondb_owner",
    "password": "npg_u71zdejvgHOR",
    "host": "ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech",
    "database": "neondb",
    "port": 5432,
    "ssl_context": True
}

# XML file path - update to Windows path
XML_FILE = "C:\\temp\\lexiflow-premium\\04_24-2160_Docket.xml"

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
    match = re.search(r'\bby\s+([^\.]+?)(?:\.|$)', text, re.IGNORECASE)
    if match:
        filed_by = match.group(1).strip()
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
    cleaned = re.sub(r'\[\d{2}-\d{4}\]', '', text)
    cleaned = re.sub(r'\[\d{10,}\]', '', cleaned)
    cleaned = ' '.join(cleaned.split())
    if len(cleaned) > 500:
        cleaned = cleaned[:497] + '...'
    return cleaned

def parse_case_info(xml_file):
    """Parse case summary information from XML"""
    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        stub = root.find('.//stub')
        if stub is not None:
            return {
                'case_number': stub.get('caseNumber', ''),
                'date_filed': parse_date(stub.get('dateFiled', '')),
                'nature_of_suit': stub.get('natureOfSuit', ''),
                'short_title': stub.get('shortTitle', ''),
                'orig_court': stub.get('origCourt', '')
            }
    except Exception as e:
        print(f"ERROR parsing case info: {e}")
    return None

def parse_docket_entries(xml_file):
    """Parse XML file and extract docket entries"""
    print(f"Parsing XML file: {xml_file}")

    try:
        tree = ET.parse(xml_file)
        root = tree.getroot()
    except Exception as e:
        print(f"ERROR parsing XML: {e}")
        return []

    entries = []

    for entry in root.findall('.//docketText'):
        try:
            date_filed_str = entry.get('dateFiled', '')
            text = entry.get('text', '')

            # Skip if no text
            if not text:
                continue

            # Generate sequential entry number
            entry_number = str(len(entries) + 1)

            date_filed = parse_date(date_filed_str)
            doc_type = extract_type(text)
            filed_by = extract_filed_by(text)
            ecf_number = extract_ecf_number(text)
            title = get_title(text)

            entry_data = {
                'entry_number': entry_number,
                'date_filed': date_filed,
                'date_filed_str': date_filed_str,
                'text': text,
                'type': doc_type,
                'filed_by': filed_by,
                'ecf_number': ecf_number,
                'title': title
            }

            entries.append(entry_data)

        except Exception as e:
            print(f"ERROR processing entry: {e}")
            continue

    print(f"Total entries parsed: {len(entries)}")
    return entries

def get_or_create_case(conn, case_info):
    """Get case_id or create case if it doesn't exist"""
    try:
        # Check if case exists
        result = conn.run("SELECT id FROM cases WHERE case_number = :case_num", case_num=case_info['case_number'])
        if result:
            case_id = result[0][0]
            print(f"✓ Found existing case: {case_info['case_number']} (ID: {case_id})")
            return case_id
        
        # Create new case
        case_id = str(uuid.uuid4())
        conn.run(
            """
            INSERT INTO cases (
                id, case_number, title, court, filing_date, nature_of_suit,
                status, created_at, updated_at
            )
            VALUES (
                :id, :case_number, :title, :court, :filing_date, :nature_of_suit,
                :status, :created_at, :updated_at
            )
            """,
            id=case_id,
            case_number=case_info['case_number'],
            title=case_info['short_title'],
            court=case_info['orig_court'],
            filing_date=case_info['date_filed'],
            nature_of_suit=case_info['nature_of_suit'],
            status='Active',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        print(f"✓ Created case: {case_info['case_number']} (ID: {case_id})")
        return case_id
        
    except Exception as e:
        print(f"ERROR with case: {e}")
        return None

def insert_docket_entries(conn, case_id, entries):
    """Insert docket entries into database"""
    print(f"\nInserting {len(entries)} docket entries...")

    inserted = 0
    skipped = 0

    for entry in entries:
        try:
            docket_id = str(uuid.uuid4())

            # Check if entry already exists
            existing = conn.run(
                "SELECT id FROM docket_entries WHERE case_id = :case_id AND sequence_number = :seq_num",
                case_id=case_id,
                seq_num=entry['entry_number']
            )

            if existing:
                print(f"  Entry {entry['entry_number']} already exists, skipping")
                skipped += 1
                continue

            # Insert the docket entry
            conn.run(
                """
                INSERT INTO docket_entries (
                    id, case_id, sequence_number, date_filed, text, type,
                    filed_by, ecf_document_number, document_title, description, created_at, updated_at
                )
                VALUES (
                    :id, :case_id, :seq_num, :date_filed, :text, :type,
                    :filed_by, :ecf_num, :doc_title, :description, :created_at, :updated_at
                )
                """,
                id=docket_id,
                case_id=case_id,
                seq_num=entry['entry_number'],
                date_filed=entry['date_filed'],
                text=entry['text'],
                type=entry['type'],
                filed_by=entry['filed_by'],
                ecf_num=entry['ecf_number'],
                doc_title=entry['title'],
                description=entry['text'][:500] if entry['text'] else None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            inserted += 1
            print(f"  ✓ Inserted entry {entry['entry_number']}: {entry['title'][:50]}")

        except Exception as e:
            print(f"  ERROR inserting entry {entry.get('entry_number', '?')}: {e}")
            continue

    print(f"\nInserted: {inserted}, Skipped: {skipped}")

def print_statistics(entries):
    """Print statistics about the entries"""
    print("\n" + "="*80)
    print("DOCKET ENTRIES STATISTICS")
    print("="*80)

    print(f"\nTotal Entries: {len(entries)}")

    # Type distribution
    types = Counter(e['type'] for e in entries)
    print("\nDocument Types:")
    for doc_type, count in types.most_common():
        print(f"  {doc_type}: {count}")

    # Parties filing
    filers = Counter(e['filed_by'] for e in entries if e['filed_by'])
    print("\nTop Filers:")
    for filer, count in filers.most_common(10):
        print(f"  {filer}: {count}")

    # Date range
    dates = [e['date_filed'] for e in entries if e['date_filed']]
    if dates:
        print(f"\nDate Range: {min(dates)} to {max(dates)}")

def main():
    print("Enterprise Agent 3: Docket Entries Loader")
    print("="*80)

    try:
        # Parse case information
        print("Parsing case information...")
        case_info = parse_case_info(XML_FILE)
        if not case_info:
            print("ERROR: Could not parse case information")
            return
        
        print(f"✓ Case: {case_info['case_number']} - {case_info['short_title']}")

        # Parse XML
        entries = parse_docket_entries(XML_FILE)

        if not entries:
            print("ERROR: No entries parsed")
            return

        # Print statistics
        print_statistics(entries)

        # Connect to database
        print("\nConnecting to database...")
        conn = pg8000.native.Connection(**DB_PARAMS)
        print("✓ Connected")

        # Get or create case
        case_id = get_or_create_case(conn, case_info)
        if not case_id:
            print("ERROR: Cannot proceed without case_id")
            conn.close()
            return

        # Insert entries
        insert_docket_entries(conn, case_id, entries)

        # Close connection
        conn.close()
        print("\n✓ Complete")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
