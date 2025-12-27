/**
 * Docket XML Import Script
 * 
 * This script imports a PACER docket XML file into the LexiFlow database.
 * 
 * Usage:
 *   1. Place your XML file in the workspace or copy XML content into the xmlContent variable
 *   2. Run: node scripts/import-docket.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = 'http://localhost:5000/api/v1';
const XML_FILE_PATH = process.argv[2]; // Optional: pass file path as argument

// ============================================================================
// XML PARSER
// ============================================================================
const { DOMParser } = require('xmldom');

/**
 * Parse PACER XML and extract docket entries and case info
 */
function parsePacerXML(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  // Check for parse errors
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`);
  }

  // Extract case info from stub
  const stub = doc.getElementsByTagName('stub')[0];
  if (!stub) {
    throw new Error('Missing required <stub> element in XML');
  }

  const caseInfo = {
    caseNumber: stub.getAttribute('caseNumber') || '',
    caseTitle: stub.getAttribute('shortTitle') || 'Unknown Case',
    courtId: stub.getAttribute('origCourt') || '',
    dateFiled: stub.getAttribute('dateFiled') || '',
    dateTerminated: stub.getAttribute('dateTerminated') || null,
    natureOfSuit: stub.getAttribute('natureOfSuit') || '',
  };

  // Extract docket entries
  const entries = [];
  const entryNodes = doc.getElementsByTagName('entry');
  
  for (let i = 0; i < entryNodes.length; i++) {
    const entry = entryNodes[i];
    const number = entry.getAttribute('number');
    const date = entry.getAttribute('date');
    const filed = entry.getAttribute('filed');
    
    // Get text content (description)
    let description = '';
    for (let j = 0; j < entry.childNodes.length; j++) {
      const child = entry.childNodes[j];
      if (child.nodeType === 3) { // Text node
        description += child.nodeValue.trim() + ' ';
      }
    }
    description = description.trim();
    
    entries.push({
      sequenceNumber: parseInt(number) || i + 1,
      date: date || filed || '',
      dateFiled: filed || date || '',
      title: description.substring(0, 200), // Limit title length
      description: description,
      type: classifyEntryType(description),
    });
  }

  return { caseInfo, entries };
}

/**
 * Classify docket entry type based on description
 */
function classifyEntryType(description) {
  const desc = description.toLowerCase();
  
  if (desc.includes('complaint') || desc.includes('petition')) return 'Complaint';
  if (desc.includes('answer')) return 'Answer';
  if (desc.includes('motion')) return 'Motion';
  if (desc.includes('order')) return 'Order';
  if (desc.includes('notice')) return 'Notice';
  if (desc.includes('brief') || desc.includes('memorandum')) return 'Brief';
  if (desc.includes('transcript')) return 'Transcript';
  if (desc.includes('exhibit')) return 'Exhibit';
  if (desc.includes('stipulation')) return 'Stipulation';
  if (desc.includes('judgment') || desc.includes('verdict')) return 'Judgment';
  
  return 'Other';
}

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Create or find a case
 */
async function ensureCase(caseInfo) {
  try {
    // Try to find existing case
    const response = await fetch(`${API_BASE_URL}/cases`);
    const casesData = await response.json();
    const cases = casesData.data || casesData;
    
    const existing = cases.find(c => c.caseNumber === caseInfo.caseNumber);
    if (existing) {
      console.log(`✓ Found existing case: ${existing.title} (${existing.id})`);
      return existing;
    }
    
    // Create new case
    console.log(`Creating new case: ${caseInfo.caseTitle}`);
    const createResponse = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: caseInfo.caseTitle,
        caseNumber: caseInfo.caseNumber,
        court: caseInfo.courtId,
        filingDate: caseInfo.dateFiled,
        status: caseInfo.dateTerminated ? 'Closed' : 'Active',
        jurisdiction: 'Federal',
        type: 'Civil',
      }),
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create case: ${createResponse.status} - ${errorText}`);
    }
    
    const newCase = await createResponse.json();
    console.log(`✓ Created case: ${newCase.title} (${newCase.id})`);
    return newCase;
  } catch (error) {
    throw new Error(`Case creation failed: ${error.message}`);
  }
}

/**
 * Import docket entries
 */
async function importDocketEntries(caseId, entries) {
  console.log(`\nImporting ${entries.length} docket entries...`);
  let successCount = 0;
  let errorCount = 0;
  
  for (const entry of entries) {
    try {
      const response = await fetch(`${API_BASE_URL}/docket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseId,
          sequenceNumber: entry.sequenceNumber,
          date: entry.date,
          dateFiled: entry.dateFiled,
          title: entry.title,
          description: entry.description,
          type: entry.type,
        }),
      });
      
      if (response.ok) {
        successCount++;
        process.stdout.write(`\r✓ Imported ${successCount}/${entries.length} entries`);
      } else {
        errorCount++;
        const errorText = await response.text();
        console.error(`\n✗ Failed entry #${entry.sequenceNumber}: ${errorText}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`\n✗ Error importing entry #${entry.sequenceNumber}: ${error.message}`);
    }
  }
  
  console.log(`\n\n📊 Import Summary:`);
  console.log(`   ✓ Success: ${successCount}`);
  console.log(`   ✗ Errors: ${errorCount}`);
  console.log(`   Total: ${entries.length}`);
  
  return { successCount, errorCount };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 LexiFlow Docket Import Tool\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Load XML
    let xmlContent;
    
    if (XML_FILE_PATH) {
      console.log(`📂 Reading XML file: ${XML_FILE_PATH}`);
      const fullPath = path.resolve(XML_FILE_PATH);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }
      
      xmlContent = fs.readFileSync(fullPath, 'utf-8');
    } else {
      // Paste your XML content here if not using file argument
      console.log('⚠️  No file path provided as argument.');
      console.log('📝 Please edit this script and paste XML content in the xmlContent variable,');
      console.log('   or run: node scripts/import-docket.js path/to/file.xml\n');
      process.exit(1);
    }
    
    console.log(`✓ Loaded XML (${xmlContent.length} bytes)\n`);
    
    // Step 2: Parse XML
    console.log('🔍 Parsing PACER XML...');
    const { caseInfo, entries } = parsePacerXML(xmlContent);
    
    console.log(`✓ Parsed successfully:`);
    console.log(`   Case: ${caseInfo.caseTitle}`);
    console.log(`   Number: ${caseInfo.caseNumber}`);
    console.log(`   Court: ${caseInfo.courtId}`);
    console.log(`   Filed: ${caseInfo.dateFiled}`);
    console.log(`   Entries: ${entries.length}\n`);
    
    // Step 3: Ensure case exists
    console.log('📁 Checking/creating case...');
    const caseRecord = await ensureCase(caseInfo);
    
    // Step 4: Import docket entries
    await importDocketEntries(caseRecord.id, entries);
    
    console.log('\n✅ Import completed successfully!');
    console.log(`\nView case in LexiFlow: http://localhost:5173/cases/${caseRecord.id}`);
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { parsePacerXML, classifyEntryType };
