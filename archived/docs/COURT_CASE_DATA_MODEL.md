# LexiFlow Court Case Data Model - Complete Schema

## Overview
This document describes how court case data from XML sources (PACER, ECF) is intelligently mapped to LexiFlow's database schema, ensuring all information is captured and properly linked.

## Data Relationships

```
Case (root entity)
├── Metadata (JSON field)
│   ├── Original Court Info
│   ├── Court Dates
│   ├── Judge Information
│   └── Import Metadata
├── Related Cases (JSON array)
│   ├── Originating Court Case
│   └── Consolidated/Associated Cases
├── Parties (one-to-many)
│   ├── Party Details
│   ├── Attorney Information (primary)
│   └── Metadata (JSON field)
│       └── All Attorneys Array
└── Docket Entries (one-to-many)
    ├── Entry Details
    ├── Document Links
    └── Related Docket Numbers
```

## Entity Details

### 1. Case Entity

#### Core Fields
| Field | Source | Example | Notes |
|-------|--------|---------|-------|
| `caseNumber` | `stub/@_caseNumber` | "24-2160" | Unique identifier |
| `title` | `stub/@_shortTitle` | "Smith v. Jones Corp" | Case caption |
| `type` | `caseType/@_type` | "Bankruptcy" | Mapped to enum |
| `status` | `stub/@_dateTerminated` | "Active" or "Closed" | Derived |
| `court` | `stub/@_origCourt` | "4th Circuit Court of Appeals" | Full court name |
| `jurisdiction` | Extracted from court name | "Virginia - Eastern District" | Parsed |
| `practiceArea` | Derived from `natureOfSuit` | "Bankruptcy Appeals" | Smart extraction |
| `causeOfAction` | `stub/@_natureOfSuit` | "3422 Bankruptcy Appeals Rule 28 USC 158" | Full text |
| `natureOfSuit` | `stub/@_natureOfSuit` | Same as above | Direct mapping |

#### Date Fields
| Field | Source | Format | Notes |
|-------|--------|--------|-------|
| `dateOpened` | `stub/@_dateFiled` | YYYY-MM-DD | Appeal filed date |
| `filingDate` | `origCourt/@_dateFiled` | YYYY-MM-DD | Original district court filing |
| `dateClosed` | `stub/@_dateTerminated` | YYYY-MM-DD | Case termination date |
| `dateTerminated` | `stub/@_dateTerminated` | YYYY-MM-DD | Same as dateClosed |

#### Judge Fields
| Field | Source | Example |
|-------|--------|---------|
| `judge` | `origPerson[role="Presiding Judge"]` | "Leonie M. Brinkema" |
| `magistrateJudge` | `origPerson[role="Ordering Judge" or "Magistrate"]` | "Ivan Darnell Davis" |
| `referredJudge` | Future expansion | TBD |

#### Complex Fields (JSON)

**`relatedCases`** - Array of related case references:
```json
[
  {
    "court": "District Court",
    "caseNumber": "1:24-cv-01442-LMB-IDD",
    "relationship": "Originating Case"
  },
  {
    "court": "Same Court",
    "caseNumber": "25-1229",
    "relationship": "Consolidated"
  }
]
```

**`metadata`** - Comprehensive case metadata:
```json
{
  "source": "PACER/ECF Import",
  "importDate": "2025-12-26T10:30:00Z",
  "originalCourtInfo": {
    "district": "0422",
    "division": "1",
    "caseNumber": "1:24-cv-01442-LMB-IDD",
    "dateFiled": "08/16/2024",
    "caseNumberLink": "https://ecf.vaed.uscourts.gov/..."
  },
  "courtDates": {
    "dateJudgment": "11/15/2024",
    "dateJudgmentEOD": "11/18/2024",
    "dateNOAFiled": "11/18/2024",
    "dateRecdCoa": "11/19/2024"
  },
  "judges": [
    {
      "role": "Presiding Judge",
      "name": "Leonie M. Brinkema",
      "title": "U. S. District Court Judge"
    },
    {
      "role": "Ordering Judge",
      "name": "Ivan Darnell Davis",
      "title": "U. S. Magistrate Judge"
    }
  ]
}
```

