#!/usr/bin/env python3
"""
Enterprise Agent 2: Party & Attorney Loader
Parses XML docket file and loads all parties and attorneys into PostgreSQL
"""

import xml.etree.ElementTree as ET
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
from datetime import datetime
import sys

# Database connection string
DB_URL = "postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# XML file path
XML_FILE = "/home/user/lexiflow-premium/04_24-2160_Docket.xml"

def parse_connection_string(url):
    """Parse PostgreSQL connection string"""
    # postgresql://user:password@host/database?params
    import re
    pattern = r'postgresql://([^:]+):([^@]+)@([^/]+)/([^?]+)'
    match = re.match(pattern, url)
    if match:
        return {
            'user': match.group(1),
            'password': match.group(2),
            'host': match.group(3),
            'database': match.group(4),
            'sslmode': 'require'
        }
    return None

def connect_db():
    """Connect to PostgreSQL database"""
    conn_params = parse_connection_string(DB_URL)
    if not conn_params:
        raise ValueError("Invalid database URL")

    conn = psycopg2.connect(**conn_params)
    return conn

def parse_xml_parties(xml_file):
    """Parse XML file and extract party and attorney information"""
    print(f"Parsing XML file: {xml_file}")

    # Read the XML file
    with open(xml_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all party elements using string parsing (since the XML is all on one line)
    parties_data = []

    # Split by <party to find each party
    party_sections = content.split('<party ')

    for i, section in enumerate(party_sections[1:], 1):  # Skip first split which is before first party
        # Extract party attributes
        party_end = section.find('</party>')
        if party_end == -1:
            party_end = section.find('/>')

        party_section = section[:party_end + 10] if party_end != -1 else section[:1000]

        # Extract party info
        party_info = {}

        # Get info attribute (party name)
        info_start = section.find('info="')
        if info_start != -1:
            info_start += 6
            info_end = section.find('"', info_start)
            party_info['name'] = section[info_start:info_end].replace('&amp;', '&')

        # Get type attribute
        type_start = section.find('type="')
        if type_start != -1:
            type_start += 6
            type_end = section.find('"', type_start)
            party_info['type_description'] = section[type_start:type_end]

        # Determine party type (Individual vs Corporation)
        if 'INC' in party_info.get('name', '').upper() or 'CLUB' in party_info.get('name', '').upper():
            party_info['type'] = 'Corporation'
        else:
            party_info['type'] = 'Individual'

        # Extract role (everything between type=" and the next ")
        role = party_info.get('type_description', '')
        party_info['role'] = role

        # Extract attorneys
        attorneys = []
        attorney_sections = section.split('<attorney ')

        for att_section in attorney_sections[1:]:
            attorney = {}

            # Extract attorney attributes
            for attr in ['firstName', 'middleName', 'lastName', 'email', 'businessPhone',
                        'personalPhone', 'address1', 'city', 'state', 'zip', 'office']:
                attr_start = att_section.find(f'{attr}="')
                if attr_start != -1:
                    attr_start += len(attr) + 2
                    attr_end = att_section.find('"', attr_start)
                    attorney[attr] = att_section[attr_start:attr_end]

            # Build full name
            name_parts = []
            for part in ['firstName', 'middleName', 'lastName']:
                if attorney.get(part):
                    name_parts.append(attorney[part])
            attorney['full_name'] = ' '.join(name_parts)

            if attorney.get('full_name'):
                attorneys.append(attorney)

        party_info['attorneys'] = attorneys
        parties_data.append(party_info)

    return parties_data

def get_case_id(conn):
    """Get the case_id for case 24-2160"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT id FROM cases WHERE case_number = %s", ('24-2160',))
    result = cursor.fetchone()
    cursor.close()

    if result:
        return result['id']
    else:
        print("WARNING: Case 24-2160 not found in database. Creating parties without case link.")
        return None

def insert_party(conn, party_data):
    """Insert a party into the parties table"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    party_id = str(uuid.uuid4())

    # Check if party already exists
    cursor.execute(
        "SELECT id FROM parties WHERE name = %s",
        (party_data['name'],)
    )
    existing = cursor.fetchone()

    if existing:
        print(f"  Party already exists: {party_data['name']}")
        party_id = existing['id']
    else:
        cursor.execute(
            """
            INSERT INTO parties (id, name, type, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            RETURNING id
            """,
            (party_id, party_data['name'], party_data['type'], datetime.now(), datetime.now())
        )
        result = cursor.fetchone()
        if result:
            print(f"  ✓ Inserted party: {party_data['name']} (ID: {party_id})")
        else:
            print(f"  Party insert conflict (already exists): {party_data['name']}")

    cursor.close()
    return party_id

def insert_case_party(conn, case_id, party_id, role, counsel_name=None):
    """Insert a case-party relationship"""
    if not case_id:
        print(f"  Skipping case_party link (no case_id)")
        return

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO case_parties (case_id, party_id, role, counsel_name, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (case_id, party_id) DO UPDATE
            SET role = EXCLUDED.role,
                counsel_name = EXCLUDED.counsel_name,
                updated_at = EXCLUDED.updated_at
            """,
            (case_id, party_id, role, counsel_name, datetime.now(), datetime.now())
        )
        print(f"  ✓ Linked party to case with role: {role}")
    except Exception as e:
        print(f"  Error inserting case_party: {e}")

    cursor.close()

def insert_attorney_as_user(conn, attorney_data, firm_name=None):
    """Insert an attorney into the users table"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    user_id = str(uuid.uuid4())
    email = attorney_data.get('email', '').strip()

    if not email:
        # Generate email from name
        email = attorney_data['full_name'].lower().replace(' ', '.') + '@law.example.com'

    # Check if user already exists
    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )
    existing = cursor.fetchone()

    if existing:
        print(f"    Attorney already exists: {attorney_data['full_name']}")
        user_id = existing['id']
    else:
        # Extract name parts
        name_parts = attorney_data['full_name'].split()
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[-1] if len(name_parts) > 1 else ''

        try:
            cursor.execute(
                """
                INSERT INTO users (
                    id, email, password_hash, first_name, last_name,
                    role, phone, organization, is_active, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO NOTHING
                RETURNING id
                """,
                (
                    user_id, email, 'EXTERNAL_ATTORNEY', first_name, last_name,
                    'attorney', attorney_data.get('businessPhone') or attorney_data.get('personalPhone', ''),
                    firm_name or attorney_data.get('office', ''),
                    True, datetime.now(), datetime.now()
                )
            )
            result = cursor.fetchone()
            if result:
                print(f"    ✓ Inserted attorney: {attorney_data['full_name']} ({email})")
                if firm_name:
                    print(f"      Firm: {firm_name}")
            else:
                print(f"    Attorney insert conflict: {attorney_data['full_name']}")
        except Exception as e:
            print(f"    Error inserting attorney: {e}")

    cursor.close()
    return user_id

def main():
    """Main execution function"""
    print("=" * 80)
    print("ENTERPRISE AGENT 2: PARTY & ATTORNEY LOADER")
    print("=" * 80)
    print()

    # Parse XML file
    parties_data = parse_xml_parties(XML_FILE)
    print(f"\nFound {len(parties_data)} parties in XML file\n")

    # Display parsed data
    for i, party in enumerate(parties_data, 1):
        print(f"Party {i}: {party['name']}")
        print(f"  Type: {party['type']}")
        print(f"  Role: {party['role']}")
        print(f"  Attorneys: {len(party['attorneys'])}")
        for att in party['attorneys']:
            print(f"    - {att['full_name']}")
            if att.get('email'):
                print(f"      Email: {att['email']}")
            if att.get('office'):
                print(f"      Firm: {att['office']}")
        print()

    # Connect to database
    print("\nConnecting to database...")
    try:
        conn = connect_db()
        print("✓ Connected to PostgreSQL database")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return 1

    # Get case ID
    case_id = get_case_id(conn)
    if case_id:
        print(f"✓ Found case ID: {case_id}")
    else:
        print("! Case not found - will create parties without case link")

    print("\n" + "=" * 80)
    print("INSERTING DATA INTO DATABASE")
    print("=" * 80)

    # Insert parties and attorneys
    parties_inserted = 0
    attorneys_inserted = 0

    for party_data in parties_data:
        print(f"\nProcessing: {party_data['name']}")

        # Insert party
        party_id = insert_party(conn, party_data)
        if party_id:
            parties_inserted += 1

        # Link party to case
        if case_id and party_id:
            # Build counsel name from attorneys
            counsel_names = [att['full_name'] for att in party_data['attorneys']]
            counsel_name = ', '.join(counsel_names) if counsel_names else None

            # If no attorneys and it's the individual, mark as Pro Se
            if not counsel_names and party_data['type'] == 'Individual':
                counsel_name = 'Pro Se'

            insert_case_party(conn, case_id, party_id, party_data['role'], counsel_name)

        # Insert attorneys
        for attorney in party_data['attorneys']:
            firm_name = attorney.get('office', '')
            insert_attorney_as_user(conn, attorney, firm_name)
            attorneys_inserted += 1

    # Commit transaction
    conn.commit()
    print("\n✓ All changes committed to database")

    # Summary report
    print("\n" + "=" * 80)
    print("SUMMARY REPORT")
    print("=" * 80)
    print(f"Total parties processed: {len(parties_data)}")
    print(f"Parties inserted/updated: {parties_inserted}")
    print(f"Attorneys inserted/updated: {attorneys_inserted}")
    print(f"Case ID: {case_id or 'NOT FOUND'}")

    # Query final state
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    print("\n--- PARTIES IN DATABASE ---")
    cursor.execute("SELECT id, name, type FROM parties ORDER BY name")
    for row in cursor.fetchall():
        print(f"  {row['name']} ({row['type']}) - ID: {row['id']}")

    if case_id:
        print("\n--- CASE PARTIES ---")
        cursor.execute(
            """
            SELECT p.name, cp.role, cp.counsel_name
            FROM case_parties cp
            JOIN parties p ON cp.party_id = p.id
            WHERE cp.case_id = %s
            ORDER BY p.name
            """,
            (case_id,)
        )
        for row in cursor.fetchall():
            print(f"  {row['name']}")
            print(f"    Role: {row['role']}")
            print(f"    Counsel: {row['counsel_name'] or 'N/A'}")

    print("\n--- ATTORNEYS IN DATABASE ---")
    cursor.execute(
        """
        SELECT first_name, last_name, email, organization, phone
        FROM users
        WHERE role = 'attorney'
        ORDER BY last_name, first_name
        """
    )
    for row in cursor.fetchall():
        print(f"  {row['first_name']} {row['last_name']}")
        print(f"    Email: {row['email']}")
        if row['organization']:
            print(f"    Firm: {row['organization']}")
        if row['phone']:
            print(f"    Phone: {row['phone']}")

    cursor.close()
    conn.close()

    print("\n" + "=" * 80)
    print("AGENT 2 COMPLETE")
    print("=" * 80)

    return 0

if __name__ == "__main__":
    sys.exit(main())
