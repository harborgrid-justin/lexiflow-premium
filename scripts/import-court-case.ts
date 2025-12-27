import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

// Configuration
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

interface CourtCaseImport {
  caseNumber: string;
  title: string;
  dateFiled: string;
  dateTerminated?: string;
  natureOfSuit: string;
  origCourt: string;
  caseType: string;
  parties: PartyImport[];
  docketEntries: DocketEntryImport[];
}

interface PartyImport {
  name: string;
  type: string;
  role: string;
  prisonerNumber?: string;
  attorneys: AttorneyImport[];
}

interface AttorneyImport {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  firm?: string;
}

interface DocketEntryImport {
  dateFiled: string;
  text: string;
  docLink?: string;
}

/**
 * Parse XML court case data
 */
function parseCourtCaseXML(xmlString: string): CourtCaseImport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const result = parser.parse(xmlString);
  const caseSummary = result.caseSummary;
  
  const stub = caseSummary.stub;
  const parties = Array.isArray(caseSummary.party) ? caseSummary.party : [caseSummary.party];
  const docketTexts = caseSummary.docketTexts?.docketText || [];
  const docketArray = Array.isArray(docketTexts) ? docketTexts : [docketTexts];

  // Parse parties
  const parsedParties: PartyImport[] = parties.map((party: any) => {
    const attorneys = Array.isArray(party.attorney) ? party.attorney : (party.attorney ? [party.attorney] : []);
    
    return {
      name: party['@_info'],
      type: extractPartyType(party['@_type']),
      role: extractPartyRole(party['@_type']),
      prisonerNumber: party['@_prisonerNumber'] || undefined,
      attorneys: attorneys.map((atty: any) => ({
        firstName: atty['@_firstName'],
        middleName: atty['@_middleName'] || undefined,
        lastName: atty['@_lastName'],
        email: atty['@_email'] || undefined,
        phone: atty['@_personalPhone'] || undefined,
        address: atty['@_address1'] || undefined,
        city: atty['@_city'] || undefined,
        state: atty['@_state'] || undefined,
        zip: atty['@_zip'] || undefined,
        firm: atty['@_office'] || undefined,
      })),
    };
  });

  // Parse docket entries
  const parsedDocketEntries: DocketEntryImport[] = docketArray
    .filter((entry: any) => entry['@_dateFiled'] && entry['@_text'])
    .map((entry: any) => ({
      dateFiled: entry['@_dateFiled'],
      text: entry['@_text'],
      docLink: entry['@_docLink'] || undefined,
    }));

  return {
    caseNumber: stub['@_caseNumber'],
    title: stub['@_shortTitle'],
    dateFiled: stub['@_dateFiled'],
    dateTerminated: stub['@_dateTerminated'] || undefined,
    natureOfSuit: stub['@_natureOfSuit'],
    origCourt: stub['@_origCourt'],
    caseType: caseSummary.caseType?.['@_type'] || 'Civil',
    parties: parsedParties,
    docketEntries: parsedDocketEntries,
  };
}

/**
 * Extract party type from description string
 */
function extractPartyType(typeString: string): string {
  const lower = typeString.toLowerCase();
  
  if (lower.includes('appellant')) return 'Appellant';
  if (lower.includes('appellee')) return 'Appellee';
  if (lower.includes('plaintiff')) return 'Plaintiff';
  if (lower.includes('defendant')) return 'Defendant';
  if (lower.includes('petitioner')) return 'Petitioner';
  if (lower.includes('respondent')) return 'Respondent';
  if (lower.includes('debtor')) return 'Appellant'; // Map debtor to appellant for bankruptcy
  if (lower.includes('creditor')) return 'Appellee'; // Map creditor to appellee
  
  return 'Other';
}

/**
 * Extract party role from description string
 */
function extractPartyRole(typeString: string): string {
  const lower = typeString.toLowerCase();
  
  if (lower.includes('appellant')) return 'appellant';
  if (lower.includes('appellee')) return 'appellee';
  if (lower.includes('plaintiff')) return 'plaintiff';
  if (lower.includes('defendant')) return 'defendant';
  if (lower.includes('petitioner')) return 'petitioner';
  if (lower.includes('respondent')) return 'respondent';
  
  return 'other';
}