**`description`** - Rich text description built from multiple sources:
```
3422 Bankruptcy Appeals Rule 28 USC 158

Originating Court: United States District Court for the Eastern District of Virginia at Alexandria
Original Case Number: 1:24-cv-01442-LMB-IDD
District Court Filing Date: 08/16/2024

Judges:
- U. S. District Court Judge Leonie M. Brinkema (Presiding Judge)
- U. S. Magistrate Judge Ivan Darnell Davis (Ordering Judge)

Associated Cases:
- 25-1229 (Consolidated)
```

### 2. Party Entity

#### Core Fields
| Field | Source | Example | Notes |
|-------|--------|---------|-------|
| `caseId` | Generated case ID | UUID | Foreign key |
| `name` | `party/@_info` | "JUSTIN JEFFREY SAADEIN-MORALES" | Cleaned |
| `description` | `party/@_info` | Original full text | Unmodified |
| `type` | Derived from `party/@_type` | "Appellant" | Enum value |
| `role` | Derived from `party/@_type` | "appellant" | Enum value |

#### Attorney Fields (Primary Attorney)
| Field | Source | Notes |
|-------|--------|-------|
| `attorneyName` | `attorney/@_firstName + @_lastName` | Full name constructed |
| `attorneyFirm` | `attorney/@_office` | Firm/office name |
| `attorneyEmail` | `attorney/@_email` | Primary email |
| `attorneyPhone` | `attorney/@_personalPhone or @_businessPhone` | First available |
| `attorneyFax` | `attorney/@_fax` | Fax number |
| `attorneyAddress` | Constructed from multiple fields | See buildFullAddress() |
| `isProSe` | Derived from `attorney/@_noticeInfo` | Contains "Pro Se" |
| `isAttorneyToBeNoticed` | Derived from `attorney/@_noticeInfo` | Contains "NTC" |

#### Attorney Address Construction
Built from XML fields in order:
1. `@_address1`
2. `@_address2`
3. `@_address3`
4. `Unit @_unit` (if present)
5. `Room @_room` (if present)
6. `@_city, @_state @_zip`

Example output:
```
112 South Alfred Street
Alexandria, VA 22314
```

#### Multiple Attorneys Support

**`metadata.allAttorneys`** - Array of all attorneys for the party:
```json
{
  "allAttorneys": [
    {
      "name": "Thomas Charles Junker",
      "generation": "",
      "suffix": "",
      "email": "thomas.junker@mercertrigiani.com",
      "phone": "703-837-5000",
      "businessPhone": "",
      "fax": "",
      "firm": "MERCERTRIGIANI",
      "office": "MERCERTRIGIANI",
      "address": "112 South Alfred Street\nAlexandria, VA 22314",
      "isProSe": false,
      "noticeInfo": "[COR NTC Retained]",
      "terminationDate": ""
    },
    {
      "name": "Richard A. Lash",
      "email": "rlash@bhlpc.com",
      "phone": "703-796-1341",
      "firm": "BUONASSISSI, HENNING & LASH, PC",
      "address": "12355 Sunrise Valley Drive\nSuite 650\nReston, VA 20190",
      "isProSe": false,
      "noticeInfo": "[COR NTC Retained]"
    }
  ],
  "prisonerNumber": ""
}
```

#### Party Type Mapping

| XML Type Text | Mapped Type | Mapped Role |
|---------------|-------------|-------------|
| "Debtor - Appellant" | Appellant | appellant |
| "Creditor - Appellee" | Appellee | appellee |
| "Plaintiff" | Plaintiff | plaintiff |
| "Defendant" | Defendant | defendant |
| "Petitioner" | Petitioner | petitioner |
| "Respondent" | Respondent | respondent |

### 3. Docket Entry Entity

#### Core Fields
| Field | Source | Example | Notes |
|-------|--------|---------|-------|
| `caseId` | Generated case ID | UUID | Foreign key |
| `sequenceNumber` | Auto-incremented | 1, 2, 3... | Sequential |
| `dateFiled` | `docketText/@_dateFiled` | "11/20/2024" | Converted to YYYY-MM-DD |
| `entryDate` | Same as dateFiled | "11/20/2024" | Same value |
| `description` | Truncated text (500 chars) | "Case docketed. Originating..." | For display |
| `text` | Full `docketText/@_text` | Complete entry text | HTML cleaned |
| `type` | Inferred from text | "Motion", "Order", etc. | Smart detection |
| `documentUrl` | `docketText/@_docLink` | ECF URL | Document link |
| `ecfUrl` | Same as documentUrl | ECF URL | Duplicate for compatibility |

