#!/usr/bin/env python3
"""
Enterprise Agent 3: Docket Entries Loader
Parse all docket entries from XML and load into PostgreSQL
"""

import xml.etree.ElementTree as ET
try:
    import pg8000.native
except ImportError:
    print("ERROR: pg8000 is not installed. Please install it using:")
    print("  pip install pg8000")
    exit(1)
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

# XML file path
XML_FILE = "/home/user/lexiflow-premium/04_24-2160_Docket.xml"

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

def main():
    print("=" * 80)
    print("AGENT 3: DOCKET ENTRIES LOADER")
    print("=" * 80)
    print()

    # Parse XML file
    print(f"[1/5] Parsing XML file: {XML_FILE}")
    try:
        tree = ET.parse(XML_FILE)
        root = tree.getroot()
    except Exception as e:
        print(f"ERROR: Failed to parse XML: {e}")
        return

    # Find all docketText elements
    print("[2/5] Extracting docketText entries...")
    docket_texts = root.findall('.//docketText')

    if not docket_texts:
        print("ERROR: No docketText elements found in XML")
        return

    total_entries = len(docket_texts)
    print(f"✓ Found {total_entries} docket entries")
    print()

    # Parse entries
    print("[3/5] Parsing docket entry data...")
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

    # Connect to database
    print("[4/5] Connecting to PostgreSQL database...")
    try:
        conn = pg8000.native.Connection(**DB_PARAMS)
        cur = conn.cursor()
        print("✓ Connected to database")
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        return

    # Get case_id for case_number = '24-2160'
    print()
    print("[5/5] Loading docket entries into database...")
    try:
        cur.execute("SELECT id FROM cases WHERE case_number = %s", ('24-2160',))
        result = cur.fetchone()

        if not result:
            print("ERROR: Case 24-2160 not found in database")
            print("Please run Agent 1 first to load case metadata")
            cur.close()
            conn.close()
            return

        case_id = result[0]
        print(f"✓ Found case_id: {case_id}")
        print()

        # Insert docket entries
        inserted = 0
        errors = []

        for entry in entries:
            try:
                entry_id = str(uuid.uuid4())

                cur.execute("""
                    INSERT INTO docket_entries (
                        id, case_id, sequence_number, date_filed, type,
                        title, description, filed_by, is_sealed, ecf_number,
                        created_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP
                    )
                """, (
                    entry_id,
                    case_id,
                    entry['sequence_number'],
                    entry['date_filed'],
                    entry['type'],
                    entry['title'],
                    entry['description'],
                    entry['filed_by'],
                    False,  # is_sealed
                    entry['ecf_number']
                ))

                inserted += 1

                if inserted % 10 == 0:
                    print(f"  Inserted {inserted}/{total_entries} entries...")

            except Exception as e:
                errors.append(f"Entry {entry['sequence_number']}: {str(e)}")

        # Commit transaction
        conn.commit()
        print(f"✓ Successfully inserted {inserted} docket entries")

        if errors:
            print()
            print(f"⚠ Encountered {len(errors)} errors:")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(errors) > 5:
                print(f"  ... and {len(errors) - 5} more")

        # Verify insertion
        print()
        print("Verifying data insertion...")
        cur.execute("""
            SELECT COUNT(*), MIN(date_filed), MAX(date_filed)
            FROM docket_entries
            WHERE case_id = %s
        """, (case_id,))

        count, min_date, max_date = cur.fetchone()
        print(f"✓ Verified: {count} entries in database")
        print(f"✓ Date range: {min_date} to {max_date}")

        # Close connection
        cur.close()
        conn.close()

    except Exception as e:
        print(f"ERROR: Database operation failed: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return

    print()
    print("=" * 80)
    print("SUMMARY REPORT")
    print("=" * 80)
    print(f"Total entries found in XML: {total_entries}")
    print(f"Successfully inserted:      {inserted}")
    print(f"Errors encountered:         {len(errors)}")
    print()
    print("Entry Type Summary:")
    for doc_type, count in sorted(type_counter.items(), key=lambda x: x[1], reverse=True):
        print(f"  {count:3d} {doc_type}(s)")
    print()
    if dates:
        print(f"Date Range: {dates_sorted[0]} to {dates_sorted[-1]}")
    print()
    print("✓ AGENT 3 COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    main()