/**
 * Map case type string to LexiFlow CaseType enum
 */
function mapCaseType(caseTypeStr: string): string {
  const lower = caseTypeStr.toLowerCase();
  
  if (lower.includes('bankruptcy')) return 'Bankruptcy';
  if (lower.includes('civil')) return 'Civil';
  if (lower.includes('criminal')) return 'Criminal';
  if (lower.includes('family')) return 'Family';
  if (lower.includes('immigration')) return 'Immigration';
  if (lower.includes('corporate')) return 'Corporate';
  if (lower.includes('labor')) return 'Labor';
  
  return 'Civil'; // Default
}

/**
 * Map docket entry text to type
 */
function inferDocketEntryType(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('motion')) return 'Motion';
  if (lower.includes('order')) return 'Order';
  if (lower.includes('notice')) return 'Notice';
  if (lower.includes('hearing')) return 'Hearing';
  if (lower.includes('judgment')) return 'Judgment';
  if (lower.includes('transcript')) return 'Transcript';
  if (lower.includes('exhibit')) return 'Exhibit';
  if (lower.includes('brief')) return 'Filing';
  if (lower.includes('response') || lower.includes('answer')) return 'Filing';
  if (lower.includes('affidavit') || lower.includes('certificate')) return 'Filing';
  
  return 'Other';
}

/**
 * Import case to LexiFlow backend
 */
