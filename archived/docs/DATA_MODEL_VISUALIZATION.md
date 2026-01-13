# Data Model Visualization

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CASE ENTITY                                │
│ ─────────────────────────────────────────────────────────────────── │
│ Core Fields:                                                         │
│   • caseNumber (unique)          • title                            │
│   • type (enum)                  • status (enum)                    │
│   • court                        • jurisdiction                     │
│   • practiceArea                 • causeOfAction                    │
│   • natureOfSuit                                                     │
│                                                                      │
│ Date Fields:                                                         │
│   • dateOpened                   • filingDate                       │
│   • dateClosed                   • dateTerminated                   │
│                                                                      │
│ Judge Fields:                                                        │
│   • judge (presiding)            • magistrateJudge                  │
│   • referredJudge                                                    │
│                                                                      │
│ Complex Fields (JSON):                                               │
│   • relatedCases[]  ──────────────┐                                │
│       ├─ {court, caseNumber}       │  Links to other cases         │
│       └─ {relationship}            │                                │
│                                    │                                │
│   • metadata                       │                                │
│       ├─ originalCourtInfo         │  Original district court      │
│       │   ├─ district, division    │                                │
│       │   ├─ caseNumber, dateFiled │                                │
│       │   └─ caseNumberLink        │                                │
│       ├─ courtDates                │                                │
│       │   ├─ dateJudgment          │  Timeline of proceedings      │
│       │   ├─ dateJudgmentEOD       │                                │
│       │   ├─ dateNOAFiled          │                                │
│       │   └─ dateRecdCoa           │                                │
│       ├─ judges[]                  │                                │
│       │   └─ {role, name, title}   │  Complete judge info          │
│       ├─ source                    │                                │
│       └─ importDate                │                                │
└──────────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1:N                                │ 1:N
         │                                    │
         ▼                                    ▼
┌────────────────────────────────┐  ┌────────────────────────────────┐
│        PARTY ENTITY            │  │   DOCKET ENTRY ENTITY          │
│ ────────────────────────────── │  │ ────────────────────────────── │
│ Core Fields:                   │  │ Core Fields:                   │
│   • caseId (FK) ───────────┐   │  │   • caseId (FK) ───────────┐   │
│   • name                   │   │  │   • sequenceNumber         │   │
│   • description            │   │  │   • docketNumber           │   │
│   • type (enum)            │   │  │   • dateFiled              │   │
│   • role (enum)            │   │  │   • entryDate              │   │
│                            │   │  │   • description            │   │
│ Attorney Fields (Primary): │   │  │   • text (full)            │   │
│   • attorneyName           │   │  │   • type (enum)            │   │
│   • attorneyFirm           │   │  │   • filedBy                │   │
│   • attorneyEmail          │   │  │   • documentTitle          │   │
│   • attorneyPhone          │   │  │   • documentUrl            │   │
│   • attorneyFax            │   │  │   • ecfUrl                 │   │
│   • attorneyAddress        │   │  │   • judgeName              │   │
│   • isProSe                │   │  │   • signedBy               │   │
│   • isAttorneyToBeNoticed  │   │  │   • relatedDocketNumbers[] │   │
│                            │   │  └────────────────────────────────┘
│ Contact Fields:            │   │
│   • email                  │   │
│   • phone                  │   │
│   • address                │   │
│   • city, state, zipCode   │   │
│                            │   │
│ Metadata (JSON):           │   │
│   • allAttorneys[] ────────┼───┼──┐
│       ├─ {name, email}     │   │  │
│       ├─ {phone, fax}      │   │  │
│       ├─ {firm, office}    │   │  │
│       ├─ {address, city}   │   │  │
│       ├─ {isProSe}         │   │  │
│       └─ {noticeInfo}      │   │  │
│   • prisonerNumber         │   │  │
└────────────────────────────────┘  │
                                    │
                                    ▼
         ┌──────────────────────────────────────────────────┐
         │      ALL ATTORNEYS (in metadata)                 │
         │ ──────────────────────────────────────────────── │
         │ Array of complete attorney records:              │
         │                                                   │
         │ Attorney 1: {                                     │
         │   name: "Thomas Charles Junker"                   │
         │   email: "thomas.junker@firm.com"                 │
         │   phone: "703-837-5000"                           │
         │   firm: "MERCERTRIGIANI"                          │
         │   address: "112 South Alfred Street..."           │
         │   isProSe: false                                  │
         │   noticeInfo: "[COR NTC Retained]"                │
         │ }                                                  │
         │                                                   │
         │ Attorney 2: { ... }                               │
         │                                                   │
         │ Attorney 3: { ... }                               │
         └──────────────────────────────────────────────────┘
