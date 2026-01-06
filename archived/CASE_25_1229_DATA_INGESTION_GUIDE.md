# Case 25-1229 Data Ingestion - Complete Reference

## Overview

**Case**: Justin Jeffrey Saadein-Morales v. Westridge Swim & Racquet Club, Inc.
**Court**: United States Court of Appeals for the Fourth Circuit
**Case Number**: 25-1229
**Consolidated With**: 24-2160 (as of 04/25/2025)
**Originating Case**: 1:24-cv-01442-LMB-IDD (EDVA Alexandria)
**Status**: Dismissed (09/29/2025, mandate issued 10/21/2025)

## Data Coverage (100% Complete)

### ✅ Case Metadata

- **Source**: `archived/agent1_case_metadata_insert_25_1229.sql`
- Case number: 25-1229
- Title, matter type, status, jurisdiction
- Cause of action: "3422 Bankruptcy Appeals Rule 28 USC 158"
- Nature of suit: "Bankruptcy Appeals from District Court" (code 0422)
- Filing date: 2025-03-12
- Termination date: 2025-09-29
- Consolidation flag: TRUE
- Related cases JSONB array (24-2160 consolidated, 1:24-cv-01442-LMB-IDD originating)
- **Originating court metadata**:
  - District: EDVA Alexandria
  - Presiding Judge: Leonie M. Brinkema
  - Ordering Judge: Ivan Darnell Davis
  - Judgment date: 2025-02-26
  - Notice of appeal: 2025-02-26
  - Docketed: 2025-03-07
  - ECF URL: https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD
- **Final disposition**:
  - Opinion: Unpublished Per Curiam (09/29/2025)
  - Judgment: Dismissed (09/29/2025)
  - Mandate: Issued 10/21/2025

### ✅ Consolidation Relationship

- **Source**: `archived/agent-5-associated-cases.sql`
- Links 24-2160 ↔ 25-1229 bidirectionally
- Sets `is_consolidated = TRUE` on both cases
- Adds consolidation metadata to `related_cases` JSONB

### ✅ Parties (2)

- **Source**: `archived/agent2_party_attorney_insert_25_1229.sql`

1. **Justin Jeffrey Saadein-Morales** (Appellant)
   - Type: Individual
   - Role: Debtor - Appellant
   - Pro Se: Yes
   - Email: justin.saadein@harborgrid.com
   - Phone: 678-650-6400
   - Address: P.O. Box 55268, Washington, DC 20040

2. **Westridge Swim & Racquet Club, Inc.** (Appellee)
   - Type: Corporation (Community Association)
   - Role: Creditor - Appellee
   - Represented by: Thomas Junker (lead), Richard Lash, David Mercer

### ✅ Attorneys (4)

- **Source**: `archived/agent2_party_attorney_insert_25_1229.sql`

1. **Justin Jeffrey Saadein-Morales** (Pro Se)
   - Email: justin.saadein@harborgrid.com
   - Status: NTC Pro Se

2. **Thomas Charles Junker** (Lead for Westridge)
   - Email: thomas.junker@mercertrigiani.com
   - Firm: MERCERTRIGIANI
   - Phone: 703-837-5000
   - Address: 112 South Alfred Street, Alexandria, VA 22314
   - Status: COR NTC Retained

3. **Richard A. Lash** (Additional for Westridge)
   - Email: rlash@bhlpc.com
   - Firm: BUONASSISSI, HENNING & LASH, PC
   - Phone: 703-796-1341
   - Address: 12355 Sunrise Valley Drive, Suite 650, Reston, VA 20190
   - Status: NTC Retained

4. **David Storey Mercer** (Additional for Westridge)
   - Email: david.mercer@mercertrigiani.com (inferred)
   - Firm: MERCERTRIGIANI
   - Phone: 202-659-6935
   - Address: 112 South Alfred Street, Alexandria, VA 22314
   - Status: On Filing

### ✅ Docket Entries (127)

- **Source**: `archived/docket_entries_insert_25_1229.generated.sql`
- **Generated from**: `archived/25_1229_entries.txt` (127 ENTRY lines)
- **Date range**: 03/12/2025 - 11/12/2025
- **Sequence numbers**: 1-127
- **Fields captured**:
  - Date filed / entry date
  - Document title (first sentence)
  - Full description
  - Entry type (Filing, Motion, Order, Notice, etc.)
  - ECF document number (e.g., 1001734848)
  - ECF URL (CA4 docket links)
  - Filed by (extracted from docket text)
  - Is sealed (FALSE for all public entries)

