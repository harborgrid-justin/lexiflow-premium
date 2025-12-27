# Court Case Import - Setup Instructions

## Overview
This script imports court case data from XML format into the LexiFlow database. It parses XML from court systems (PACER, ECF, etc.) and creates complete case records including parties, attorneys, and docket entries.

## Installation

1. **Install required dependencies:**
```bash
npm install fast-xml-parser axios ts-node
```

2. **Ensure your backend is running:**
```bash
cd backend
npm run start:dev
```

The backend should be accessible at `http://localhost:3000` (or set `BACKEND_API_URL` environment variable).

## Usage

### Running the Import Script

```bash
# From the project root
npx ts-node scripts/import-court-case.ts
```

Or add to package.json scripts:
```json
"scripts": {
  "import:case": "ts-node scripts/import-court-case.ts"
}
```

Then run:
```bash
npm run import:case
```

### Importing Custom XML Data

Edit the `xmlData` variable in `scripts/import-court-case.ts` with your XML content, or modify the script to read from a file:

```typescript
import { readFileSync } from 'fs';

const xmlData = readFileSync('./case-data.xml', 'utf-8');
```

## What Gets Imported

### Case Record
- Case number (unique identifier)
- Title/short title
- Description (includes nature of suit and originating court)
- Type (mapped from case type: Civil, Bankruptcy, etc.)
- Status (Active if ongoing, Closed if terminated)
- Practice area
- Jurisdiction (extracted from court name)
- Court name
- Cause of action (nature of suit)
- Date opened/filed
- Date closed/terminated (if applicable)

### Parties
- Name (cleaned and truncated)
- Type (Appellant, Appellee, Plaintiff, Defendant, etc.)
- Role (appellant, appellee, plaintiff, defendant, etc.)
- Description (original party info text)
- Counsel names (from attorney list)
- Contact information (email, phone, address from first attorney)

### Docket Entries
- Sequential numbering
- Date filed
- Entry date
- Description (truncated to 500 chars)
- Full text
- Type (inferred from content: Motion, Order, Notice, etc.)
- Document URL (ECF link)

## Field Mappings

### Party Type Mapping
- "Debtor" → Appellant
- "Creditor" → Appellee
- "Appellant" → Appellant
- "Appellee" → Appellee
- "Plaintiff" → Plaintiff
- "Defendant" → Defendant

### Case Type Mapping
- "Bankruptcy" → Bankruptcy
- "Civil" → Civil
- "Criminal" → Criminal
- Default → Civil

### Docket Entry Type Inference
Based on text content:
- Contains "motion" → Motion
- Contains "order" → Order
- Contains "notice" → Notice
- Contains "hearing" → Hearing
- Contains "judgment" → Judgment
- Contains "brief", "response", "answer" → Filing
- Default → Other

## Example Output

```
🚀 LexiFlow Court Case Importer

Parsing XML data...

📄 Parsed case details:
   - Case Number: 24-2160
   - Title: Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.
   - Date Filed: 11/20/2024
   - Parties: 2
   - Docket Entries: 141

📋 Importing case: 24-2160 - Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.

1️⃣ Creating case record...
✅ Case created with ID: abc123...

2️⃣ Adding 2 parties...
   ✓ Added party: JUSTIN JEFFREY SAADEIN-MORALES
   ✓ Added party: WESTRIDGE SWIM & RACQUET CLUB, INC., A Community...

3️⃣ Adding 141 docket entries...
   ✓ Added 10 docket entries...
   ✓ Added 20 docket entries...
   ...
   ✓ Completed 141 docket entries

✅ Case import completed successfully!

📊 Summary:
   - Case ID: abc123...
   - Case Number: 24-2160
   - Parties: 2
   - Docket Entries: 141

🎉 Import successful! Case ID: abc123...
```

## Troubleshooting

### Backend Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:** Ensure backend is running on port 3000 or set `BACKEND_API_URL` environment variable.

### Duplicate Case Number
```
Error: Unique constraint violation on case_number
```
**Solution:** The case already exists in the database. Either delete it or modify the case number.

### Date Format Errors
The script expects dates in `MM/DD/YYYY` format and converts to `YYYY-MM-DD` for the database.

### XML Parsing Errors
Ensure your XML is well-formed. The script uses `fast-xml-parser` which requires valid XML structure.

## Customization

### Adding More Fields
To map additional XML fields, modify the `parseCourtCaseXML` function:

```typescript
// Add new field to interface
interface CourtCaseImport {
  // ... existing fields
  judgeNames?: string[];
}

// Parse from XML
const parsedCase = {
  // ... existing mappings
  judgeNames: caseSummary.origCourts?.origCourt?.origPerson
    ?.filter((p: any) => p['@_role'].includes('Judge'))
    .map((p: any) => `${p['@_firstName']} ${p['@_lastName']}`),
};
```

### Batch Import
To import multiple cases, create a loop:

```typescript
const xmlFiles = ['case1.xml', 'case2.xml', 'case3.xml'];

for (const file of xmlFiles) {
  const xmlData = readFileSync(file, 'utf-8');
  const parsedCase = parseCourtCaseXML(xmlData);
  await importCaseToBackend(parsedCase);
}
```

## API Endpoints Used

- `POST /api/cases` - Create case record
- `POST /api/parties` - Create party records
- `POST /api/docket` - Create docket entry records

## Notes

- The script creates parties and docket entries linked to the case via `caseId`
- Attorney information is stored in the party record as `counsel` (concatenated names)
- First attorney's contact info is used for the party record
- Docket entries are numbered sequentially starting from 1
- All dates are converted from MM/DD/YYYY to YYYY-MM-DD format
- Text fields are truncated to fit database constraints

## Future Enhancements

Possible improvements:
- [ ] Support for reading XML from file path argument
- [ ] Batch import from directory of XML files
- [ ] Dry-run mode to preview without importing
- [ ] Update existing cases instead of only create
- [ ] Import associated documents from ECF links
- [ ] Map additional court metadata fields
- [ ] Add validation and error recovery