#### Type Inference Logic

Text contains → Type assigned:
- "motion" → Motion
- "order" → Order
- "notice" → Notice
- "hearing" → Hearing
- "judgment" → Judgment
- "brief", "response", "answer" → Filing
- "affidavit", "certificate" → Filing
- "transcript" → Transcript
- "exhibit" → Exhibit
- default → Other

## Data Transformation Examples

### Example 1: Simple Party with One Attorney

**XML Input:**
```xml
<party info="JOHN DOE" type="Plaintiff">
  <attorney firstName="Jane" lastName="Smith" 
            email="jane@lawfirm.com" 
            phone="555-1234"
            address1="100 Main St"
            city="Richmond" state="VA" zip="23219"
            office="Smith & Associates"/>
</party>
```

**Database Output:**
```json
{
  "name": "JOHN DOE",
  "type": "Plaintiff",
  "role": "plaintiff",
  "attorneyName": "Jane Smith",
  "attorneyFirm": "Smith & Associates",
  "attorneyEmail": "jane@lawfirm.com",
  "attorneyPhone": "555-1234",
  "attorneyAddress": "100 Main St\nRichmond, VA 23219",
  "metadata": {
    "allAttorneys": [
      {
        "name": "Jane Smith",
        "email": "jane@lawfirm.com",
        "phone": "555-1234",
        "firm": "Smith & Associates",
        "address": "100 Main St\nRichmond, VA 23219",
        "isProSe": false
      }
    ]
  }
}
```

### Example 2: Party with Multiple Attorneys

**XML Input:**
```xml
<party info="ACME CORPORATION" type="Defendant">
  <attorney firstName="Bob" lastName="Jones" 
            email="bob@biglaw.com" office="BigLaw LLP"/>
  <attorney firstName="Alice" lastName="Brown" 
            email="alice@biglaw.com" office="BigLaw LLP"/>
</party>
```

**Database Output:**
```json
{
  "name": "ACME CORPORATION",
  "type": "Defendant",
  "role": "defendant",
  "counsel": "Bob Jones, Alice Brown",
  "attorneyName": "Bob Jones",
  "attorneyFirm": "BigLaw LLP",
  "attorneyEmail": "bob@biglaw.com",
  "metadata": {
    "allAttorneys": [
      {"name": "Bob Jones", "email": "bob@biglaw.com", "firm": "BigLaw LLP"},
      {"name": "Alice Brown", "email": "alice@biglaw.com", "firm": "BigLaw LLP"}
    ]
  }
}
```

### Example 3: Pro Se Party

**XML Input:**
```xml
<party info="JUSTIN JEFFREY SAADEIN-MORALES" type="Debtor - Appellant">
  <attorney firstName="Justin" lastName="Saadein-Morales"
            email="justin@email.com"
            noticeInfo="[NTC Pro Se]"/>
</party>
```

**Database Output:**
```json
{
  "name": "JUSTIN JEFFREY SAADEIN-MORALES",
  "type": "Appellant",
  "role": "appellant",
  "attorneyName": "Justin Saadein-Morales",
  "attorneyEmail": "justin@email.com",
  "isProSe": true,
  "isAttorneyToBeNoticed": true
}
```

## Intelligent Linking Strategy

### 1. Case ↔ Parties
- **Foreign Key**: `party.caseId` → `case.id`
- **Cardinality**: One case has many parties
- **Cascade**: Deleting case deletes all parties

### 2. Case ↔ Docket Entries
- **Foreign Key**: `docket_entry.caseId` → `case.id`
- **Cardinality**: One case has many docket entries
- **Cascade**: Deleting case deletes all docket entries
- **Ordering**: By `sequenceNumber` (auto-assigned 1, 2, 3...)

### 3. Case ↔ Related Cases
- **Storage**: JSON array in `case.relatedCases`
- **Linkage**: By case number (not FK for flexibility)
- **Use Cases**: 
  - Link to originating district court case
  - Link to consolidated appeals
  - Link to related matters

### 4. Party ↔ Multiple Attorneys
- **Primary**: Attorney fields at party level (first attorney)
- **Complete List**: `party.metadata.allAttorneys` JSON array
- **Rationale**: Maintains primary attorney for quick access while preserving all attorney data

### 5. Temporal Relationships

