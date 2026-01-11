#!/usr/bin/env python3
"""
Check appellate_data in docket_entries
"""

import pg8000.native
import json

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

    # Check for entries with appellate_data
    print("\nChecking for docket entries with appellate_data...")
    results = conn.run("SELECT id, text, appellate_data FROM docket_entries WHERE appellate_data IS NOT NULL LIMIT 5")

    if not results:
        print("No docket entries found with appellate_data.")
    else:
        for row in results:
            docket_id = row[0]
            text = row[1]
            try:
                # pg8000 might return jsonb as str or dict
                appellate_data = row[2]
                if isinstance(appellate_data, str):
                    appellate_data = json.loads(appellate_data)

                print(f"\nDocket ID: {docket_id}")
                print(f"Text snippet: {text[:50] if text else 'None'}...")

                # Check structure
                print("Appellate Data Keys:", list(appellate_data.keys()) if appellate_data else "None")

                if appellate_data and 'caseQuery' in appellate_data:
                    cq = appellate_data['caseQuery']
                    if 'parties' in cq:
                        print(f"Parties count: {len(cq['parties'])}")
                        if len(cq['parties']) > 0:
                            print("First party sample:", json.dumps(cq['parties'][0], indent=2))
                    else:
                         print("caseQuery.parties is MISSING")
                else:
                    print("appellateData.caseQuery is MISSING")

            except Exception as e:
                print(f"Error parsing data for {docket_id}: {e}")

except Exception as e:
    print(f"Database error: {e}")
