#!/usr/bin/env python3
"""
Check if cases table has data and what the schema looks like
"""

import pg8000.native

# Database connection parameters
DB_PARAMS = {
    "user": "neondb_owner",
    "password": "npg_u71zdejvgHOR",
    "host": "ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech",
    "database": "neondb",
    "port": 5432,
    "ssl_context": True
}

try:
    print("Connecting to database...")
    conn = pg8000.native.Connection(**DB_PARAMS)
    print("✓ Connected\n")

    # Check cases table schema
    print("="*80)
    print("CASES TABLE SCHEMA")
    print("="*80)
    schema = conn.run("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'cases'
        ORDER BY ordinal_position
    """)
    
    for col in schema:
        print(f"  {col[0]:<30} {col[1]:<20} NULL: {col[2]:<5} DEFAULT: {col[3]}")
    
    # Count cases
    print("\n" + "="*80)
    print("CASES COUNT")
    print("="*80)
    result = conn.run("SELECT COUNT(*) FROM cases")
    count = result[0][0]
    print(f"  Total cases: {count}")
    
    if count > 0:
        print("\n" + "="*80)
        print("CASE DETAILS")
        print("="*80)
        cases = conn.run("SELECT id, case_number, title, status, filing_date, court FROM cases LIMIT 5")
        for case in cases:
            print(f"  ID: {case[0]}")
            print(f"  Case Number: {case[1]}")
            print(f"  Title: {case[2]}")
            print(f"  Status: {case[3]}")
            print(f"  Filing Date: {case[4]}")
            print(f"  Court: {case[5]}")
            print()
    
    # Check docket entries
    print("="*80)
    print("DOCKET ENTRIES COUNT")
    print("="*80)
    result = conn.run("SELECT COUNT(*) FROM docket_entries")
    docket_count = result[0][0]
    print(f"  Total docket entries: {docket_count}")
    
    if docket_count > 0:
        print("\n  Sample docket entries:")
        entries = conn.run("SELECT case_id, sequence_number, date_filed, type FROM docket_entries LIMIT 3")
        for entry in entries:
            print(f"    Entry {entry[1]} - Case: {entry[0]} - Date: {entry[2]} - Type: {entry[3]}")
    
    conn.close()
    print("\n✓ Complete")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