Court dates timeline:
```
District Court Filing → Judgment → NOA Filed → Case Docketed (Appeal)
                                 ↓
                         Judgment EOD (Entry of Judgment)
                                 ↓
                         Record Received at Court of Appeals
```

Stored in `case.metadata.courtDates`:
- `dateJudgment`: Lower court judgment date
- `dateJudgmentEOD`: Entry of judgment date
- `dateNOAFiled`: Notice of Appeal filed
- `dateRecdCoa`: Record received at Court of Appeals

## Query Examples

### Get Case with All Relationships
```sql
SELECT 
  c.*,
  json_agg(DISTINCT p.*) as parties,
  json_agg(DISTINCT d.*) as docket_entries
FROM cases c
LEFT JOIN parties p ON p.case_id = c.id
LEFT JOIN docket_entries d ON d.case_id = c.id
WHERE c.case_number = '24-2160'
GROUP BY c.id;
```

### Get All Attorneys for a Case
```sql
SELECT 
  p.name as party_name,
  p.attorney_name as primary_attorney,
  p.metadata->'allAttorneys' as all_attorneys
FROM parties p
WHERE p.case_id = (SELECT id FROM cases WHERE case_number = '24-2160');
```

### Get Case Timeline
```sql
SELECT 
  case_number,
  filing_date as district_court_filing,
  (metadata->'courtDates'->>'dateJudgment')::date as judgment_date,
  (metadata->'courtDates'->>'dateNOAFiled')::date as appeal_filed,
  date_opened as appeal_docketed,
  date_terminated as appeal_closed
FROM cases
WHERE case_number = '24-2160';
```

### Find All Cases with Same Judge
```sql
SELECT case_number, title, judge
FROM cases
WHERE judge = 'Leonie M. Brinkema'
ORDER BY date_opened DESC;
```

### Get Consolidated Cases
```sql
SELECT 
  c.case_number,
  c.title,
  jsonb_array_elements(c.related_cases) as related
FROM cases c
WHERE c.related_cases @> '[{"relationship": "Consolidated"}]';
```

## Import Statistics

For case 24-2160:
- **Total Data Points Captured**: 150+
- **Parties**: 2
- **Total Attorneys**: 4 (1 + 3)
- **Judges**: 2
- **Related Cases**: 2 (originating + consolidated)
- **Docket Entries**: 5+ (expandable to 141)
- **Court Dates**: 4
- **Metadata Fields**: 10+

## Extension Points

### Future Enhancements

1. **Separate Attorney Entity** (if needed):
   ```sql
   CREATE TABLE attorneys (
     id UUID PRIMARY KEY,
     first_name VARCHAR(100),
     last_name VARCHAR(100),
     bar_number VARCHAR(50),
     firm VARCHAR(255),
     ...
   );
   
   CREATE TABLE party_attorneys (
     party_id UUID REFERENCES parties(id),
     attorney_id UUID REFERENCES attorneys(id),
     is_primary BOOLEAN,
     is_lead BOOLEAN,
     date_added DATE,
     date_terminated DATE
   );
   ```

2. **Judge Entity** (if needed for analytics):
   ```sql
   CREATE TABLE judges (
     id UUID PRIMARY KEY,
     first_name VARCHAR(100),
     last_name VARCHAR(100),
     title VARCHAR(255),
     court VARCHAR(255),
     ...
   );
   ```

3. **Document Entity** (linking docket entries to actual files):
   ```sql
   ALTER TABLE docket_entries 
   ADD COLUMN document_id UUID REFERENCES documents(id);
   ```

## Best Practices

1. **Always use metadata fields** for complex/nested data that doesn't warrant separate tables
2. **Preserve original data** in description/notes fields before transformation
3. **Use enums** for controlled vocabularies (type, status, role)
4. **Store dates** in YYYY-MM-DD format for database consistency
5. **Build full-text search** on case.description, party.name, docket_entry.text
6. **Index foreign keys** and frequently queried fields (case_number, date_filed)
7. **Validate uniqueness** on case_number to prevent duplicates
8. **Log imports** in case.metadata for audit trails

## Validation Rules

- Case number must be unique
- At least one party required per case
- Attorney email must be valid format (if provided)
- Dates must be in valid format
- Party type must match enum values
- Docket entries must have sequence numbers
- Related case numbers should exist (soft validation)

This comprehensive schema ensures no data is lost during import while maintaining a clean, queryable relational structure.