```

## Data Flow from XML to Database

```
XML Source (PACER/ECF)
         │
         ├─ <stub caseNumber="..." dateFiled="..." />
         │       │
         │       └──────────────────────────┐
         │                                  │
         ├─ <origCourt>                     ▼
         │    <origPerson role="Presiding Judge" />  ───►  case.judge
         │    <origPerson role="Magistrate Judge" /> ───►  case.magistrateJudge
         │    <origDateSet dateJudgment="..." />     ───►  case.metadata.courtDates
         │  </origCourt>                                   case.metadata.originalCourtInfo
         │
         ├─ <associatedCase leadCase="..." />       ───►  case.relatedCases[]
         │
         ├─ <party info="..." type="...">
         │    <attorney firstName="..." lastName="..." />  ──┐
         │    <attorney firstName="..." lastName="..." />  ──┼─► party.metadata.allAttorneys[]
         │    <attorney firstName="..." lastName="..." />  ──┘   party.attorney* fields (first)
         │  </party>                                              party.counsel (all names)
         │
         └─ <docketTexts>
              <docketText dateFiled="..." text="..." />  ───►  docket_entry (sequential)
            </docketTexts>
```

## Smart Processing Pipeline

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   XML Parse  │ ───► │   Transform  │ ───► │  Validation  │
└──────────────┘      └──────────────┘      └──────────────┘
      │                     │                      │
      │                     │                      │
      ▼                     ▼                      ▼
 Parse XML           Map party types        Check uniqueness
 with attributes     "Debtor"→Appellant     case_number unique
 Extract arrays      "Creditor"→Appellee    Email format valid
 Handle nested       Infer docket types     Date format correct
 structures          Extract practice area   Enum values valid
                     Build descriptions      
                     
                     
      ┌──────────────┐      ┌──────────────┐
      │   Database   │ ───► │   Response   │
      │    Insert    │      │   Complete   │
      └──────────────┘      └──────────────┘
            │                      │
            │                      │
            ▼                      ▼
       1. Create case        Return case ID
       2. Add parties        Log summary
       3. Add docket         Show statistics
       4. Link via FK        Verify counts
```

## Query Access Patterns

### Pattern 1: Get Complete Case Details
```
User Request: "Show me case 24-2160"
     │
     ▼
┌─────────────────────────────────┐
│ SELECT * FROM cases             │
│ WHERE case_number = '24-2160'   │
└─────────────────────────────────┘
     │
     ├─► Returns case with:
     │   • All case fields
     │   • Related cases in JSON
     │   • Judge info in metadata
     │   • Court dates in metadata
     │
     ▼
┌─────────────────────────────────┐
│ SELECT * FROM parties           │
│ WHERE case_id = <case.id>       │
└─────────────────────────────────┘
     │
     └─► Returns all parties with:
         • Primary attorney details
         • All attorneys in metadata
         • Contact information
```

### Pattern 2: Find Cases by Judge
```
User Request: "Show me all cases with Judge Brinkema"
     │
     ▼
┌─────────────────────────────────┐
│ SELECT * FROM cases             │
│ WHERE judge LIKE '%Brinkema%'   │
│ ORDER BY date_opened DESC       │
└─────────────────────────────────┘
```

### Pattern 3: Get Attorney Workload
```
User Request: "How many cases does attorney Junker have?"
     │
     ▼
┌─────────────────────────────────────────────────┐
│ SELECT COUNT(DISTINCT p.case_id)               │
│ FROM parties p                                   │
│ WHERE p.attorney_name LIKE '%Junker%'           │
│    OR p.metadata->'allAttorneys'                │
│       @> '[{"name":"Thomas Charles Junker"}]'   │
└─────────────────────────────────────────────────┘
```

### Pattern 4: Timeline Analysis
```
User Request: "Show timeline from district court to appeal"
     │
     ▼
┌──────────────────────────────────────────────────┐
│ SELECT                                            │
│   case_number,                                    │
│   filing_date as district_filing,                │
│   metadata->'courtDates'->>'dateJudgment' as jdg,│
│   metadata->'courtDates'->>'dateNOAFiled' as noa,│
│   date_opened as appeal_start                    │
│ FROM cases                                        │
│ WHERE case_number = '24-2160'                    │
└──────────────────────────────────────────────────┘
```

## Storage Efficiency

### Primary Storage (Relational)
- **Fast queries**: Indexed fields (case_number, date_filed, judge)
- **Direct joins**: Foreign keys (party.case_id → case.id)
- **Type safety**: Enums for controlled values

### Secondary Storage (JSON)
- **Flexibility**: Complex nested data without new tables
- **Complete data**: No information loss
- **Queryable**: PostgreSQL JSON operators (@>, ->, ->>, etc.)

### Best of Both Worlds
```
┌─────────────────────────────────────────────┐
│              HYBRID APPROACH                 │
│ ──────────────────────────────────────────── │
│                                              │
│  Frequently Queried  ────►  Direct Fields   │
│  (case number, dates)       (indexed)        │
│                                              │
│  Complex/Nested      ────►  JSON Fields     │
│  (all attorneys,            (flexible)       │
│   court dates)                               │
│                                              │
│  Computed Values     ────►  Both            │
│  (e.g., status)            Direct + metadata │
└─────────────────────────────────────────────┘
```

## Key Design Decisions

✅ **Primary attorney at party level** - Fast access, common queries
✅ **All attorneys in metadata** - Complete data, no loss
✅ **Judges as text + metadata** - Simple now, extensible later
✅ **Related cases as JSON** - Flexible linking without FK constraints
✅ **Court dates in metadata** - Historical data, infrequent queries
✅ **Sequential docket numbers** - Easy ordering, clear timeline

This architecture ensures **100% data capture** while maintaining **optimal query performance** and **future extensibility**.
