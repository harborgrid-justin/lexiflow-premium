# Quick Import for Case 24-2160

## Prerequisites
1. **Backend must be running:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install fast-xml-parser axios
   ```

## Run the Import

### Option 1: Using npx (Recommended)
```bash
npx ts-node scripts/import-case-24-2160.ts
```

### Option 2: Import from XML file
```bash
npx ts-node scripts/import-case-24-2160.ts path/to/case.xml
```

### Option 3: Add to package.json and run
Add this to your root `package.json` scripts:
```json
"import:case-24-2160": "ts-node scripts/import-case-24-2160.ts"
```

Then run:
```bash
npm run import:case-24-2160
```

## What This Imports

**Case 24-2160: Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.**

- **Case Type:** Bankruptcy Appeal
- **Court:** 4th Circuit Court of Appeals (from E.D. Virginia)
- **Date Filed:** November 20, 2024
- **Date Terminated:** September 29, 2025
- **Status:** Closed
- **Parties:** 
  - Justin Jeffrey Saadein-Morales (Appellant/Debtor)
  - Westridge Swim & Racquet Club, Inc. (Appellee/Creditor)
- **Docket Entries:** 5 sample entries (script includes only first 5 from 141 total)

## Verify Import

After running, check your database:

1. **View in LexiFlow UI:**
   - Navigate to Cases
   - Search for case number "24-2160"

2. **Query database directly:**
   ```sql
   -- Check case
   SELECT * FROM cases WHERE case_number = '24-2160';
   
   -- Check parties
   SELECT * FROM parties WHERE case_id = (SELECT id FROM cases WHERE case_number = '24-2160');
   
   -- Check docket entries
   SELECT COUNT(*) FROM docket_entries WHERE case_id = (SELECT id FROM cases WHERE case_number = '24-2160');
   ```

## Expected Output

```
🚀 LexiFlow Court Case Importer

📦 Using embedded XML data (Case 24-2160)
Parsing XML data...

📄 Parsed case details:
   - Case Number: 24-2160
   - Title: Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.
   - Date Filed: 11/20/2024
   - Parties: 2
   - Docket Entries: 5

📋 Importing case: 24-2160 - Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.

1️⃣ Creating case record...
✅ Case created with ID: [uuid]

2️⃣ Adding 2 parties...
   ✓ Added party: JUSTIN JEFFREY SAADEIN-MORALES
   ✓ Added party: WESTRIDGE SWIM & RACQUET CLUB, INC., A Community...

3️⃣ Adding 5 docket entries...
   ✓ Completed 5 docket entries

✅ Case import completed successfully!

📊 Summary:
   - Case ID: [uuid]
   - Case Number: 24-2160
   - Parties: 2
   - Docket Entries: 5

🎉 Import successful! Case ID: [uuid]
```

## Troubleshooting

### "Cannot find module 'fast-xml-parser'"
```bash
npm install fast-xml-parser axios
```

### "ECONNREFUSED 127.0.0.1:3000"
Backend not running. Start it:
```bash
cd backend
npm run start:dev
```

### "Duplicate entry for case_number"
Case already exists. Either:
- Delete existing case from database
- Change the case number in the XML
- Modify script to update instead of create

### TypeScript errors
Install ts-node if needed:
```bash
npm install -D ts-node @types/node
```