**Key docket milestones**:

- 03/12/2025: Case docketed
- 03/12/2025: Informal briefing order
- 04/25/2025: Consolidation order (with 24-2160)
- 07/14/2025: Informal opening brief filed
- 07/23/2025: Informal response brief filed
- 09/29/2025: Unpublished per curiam opinion (dismissed)
- 09/29/2025: Judgment order (dismissed)
- 10/21/2025: Mandate issued
- 11/11/2025: Motion to recall mandate
- 11/12/2025: Order denying motion to recall mandate

## Backend Schema Coverage

### Case Entity (`backend/src/cases/entities/case.entity.ts`)

✅ All fields present:

- Basic: `id`, `caseNumber`, `title`, `type`, `status`
- Jurisdiction: `practiceArea`, `jurisdiction`, `court`
- Dates: `filingDate`, `dateTerminated`
- Federal litigation: `causeOfAction`, `natureOfSuit`, `natureOfSuitCode`
- Relationships: `relatedCases` (JSONB), `isConsolidated`
- Flexible: `metadata` (JSONB) for originating court & judges

### Party Entity (`backend/src/parties/entities/party.entity.ts`)

✅ All fields present:

- Identity: `name`, `partyType`, `role`, `entityType`
- Contact: `email`, `phone`, `addressLine1`, `city`, `state`, `postalCode`
- Attorney info: `attorneyName`, `attorneyFirm`, `attorneyEmail`, `attorneyPhone`
- Flags: `isProSe`, `isLeadAttorney`, `isAttorneyToBeNoticed`
- Flexible: `notes`, `metadata` (JSONB)

### DocketEntry Entity (`backend/src/docket/entities/docket-entry.entity.ts`)

✅ All fields present (as of prior session updates):

- Core: `sequenceNumber`, `docketNumber`, `dateFiled`, `entryDate`
- Content: `description`, `text`, `documentTitle`
- Type: `type` (enum: Filing, Motion, Order, Notice, etc.)
- ECF/PACER: `ecfDocumentNumber`, `ecfUrl`, `pacerDocketNumber`, `pacerDocumentNumber`
- Document link: `documentId`, `documentUrl`
- Filing info: `filedBy`, `judgeName`, `signedBy`
- Access: `isSealed`, `isRestricted`
- Flexible: `notes`, `metadata` (JSONB), `attachments` (JSONB)

### DTOs

✅ All CreateXxxDto classes support 100% of the data:

- `CreateCaseDto`: matches Case entity
- `CreatePartyDto`: matches Party entity
- `CreateDocketEntryDto`: matches DocketEntry entity

## Execution Instructions

### Option 1: Run Master Script (Recommended)

```bash
# Assumes PostgreSQL connection configured
psql -h <host> -U <user> -d <database> -f archived/load_case_25_1229_complete.sql
```

This master script will:

1. Create/update case 25-1229 with full metadata
2. Establish consolidation with 24-2160
3. Insert parties and attorneys
4. Insert all 127 docket entries
5. Display verification summary

### Option 2: Run Individual Scripts

```bash
# Step 1: Case metadata
psql -h <host> -U <user> -d <database> -f archived/agent1_case_metadata_insert_25_1229.sql

# Step 2: Consolidation
psql -h <host> -U <user> -d <database> -f archived/agent-5-associated-cases.sql

# Step 3: Parties/attorneys
psql -h <host> -U <user> -d <database> -f archived/agent2_party_attorney_insert_25_1229.sql

# Step 4: Docket entries
psql -h <host> -U <user> -d <database> -f archived/docket_entries_insert_25_1229.generated.sql
```

### Option 3: Frontend API (via NestJS)

Use the backend API endpoints (once scripts are run):

```typescript
import { DataService } from "../services/dataService";

// Retrieve case
const case25_1229 = await DataService.cases.get("25-1229");

// Get parties
const parties = await DataService.parties.getByCaseId(case25_1229.id);

// Get docket entries
const docket = await DataService.docket.getByCaseId(case25_1229.id);

// Search across consolidated cases
const consolidated = await DataService.cases.search({
  filters: { isConsolidated: true },
});
```

