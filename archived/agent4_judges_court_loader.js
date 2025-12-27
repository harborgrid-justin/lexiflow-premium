/**
 * Enterprise Agent 4: Judges & Originating Court Loader
 * Parses judge information and originating court data from XML and updates the database
 */

import pg from 'pg';
const { Client } = pg;

// Database connection
const DATABASE_URL = 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Extracted data from XML
const extractedData = {
  originatingCourt: {
    district: "0422",
    division: "1",
    caseNumber: "1:24-cv-01442-LMB-IDD",
    dateFiled: "08/16/2024",
    caseNumberLink: "https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD",
    courtName: "United States District Court for the Eastern District of Virginia at Alexandria"
  },
  judges: {
    presiding: {
      role: "Presiding Judge",
      firstName: "Leonie",
      middleName: "M.",
      lastName: "Brinkema",
      title: "U. S. District Court Judge",
      fullName: "Hon. Leonie M. Brinkema"
    },
    ordering: {
      role: "Ordering Judge",
      firstName: "Ivan",
      middleName: "Darnell",
      lastName: "Davis",
      title: "U. S. Magistrate Judge",
      fullName: "Hon. Ivan Darnell Davis"
    }
  },
  dates: {
    dateJudgment: "11/15/2024",
    dateJudgmentEOD: "11/18/2024",
    dateNOAFiled: "11/18/2024",
    dateRecdCoa: "11/19/2024"
  },
  caseInfo: {
    caseNumber: "24-2160",
    court: "United States Court of Appeals for the Fourth Circuit"
  }
};

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Report extracted data
    console.log('=== EXTRACTED DATA FROM XML ===\n');
    console.log('Originating Court Information:');
    console.log('  District:', extractedData.originatingCourt.district);
    console.log('  Division:', extractedData.originatingCourt.division);
    console.log('  Case Number:', extractedData.originatingCourt.caseNumber);
    console.log('  Date Filed:', extractedData.originatingCourt.dateFiled);
    console.log('  Court:', extractedData.originatingCourt.courtName);
    console.log('  Case Link:', extractedData.originatingCourt.caseNumberLink);
    console.log();

    console.log('Judge Information:');
    console.log('  Presiding Judge:', extractedData.judges.presiding.fullName);
    console.log('    Title:', extractedData.judges.presiding.title);
    console.log('  Ordering Judge:', extractedData.judges.ordering.fullName);
    console.log('    Title:', extractedData.judges.ordering.title);
    console.log();

    console.log('Important Dates:');
    console.log('  Judgment Date:', extractedData.dates.dateJudgment);
    console.log('  Judgment Entry Date:', extractedData.dates.dateJudgmentEOD);
    console.log('  Notice of Appeal Filed:', extractedData.dates.dateNOAFiled);
    console.log('  Received at Court of Appeals:', extractedData.dates.dateRecdCoa);
    console.log();

    // Check current schema
    console.log('=== CHECKING DATABASE SCHEMA ===\n');

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('cases', 'judges', 'originating_courts', 'related_cases', 'case_dates')
      ORDER BY table_name
    `);

    console.log('Relevant tables found:', tablesResult.rows.map(r => r.table_name).join(', '));
    console.log();

    // Check cases table columns
    const casesColumnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'cases'
      AND column_name IN ('judge', 'court', 'jurisdiction', 'originating_court', 'originating_case_number')
      ORDER BY column_name
    `);

    console.log('Cases table columns:', casesColumnsResult.rows.map(r => r.column_name).join(', '));
    console.log();

    // Find the case record
    console.log('=== FINDING CASE RECORD ===\n');

    const caseResult = await client.query(`
      SELECT id, case_number, title, judge, court
      FROM cases
      WHERE case_number = $1 OR title ILIKE $2
    `, [extractedData.caseInfo.caseNumber, '%Saadein-Morales%']);

    if (caseResult.rows.length === 0) {
      console.log('❌ Case not found in database!');
      console.log('Please ensure Agent 1 has completed case creation.');
      return;
    }

    const caseRecord = caseResult.rows[0];
    console.log('✅ Found case:');
    console.log('  ID:', caseRecord.id);
    console.log('  Case Number:', caseRecord.case_number);
    console.log('  Title:', caseRecord.title);
    console.log('  Current Judge:', caseRecord.judge || '(not set)');
    console.log('  Current Court:', caseRecord.court || '(not set)');
    console.log();

    // Update the cases table with judge information
    console.log('=== UPDATING CASES TABLE ===\n');

    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    // Always update judge
    updateFields.push(`judge = $${paramIndex++}`);
    updateValues.push(extractedData.judges.presiding.fullName);

    // Update court if not already set
    if (!caseRecord.court) {
      updateFields.push(`court = $${paramIndex++}`);
      updateValues.push(extractedData.caseInfo.court);
    }

    // Check if originating_court column exists
    const hasOriginatingCourt = casesColumnsResult.rows.some(r => r.column_name === 'originating_court');
    if (hasOriginatingCourt) {
      updateFields.push(`originating_court = $${paramIndex++}`);
      updateValues.push(extractedData.originatingCourt.courtName);
    }

    // Check if originating_case_number column exists
    const hasOriginatingCaseNumber = casesColumnsResult.rows.some(r => r.column_name === 'originating_case_number');
    if (hasOriginatingCaseNumber) {
      updateFields.push(`originating_case_number = $${paramIndex++}`);
      updateValues.push(extractedData.originatingCourt.caseNumber);
    }

    updateValues.push(caseRecord.id);

    const updateSQL = `
      UPDATE cases
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    console.log('Executing SQL:');
    console.log(updateSQL);
    console.log('Values:', updateValues);
    console.log();

    const updateResult = await client.query(updateSQL, updateValues);
    console.log('✅ Updated cases table');
    console.log('  Judge:', updateResult.rows[0].judge);
    console.log('  Court:', updateResult.rows[0].court);
    console.log();

    // Check if judges table exists and populate it
    const hasJudgesTable = tablesResult.rows.some(r => r.table_name === 'judges');

    if (hasJudgesTable) {
      console.log('=== POPULATING JUDGES TABLE ===\n');

      // Insert or update presiding judge
      const presidingJudgeSQL = `
        INSERT INTO judges (name, title, court, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE
        SET title = EXCLUDED.title,
            court = EXCLUDED.court,
            role = EXCLUDED.role,
            updated_at = NOW()
        RETURNING id
      `;

      const presidingResult = await client.query(presidingJudgeSQL, [
        extractedData.judges.presiding.fullName,
        extractedData.judges.presiding.title,
        extractedData.originatingCourt.courtName,
        extractedData.judges.presiding.role
      ]);

      console.log('✅ Inserted/Updated Presiding Judge:', extractedData.judges.presiding.fullName);
      console.log('  ID:', presidingResult.rows[0].id);

      // Insert or update ordering judge
      const orderingResult = await client.query(presidingJudgeSQL, [
        extractedData.judges.ordering.fullName,
        extractedData.judges.ordering.title,
        extractedData.originatingCourt.courtName,
        extractedData.judges.ordering.role
      ]);

      console.log('✅ Inserted/Updated Ordering Judge:', extractedData.judges.ordering.fullName);
      console.log('  ID:', orderingResult.rows[0].id);
      console.log();
    } else {
      console.log('ℹ️  No judges table found - judge info stored in cases.judge field only\n');
    }

    // Check if originating_courts table exists and populate it
    const hasOriginatingCourtsTable = tablesResult.rows.some(r => r.table_name === 'originating_courts');

    if (hasOriginatingCourtsTable) {
      console.log('=== POPULATING ORIGINATING_COURTS TABLE ===\n');

      const origCourtSQL = `
        INSERT INTO originating_courts (
          case_id, district, division, case_number, date_filed,
          case_number_link, court_name, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (case_id) DO UPDATE
        SET district = EXCLUDED.district,
            division = EXCLUDED.division,
            case_number = EXCLUDED.case_number,
            date_filed = EXCLUDED.date_filed,
            case_number_link = EXCLUDED.case_number_link,
            court_name = EXCLUDED.court_name,
            updated_at = NOW()
        RETURNING id
      `;

      const origCourtResult = await client.query(origCourtSQL, [
        caseRecord.id,
        extractedData.originatingCourt.district,
        extractedData.originatingCourt.division,
        extractedData.originatingCourt.caseNumber,
        extractedData.originatingCourt.dateFiled,
        extractedData.originatingCourt.caseNumberLink,
        extractedData.originatingCourt.courtName
      ]);

      console.log('✅ Inserted/Updated originating_courts record');
      console.log('  ID:', origCourtResult.rows[0].id);
      console.log('  Case Number:', extractedData.originatingCourt.caseNumber);
      console.log('  Court:', extractedData.originatingCourt.courtName);
      console.log();
    } else {
      console.log('ℹ️  No originating_courts table found - data stored in cases table only\n');
    }

    // Check if case_dates table exists and populate important dates
    const hasCaseDatesTable = tablesResult.rows.some(r => r.table_name === 'case_dates');

    if (hasCaseDatesTable) {
      console.log('=== POPULATING CASE_DATES TABLE ===\n');

      const dateTypes = [
        { type: 'judgment_date', date: extractedData.dates.dateJudgment, description: 'Judgment Date' },
        { type: 'judgment_eod', date: extractedData.dates.dateJudgmentEOD, description: 'Judgment Entry on Docket' },
        { type: 'noa_filed', date: extractedData.dates.dateNOAFiled, description: 'Notice of Appeal Filed' },
        { type: 'recd_coa', date: extractedData.dates.dateRecdCoa, description: 'Received at Court of Appeals' }
      ];

      for (const dateInfo of dateTypes) {
        if (dateInfo.date) {
          const dateSQL = `
            INSERT INTO case_dates (case_id, date_type, date_value, description, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (case_id, date_type) DO UPDATE
            SET date_value = EXCLUDED.date_value,
                description = EXCLUDED.description,
                updated_at = NOW()
            RETURNING id
          `;

          const dateResult = await client.query(dateSQL, [
            caseRecord.id,
            dateInfo.type,
            dateInfo.date,
            dateInfo.description
          ]);

          console.log(`✅ Inserted/Updated ${dateInfo.description}: ${dateInfo.date}`);
        }
      }
      console.log();
    } else {
      console.log('ℹ️  No case_dates table found - dates not stored separately\n');
    }

    // Summary
    console.log('=== SUMMARY ===\n');
    console.log('✅ Judge information extracted and updated');
    console.log('✅ Originating court data processed');
    console.log('✅ Important dates recorded');
    console.log();
    console.log('Records Updated:');
    console.log('  - cases table: 1 record');
    if (hasJudgesTable) console.log('  - judges table: 2 records');
    if (hasOriginatingCourtsTable) console.log('  - originating_courts table: 1 record');
    if (hasCaseDatesTable) console.log('  - case_dates table: 4 records');
    console.log();
    console.log('✅ Agent 4 Complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