async function importCaseToBackend(caseData: CourtCaseImport) {
  try {
    console.log(`\n📋 Importing case: ${caseData.caseNumber} - ${caseData.title}`);
    
    // Step 1: Create the case
    console.log('\n1️⃣ Creating case record...');
    const casePayload = {
      title: caseData.title,
      caseNumber: caseData.caseNumber,
      description: `${caseData.natureOfSuit}\n\nOriginating Court: ${caseData.origCourt}`,
      type: mapCaseType(caseData.caseType),
      status: caseData.dateTerminated ? 'Closed' : 'Active',
      practiceArea: 'Bankruptcy Appeals',
      jurisdiction: extractJurisdiction(caseData.origCourt),
      court: caseData.origCourt,
      causeOfAction: caseData.natureOfSuit,
      dateOpened: formatDate(caseData.dateFiled),
      dateClosed: caseData.dateTerminated ? formatDate(caseData.dateTerminated) : undefined,
    };

    const caseResponse = await axios.post(
      `${BACKEND_API_URL}/api/cases`,
      casePayload
    );
    
    const createdCase = caseResponse.data;
    const caseId = createdCase.id;
    console.log(`✅ Case created with ID: ${caseId}`);

    // Step 2: Add parties
    console.log(`\n2️⃣ Adding ${caseData.parties.length} parties...`);
    for (const party of caseData.parties) {
      try {
        const partyPayload = {
          caseId: caseId,
          name: cleanPartyName(party.name),
          description: party.name,
          type: party.type,
          role: party.role,
          counsel: party.attorneys.length > 0 
            ? party.attorneys.map(a => `${a.firstName} ${a.lastName}`).join(', ')
            : undefined,
          email: party.attorneys[0]?.email,
          phone: party.attorneys[0]?.phone,
          address: party.attorneys[0]?.address,
          city: party.attorneys[0]?.city,
          state: party.attorneys[0]?.state,
          zipCode: party.attorneys[0]?.zip,
        };

        await axios.post(`${BACKEND_API_URL}/api/parties`, partyPayload);
        console.log(`   ✓ Added party: ${party.name.substring(0, 50)}...`);
      } catch (error: any) {
        console.error(`   ✗ Failed to add party: ${error.message}`);
      }
    }

    // Step 3: Add docket entries
    console.log(`\n3️⃣ Adding ${caseData.docketEntries.length} docket entries...`);
    let sequenceNumber = 1;
    
    for (const entry of caseData.docketEntries) {
      try {
        const docketPayload = {
          caseId: caseId,
          sequenceNumber: sequenceNumber++,
          dateFiled: formatDate(entry.dateFiled),
          entryDate: formatDate(entry.dateFiled),
          description: truncateText(entry.text, 500),
          text: entry.text,
          type: inferDocketEntryType(entry.text),
          documentUrl: entry.docLink,
          ecfUrl: entry.docLink,
        };

        await axios.post(`${BACKEND_API_URL}/api/docket`, docketPayload);
        
        if (sequenceNumber % 10 === 0) {
          console.log(`   ✓ Added ${sequenceNumber} docket entries...`);
        }
      } catch (error: any) {
        console.error(`   ✗ Failed to add docket entry ${sequenceNumber}: ${error.message}`);
      }
    }
    
    console.log(`   ✓ Completed ${caseData.docketEntries.length} docket entries`);

    console.log('\n✅ Case import completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Case ID: ${caseId}`);
    console.log(`   - Case Number: ${caseData.caseNumber}`);
    console.log(`   - Parties: ${caseData.parties.length}`);
    console.log(`   - Docket Entries: ${caseData.docketEntries.length}`);
    
    return caseId;
  } catch (error: any) {
    console.error('\n❌ Error importing case:', error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Helper functions
 */
function cleanPartyName(name: string): string {
  // Remove newlines and extra whitespace
  return name.replace(/\s+/g, ' ').trim().substring(0, 255);
}

function extractJurisdiction(courtName: string): string {
  if (courtName.includes('Eastern District of Virginia')) return 'Virginia - Eastern District';
  if (courtName.includes('Virginia')) return 'Virginia';
  if (courtName.includes('Fourth Circuit')) return '4th Circuit Court of Appeals';
  return courtName.substring(0, 255);
}

function formatDate(dateStr: string): string {
  // Convert MM/DD/YYYY to YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Main execution
 */
async function main() {
  // The XML data from the user
  const xmlData = `<?xml version="1.0" encoding="UTF-8" ?>
<caseSummary><stub caseNumber="24-2160" dateFiled="11/20/2024" natureOfSuit="3422 Bankruptcy Appeals Rule 28 USC 158" dateTerminated="09/29/2025" shortTitle="Justin Saadein-Morales v. Westridge Swim &amp; Racquet Club, Inc." origCourt="United States District Court for the Eastern District of Virginia at Alexandria" /><caseType type="Bankruptcy-District Court" subType="from the district court" subSubType="null" /><origCourts><origCourt district="0422" division="1" caseNumber="1:24-cv-01442-LMB-IDD" leadCaseNumber="" caseNumberLink="https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD" leadCaseNumberLink="" dateFiled="08/16/2024" ><origPerson role="Presiding Judge" firstName="Leonie" middleName="M." lastName="Brinkema" generation="" title="U. S. District Court Judge" /><origPerson role="Ordering Judge" firstName="Ivan" middleName="Darnell" lastName="Davis" generation="" title="U. S. Magistrate Judge" /><origDateSet dateJudgment="11/15/2024" dateJudgmentEOD="11/18/2024" dateNOAFiled="11/18/2024" dateDecided="" dateRecdCoa="11/19/2024" dateSentence="" /></origCourt></origCourts><associatedCase leadCaseNumber="24-2160" memberCaseNumber="25-1229" associatedType="Consolidated" dateStart="04/25/2025" dateEnd="" /><party info="JUSTIN JEFFREY SAADEIN-MORALES" prisonerNumber="" type="

                     Debtor - Appellant

" ><attorney firstName="Justin" middleName="Jeffrey" lastName="Saadein-Morales" generation="" suffix="" title="" email="justin.saadein@harborgrid.com" fax="" address1="P. O. Box 55268" address2="" address3="" office="" unit="" room="" businessPhone="" personalPhone="678-650-6400" city="Washington" state="DC" zip="20040" terminationDate="" noticeInfo="[NTC Pro Se]" /></party><party info="WESTRIDGE SWIM &amp; RACQUET CLUB, INC., A Community Association" prisonerNumber="" type="

                     Creditor - Appellee

" ><attorney firstName="Thomas" middleName="Charles" lastName="Junker" generation="" suffix="" title="" email="thomas.junker@mercertrigiani.com" fax="" address1="112 South Alfred Street" address2="" address3="" office="MERCERTRIGIANI" unit="" room="" businessPhone="" personalPhone="703-837-5000" city="Alexandria" state="VA" zip="22314" terminationDate="" noticeInfo="[COR NTC Retained]" /><attorney firstName="Richard" middleName="A." lastName="Lash" generation="" suffix="" title="" email="rlash@bhlpc.com" fax="" address1="12355 Sunrise Valley Drive" address2="" address3="" office="BUONASSISSI, HENNING &amp; LASH, PC" unit="" room="Suite  650" businessPhone="" personalPhone="703-796-1341" city="Reston" state="VA" zip="20190" terminationDate="" noticeInfo="[COR NTC Retained]" /><attorney firstName="David" middleName="Storey" lastName="Mercer" generation="" suffix="" title="" email="" fax="" address1="112 South Alfred Street" address2="" address3="" office="MERCERTRIGIANI" unit="" room="" businessPhone="" personalPhone="202-659-6935" city="Alexandria" state="VA" zip="22314" terminationDate="" noticeInfo="[On Filing]" /></party><caption>JUSTIN JEFFREY SAADEIN-MORALES

                     Debtor - Appellant

v.

WESTRIDGE SWIM &amp; RACQUET CLUB, INC., A Community Association

                     Creditor - Appellee</caption><docketTexts><docketText dateFiled="11/20/2024" text="Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. [1001674931] [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010034992"/><docketText dateFiled="11/20/2024" text="INFORMAL BRIEFING ORDER filed. Mailed to: Saadein-Morales. [1001674934] Informal Opening Brief due 12/16/2024 Informal response brief, if any: 14 days after informal opening brief served. [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010035000"/><docketText dateFiled="11/20/2024" text="RECORD requested from Clerk of Court
 [1001674943]. Due: 12/04/2024. [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010035015"/><docketText dateFiled="11/22/2024" text="Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay; GRANT emergency motion; GRANT an administrative stay and STAY enforcement of State Court Order and all related proceedings; 3. ENJOIN collection or enforcement actions pending appeal; 4. WAIVE bond; GRANT any additional relief , for stay pending appeal. Date of action to be stayed, if applicable:November 15, 2024. , for injunctive relief pending appeal Date of action to be enjoined: November 15, 2024. Date and method of service: 11/22/2024 ecf.
 
 
 [1001676053] [24-2160] Justin Saadein-Morales" docLink="https://ecf.ca4.uscourts.gov/docs1/004010037735"/><docketText dateFiled="11/22/2024" text="CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: [&lt;A HREF='_SERVLETURL_/docs1/004010037735' target='new' ONCLICK=&quot;return doDocPostURL('004010037735','177028');&quot; &gt;4&lt;/A&gt;] Motion to enforce, [&lt;A HREF='_SERVLETURL_/docs1/004010037735' target='new' ONCLICK=&quot;return doDocPostURL('004010037735','177028');&quot; &gt;4&lt;/A&gt;] Motion for stay pending appeal, [&lt;A HREF='_SERVLETURL_/docs1/004010037735' target='new' ONCLICK=&quot;return doDocPostURL('004010037735','177028');&quot; &gt;4&lt;/A&gt;] Motion for injunctive relief pending appeal
 [1001676088] [24-2160] Justin Saadein-Morales" docLink="https://ecf.ca4.uscourts.gov/docs1/004010037841"/></docketTexts></caseSummary>`;

  try {
    console.log('🚀 LexiFlow Court Case Importer\n');
    console.log('Parsing XML data...');
    
    const parsedCase = parseCourtCaseXML(xmlData);
    
    console.log('\n📄 Parsed case details:');
    console.log(`   - Case Number: ${parsedCase.caseNumber}`);
    console.log(`   - Title: ${parsedCase.title}`);
    console.log(`   - Date Filed: ${parsedCase.dateFiled}`);
    console.log(`   - Parties: ${parsedCase.parties.length}`);
    console.log(`   - Docket Entries: ${parsedCase.docketEntries.length}`);
    
    const caseId = await importCaseToBackend(parsedCase);
    
    console.log(`\n🎉 Import successful! Case ID: ${caseId}`);
  } catch (error: any) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
main();