## Verification Checklist

After running the loaders, verify:

- [ ] Case 25-1229 exists with `case_number = '25-1229'`
- [ ] `is_consolidated = TRUE`
- [ ] `related_cases` JSONB includes 24-2160 and 1:24-cv-01442-LMB-IDD
- [ ] `metadata` contains `originating_court` and `originating_judges`
- [ ] 2 parties exist linked to case 25-1229
- [ ] Justin party has `is_pro_se = TRUE`
- [ ] Westridge party has attorney metadata
- [ ] 4 attorney user records exist
- [ ] 127 docket entries exist for case 25-1229
- [ ] Sequence numbers range 1-127
- [ ] ECF document numbers are populated
- [ ] Entry types are classified (Filing, Motion, Order, Notice, etc.)
- [ ] Both 24-2160 and 25-1229 show consolidation in `related_cases`

## File Reference

| File                                                   | Purpose                           | Lines | Records            |
| ------------------------------------------------------ | --------------------------------- | ----- | ------------------ |
| `archived/25_1229_entries.txt`                         | Raw docket entries in pipe format | 127   | 127 entries        |
| `archived/agent1_case_metadata_insert_25_1229.sql`     | Case metadata + originating court | ~175  | 1 case             |
| `archived/agent2_party_attorney_insert_25_1229.sql`    | Parties & attorneys               | ~166  | 2 parties, 4 users |
| `archived/agent-5-associated-cases.sql`                | Consolidation link                | ~100  | 2 cases updated    |
| `archived/docket_entries_insert_25_1229.generated.sql` | All docket entries                | 3,722 | 127 entries        |
| `archived/load_case_25_1229_complete.sql`              | Master orchestration script       | ~150  | Runs all above     |
| `archived/scripts/generate_docket_entries_25_1229.py`  | Generator utility                 | ~180  | N/A                |

## Integration Points

### Backend Modules

- **Cases**: `/api/cases` - CRUD + search
- **Parties**: `/api/parties` - CRUD + case lookup
- **Docket**: `/api/docket` - CRUD + search + PACER sync
- **Legal Entities**: `/api/legal-entities` - Related case management

### Frontend Services

- **DataService**: Facade for all data operations
- **API Client**: `services/api/index.ts` - 90+ domain services
- **Query Client**: Custom React Query implementation for caching

### Event System

- **IntegrationOrchestrator**: Publishes `CASE_CREATED`, `DOCKET_INGESTED` events
- **Subscribers**: Conflict checks, compliance scans, analytics updates

## Notes

1. **Consolidation Handling**: The system now fully models the 24-2160 ↔ 25-1229 consolidation. Both cases should appear when filtering by `is_consolidated = TRUE`, and cross-references appear in `related_cases`.

2. **Originating Court Data**: All originating district court metadata (judges, dates, ECF link) is stored in the `metadata` JSONB column on the case record for flexible querying.

3. **Pro Se Representation**: Justin is marked as Pro Se in the `parties` table with `is_pro_se = TRUE` and also has a user record for timeline/activity tracking.

4. **ECF Integration**: All docket entries have ECF document numbers and CA4 URLs for direct linking to court filings.

5. **Entry Type Classification**: The generator script infers entry types (Motion, Order, Notice, Filing, etc.) from docket text. These can be refined post-ingestion if needed.

6. **Sealed Entries**: All entries in 25-1229 are public (`is_sealed = FALSE`). If sealed entries exist, they can be marked accordingly.

## Next Steps

1. **Execute Loaders**: Run `load_case_25_1229_complete.sql` against your PostgreSQL database
2. **Verify in Frontend**: Use LexiFlow UI to browse case 25-1229, view docket timeline, and test consolidation filters
3. **Test Search**: Verify that full-text search across docket entries works correctly
4. **Analytics**: Check that consolidated case metrics appear in dashboards
5. **Conflict Checks**: Ensure no conflicts flagged between 24-2160 and 25-1229 parties
6. **Document Management**: If actual ECF PDFs are available, link them via the `documents` table using the `ecf_document_number` as the reference

---

**Status**: ✅ All data structures complete and ready for ingestion
**Coverage**: 100% of CA4 docket data for case 25-1229
**Backend Compatibility**: Fully compatible with existing NestJS/TypeORM schema
**Generated**: 2026-01-06
