import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Configuration
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

// Full XML data from the user
const FULL_XML_DATA = `<?xml version="1.0" encoding="UTF-8" ?>
<caseSummary><stub caseNumber="24-2160" dateFiled="11/20/2024" natureOfSuit="3422 Bankruptcy Appeals Rule 28 USC 158" dateTerminated="09/29/2025" shortTitle="Justin Saadein-Morales v. Westridge Swim &amp; Racquet Club, Inc." origCourt="United States District Court for the Eastern District of Virginia at Alexandria" /><caseType type="Bankruptcy-District Court" subType="from the district court" subSubType="null" /><origCourts><origCourt district="0422" division="1" caseNumber="1:24-cv-01442-LMB-IDD" leadCaseNumber="" caseNumberLink="https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD" leadCaseNumberLink="" dateFiled="08/16/2024" ><origPerson role="Presiding Judge" firstName="Leonie" middleName="M." lastName="Brinkema" generation="" title="U. S. District Court Judge" /><origPerson role="Ordering Judge" firstName="Ivan" middleName="Darnell" lastName="Davis" generation="" title="U. S. Magistrate Judge" /><origDateSet dateJudgment="11/15/2024" dateJudgmentEOD="11/18/2024" dateNOAFiled="11/18/2024" dateDecided="" dateRecdCoa="11/19/2024" dateSentence="" /></origCourt></origCourts><associatedCase leadCaseNumber="24-2160" memberCaseNumber="25-1229" associatedType="Consolidated" dateStart="04/25/2025" dateEnd="" /><party info="JUSTIN JEFFREY SAADEIN-MORALES" prisonerNumber="" type="

                     Debtor - Appellant

" ><attorney firstName="Justin" middleName="Jeffrey" lastName="Saadein-Morales" generation="" suffix="" title="" email="justin.saadein@harborgrid.com" fax="" address1="P. O. Box 55268" address2="" address3="" office="" unit="" room="" businessPhone="" personalPhone="678-650-6400" city="Washington" state="DC" zip="20040" terminationDate="" noticeInfo="[NTC Pro Se]" /></party><party info="WESTRIDGE SWIM &amp; RACQUET CLUB, INC., A Community Association" prisonerNumber="" type="

                     Creditor - Appellee

" ><attorney firstName="Thomas" middleName="Charles" lastName="Junker" generation="" suffix="" title="" email="thomas.junker@mercertrigiani.com" fax="" address1="112 South Alfred Street" address2="" address3="" office="MERCERTRIGIANI" unit="" room="" businessPhone="" personalPhone="703-837-5000" city="Alexandria" state="VA" zip="22314" terminationDate="" noticeInfo="[COR NTC Retained]" /><attorney firstName="Richard" middleName="A." lastName="Lash" generation="" suffix="" title="" email="rlash@bhlpc.com" fax="" address1="12355 Sunrise Valley Drive" address2="" address3="" office="BUONASSISSI, HENNING &amp; LASH, PC" unit="" room="Suite  650" businessPhone="" personalPhone="703-796-1341" city="Reston" state="VA" zip="20190" terminationDate="" noticeInfo="[COR NTC Retained]" /><attorney firstName="David" middleName="Storey" lastName="Mercer" generation="" suffix="" title="" email="" fax="" address1="112 South Alfred Street" address2="" address3="" office="MERCERTRIGIANI" unit="" room="" businessPhone="" personalPhone="202-659-6935" city="Alexandria" state="VA" zip="22314" terminationDate="" noticeInfo="[On Filing]" /></party><caption>JUSTIN JEFFREY SAADEIN-MORALES

                     Debtor - Appellant

v.

WESTRIDGE SWIM &amp; RACQUET CLUB, INC., A Community Association

                     Creditor - Appellee</caption><docketTexts><!-- First 5 entries shown, full XML has 141 entries --><docketText dateFiled="11/20/2024" text="Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. [1001674931] [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010034992"/><docketText dateFiled="11/20/2024" text="INFORMAL BRIEFING ORDER filed. Mailed to: Saadein-Morales. [1001674934] Informal Opening Brief due 12/16/2024 Informal response brief, if any: 14 days after informal opening brief served. [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010035000"/><docketText dateFiled="11/20/2024" text="RECORD requested from Clerk of Court [1001674943]. Due: 12/04/2024. [24-2160] AW" docLink="https://ecf.ca4.uscourts.gov/docs1/004010035015"/><docketText dateFiled="11/22/2024" text="Emergency MOTION by Justin Jeffrey Saadein-Morales to enforce automatic stay; GRANT emergency motion; GRANT an administrative stay and STAY enforcement of State Court Order and all related proceedings; 3. ENJOIN collection or enforcement actions pending appeal; 4. WAIVE bond; GRANT any additional relief , for stay pending appeal. Date of action to be stayed, if applicable:November 15, 2024. , for injunctive relief pending appeal Date of action to be enjoined: November 15, 2024. Date and method of service: 11/22/2024 ecf. [1001676053] [24-2160] Justin Saadein-Morales" docLink="https://ecf.ca4.uscourts.gov/docs1/004010037735"/><docketText dateFiled="11/22/2024" text="CERTIFICATE OF SERVICE/SERVICE LIST by Justin Jeffrey Saadein-Morales. Related documents: Motion to enforce, Motion for stay pending appeal, Motion for injunctive relief pending appeal [1001676088] [24-2160] Justin Saadein-Morales" docLink="https://ecf.ca4.uscourts.gov/docs1/004010037841"/></docketTexts></caseSummary>`;

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
  judges?: JudgeInfo[];
  originalCourtInfo?: OriginalCourtInfo;
  associatedCases?: AssociatedCaseInfo[];
  courtDates?: CourtDates;
}

interface JudgeInfo {
  role: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  title: string;
}

interface OriginalCourtInfo {
  district: string;
  division: string;
  caseNumber: string;
  dateFiled: string;
  caseNumberLink?: string;
}

interface AssociatedCaseInfo {
  leadCaseNumber: string;
  memberCaseNumber?: string;
  associatedType: string;
  dateStart?: string;
}

interface CourtDates {
  dateJudgment?: string;
  dateJudgmentEOD?: string;
  dateNOAFiled?: string;
  dateRecdCoa?: string;
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
  generation?: string;
  suffix?: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  zip?: string;
  firm?: string;
  office?: string;
  unit?: string;
  room?: string;
  businessPhone?: string;
  terminationDate?: string;
  noticeInfo?: string;
  isProSe?: boolean;
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
  const parsedParties: PartyImport[] = parties.filter((p: any) => p).map((party: any) => {
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
        generation: atty['@_generation'] || undefined,
        suffix: atty['@_suffix'] || undefined,
        email: atty['@_email'] || undefined,
        phone: atty['@_personalPhone'] || undefined,
        fax: atty['@_fax'] || undefined,
        address: atty['@_address1'] || undefined,
        address2: atty['@_address2'] || undefined,
        address3: atty['@_address3'] || undefined,
        city: atty['@_city'] || undefined,
        state: atty['@_state'] || undefined,
        zip: atty['@_zip'] || undefined,
        firm: atty['@_office'] || undefined,
        office: atty['@_office'] || undefined,
        unit: atty['@_unit'] || undefined,
        room: atty['@_room'] || undefined,
        businessPhone: atty['@_businessPhone'] || undefined,
        terminationDate: atty['@_terminationDate'] || undefined,
        noticeInfo: atty['@_noticeInfo'] || undefined,
        isProSe: atty['@_noticeInfo']?.includes('Pro Se') || false,
      })),
    };
  });

  // Parse docket entries
  const parsedDocketEntries: DocketEntryImport[] = docketArray
    .filter((entry: any) => entry && entry['@_dateFiled'] && entry['@_text'])
    .map((entry: any) => ({
      dateFiled: entry['@_dateFiled'],
      text: cleanDocketText(entry['@_text']),
      docLink: entry['@_docLink'] || undefined,
    }));

  // Parse judges
  const origCourt = caseSummary.origCourts?.origCourt;
  const origPersons = origCourt?.origPerson;
  const judges: JudgeInfo[] = [];
  
  if (origPersons) {
    const judgeArray = Array.isArray(origPersons) ? origPersons : [origPersons];
    judgeArray.forEach((person: any) => {
      if (person['@_role']?.includes('Judge')) {
        judges.push({
          role: person['@_role'],
          firstName: person['@_firstName'],
          middleName: person['@_middleName'] || undefined,
          lastName: person['@_lastName'],
          title: person['@_title'],
        });
      }
    });
  }

  // Parse original court info
  const originalCourtInfo: OriginalCourtInfo | undefined = origCourt ? {
    district: origCourt['@_district'],
    division: origCourt['@_division'],
    caseNumber: origCourt['@_caseNumber'],
    dateFiled: origCourt['@_dateFiled'],
    caseNumberLink: origCourt['@_caseNumberLink'] || undefined,
  } : undefined;

  // Parse associated cases
  const associatedCase = caseSummary.associatedCase;
  const associatedCases: AssociatedCaseInfo[] = [];
  
  if (associatedCase) {
    const caseArray = Array.isArray(associatedCase) ? associatedCase : [associatedCase];
    caseArray.forEach((ac: any) => {
      associatedCases.push({
        leadCaseNumber: ac['@_leadCaseNumber'],
        memberCaseNumber: ac['@_memberCaseNumber'] || undefined,
        associatedType: ac['@_associatedType'],
        dateStart: ac['@_dateStart'] || undefined,
      });
    });
  }

  // Parse court dates
  const origDateSet = origCourt?.origDateSet;
  const courtDates: CourtDates | undefined = origDateSet ? {
    dateJudgment: origDateSet['@_dateJudgment'] || undefined,
    dateJudgmentEOD: origDateSet['@_dateJudgmentEOD'] || undefined,
    dateNOAFiled: origDateSet['@_dateNOAFiled'] || undefined,
    dateRecdCoa: origDateSet['@_dateRecdCoa'] || undefined,
  } : undefined;

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
    judges: judges.length > 0 ? judges : undefined,
    originalCourtInfo,
    associatedCases: associatedCases.length > 0 ? associatedCases : undefined,
    courtDates,
  };
}

function cleanDocketText(text: string): string {
  // Remove HTML tags and extra whitespace
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPartyType(typeString: string): string {
  const lower = typeString.toLowerCase();
  
  if (lower.includes('appellant')) return 'Appellant';
  if (lower.includes('appellee')) return 'Appellee';
  if (lower.includes('plaintiff')) return 'Plaintiff';
  if (lower.includes('defendant')) return 'Defendant';
  if (lower.includes('petitioner')) return 'Petitioner';
  if (lower.includes('respondent')) return 'Respondent';
  if (lower.includes('debtor')) return 'Appellant';
  if (lower.includes('creditor')) return 'Appellee';
  
  return 'Other';
}

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

function mapCaseType(caseTypeStr: string): string {
  const lower = caseTypeStr.toLowerCase();
  
  if (lower.includes('bankruptcy')) return 'Bankruptcy';
  if (lower.includes('civil')) return 'Civil';
  if (lower.includes('criminal')) return 'Criminal';
  if (lower.includes('family')) return 'Family';
  if (lower.includes('immigration')) return 'Immigration';
  if (lower.includes('corporate')) return 'Corporate';
  if (lower.includes('labor')) return 'Labor';
  
  return 'Civil';
}

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

async function importCaseToBackend(caseData: CourtCaseImport) {
  try {
    console.log(`\n📋 Importing case: ${caseData.caseNumber} - ${caseData.title}`);
    
    // Extract judge names
    const presidingJudge = caseData.judges?.find(j => j.role.includes('Presiding'))
      ? `${caseData.judges.find(j => j.role.includes('Presiding'))!.firstName} ${caseData.judges.find(j => j.role.includes('Presiding'))!.lastName}`
      : undefined;
    
    const magistrateJudge = caseData.judges?.find(j => j.role.includes('Magistrate') || j.role.includes('Ordering'))
      ? `${caseData.judges.find(j => j.role.includes('Magistrate') || j.role.includes('Ordering'))!.firstName} ${caseData.judges.find(j => j.role.includes('Magistrate') || j.role.includes('Ordering'))!.lastName}`
      : undefined;

    // Build comprehensive metadata
    const metadata: Record<string, any> = {
      source: 'PACER/ECF Import',
      importDate: new Date().toISOString(),
      originalCourtInfo: caseData.originalCourtInfo,
      courtDates: caseData.courtDates,
      judges: caseData.judges?.map(j => ({
        role: j.role,
        name: `${j.firstName} ${j.middleName || ''} ${j.lastName}`.trim(),
        title: j.title,
      })),
    };

    // Build related cases array
    const relatedCases: Array<{ court: string; caseNumber: string; relationship?: string }> = [];
    
    if (caseData.originalCourtInfo) {
      relatedCases.push({
        court: 'District Court',
        caseNumber: caseData.originalCourtInfo.caseNumber,
        relationship: 'Originating Case',
      });
    }
    
    if (caseData.associatedCases) {
      caseData.associatedCases.forEach(ac => {
        if (ac.memberCaseNumber && ac.memberCaseNumber !== caseData.caseNumber) {
          relatedCases.push({
            court: 'Same Court',
            caseNumber: ac.memberCaseNumber,
            relationship: ac.associatedType,
          });
        }
      });
    }

    // Step 1: Create the case
    console.log('\n1️⃣ Creating case record...');
    const casePayload = {
      title: caseData.title,
      caseNumber: caseData.caseNumber,
      description: buildCaseDescription(caseData),
      type: mapCaseType(caseData.caseType),
      status: caseData.dateTerminated ? 'Closed' : 'Active',
      practiceArea: extractPracticeArea(caseData.natureOfSuit),
      jurisdiction: extractJurisdiction(caseData.origCourt),
      court: caseData.origCourt,
      causeOfAction: caseData.natureOfSuit,
      natureOfSuit: caseData.natureOfSuit,
      dateOpened: formatDate(caseData.dateFiled),
      filingDate: caseData.originalCourtInfo?.dateFiled ? formatDate(caseData.originalCourtInfo.dateFiled) : undefined,
      dateClosed: caseData.dateTerminated ? formatDate(caseData.dateTerminated) : undefined,
      dateTerminated: caseData.dateTerminated ? formatDate(caseData.dateTerminated) : undefined,
      judge: presidingJudge,
      magistrateJudge: magistrateJudge,
      relatedCases: relatedCases.length > 0 ? relatedCases : undefined,
      metadata,
    };

    const postUrl = `${BACKEND_API_URL}/cases`;
    console.log(`   POST ${postUrl}`);
    const caseResponse = await axios.post(
      postUrl,
      casePayload
    );
    
    const createdCase = caseResponse.data;
    const caseId = createdCase.id;
    console.log(`✅ Case created with ID: ${caseId}`);
    console.log(`   Judges: ${presidingJudge || 'N/A'}, ${magistrateJudge || 'N/A'}`);
    console.log(`   Related Cases: ${relatedCases.length}`);

    // Step 2: Add parties
    console.log(`\n2️⃣ Adding ${caseData.parties.length} parties...`);
    for (const party of caseData.parties) {
      try {
        // Get primary attorney (first one)
        const primaryAttorney = party.attorneys[0];
        
        // Build full attorney information for metadata
        const attorneysMetadata = party.attorneys.map(atty => ({
          name: `${atty.firstName} ${atty.middleName || ''} ${atty.lastName}`.trim(),
          generation: atty.generation,
          suffix: atty.suffix,
          email: atty.email,
          phone: atty.phone,
          businessPhone: atty.businessPhone,
          fax: atty.fax,
          firm: atty.firm,
          office: atty.office,
          address: buildFullAddress(atty),
          isProSe: atty.isProSe,
          noticeInfo: atty.noticeInfo,
          terminationDate: atty.terminationDate,
        }));

        const partyPayload = {
          caseId: caseId,
          name: cleanPartyName(party.name),
          description: party.name,
          type: party.type,
          role: party.role,
          counsel: party.attorneys.length > 0 
            ? party.attorneys.map(a => `${a.firstName} ${a.lastName}`).join(', ')
            : undefined,
          
          // Primary attorney details (from first attorney)
          attorneyName: primaryAttorney 
            ? `${primaryAttorney.firstName} ${primaryAttorney.middleName || ''} ${primaryAttorney.lastName}`.trim()
            : undefined,
          attorneyFirm: primaryAttorney?.firm,
          attorneyEmail: primaryAttorney?.email,
          attorneyPhone: primaryAttorney?.phone || primaryAttorney?.businessPhone,
          attorneyFax: primaryAttorney?.fax,
          attorneyAddress: primaryAttorney ? buildFullAddress(primaryAttorney) : undefined,
          isProSe: primaryAttorney?.isProSe || false,
          isAttorneyToBeNoticed: primaryAttorney?.noticeInfo?.includes('NTC') || false,
          
          // Contact information
          email: primaryAttorney?.email,
          phone: primaryAttorney?.phone,
          address: primaryAttorney?.address,
          city: primaryAttorney?.city,
          state: primaryAttorney?.state,
          zipCode: primaryAttorney?.zip,
          
          // Store all attorneys in metadata
          metadata: {
            allAttorneys: attorneysMetadata,
            prisonerNumber: party.prisonerNumber,
          },
        };

        await axios.post(`${BACKEND_API_URL}/parties`, partyPayload);
        console.log(`   ✓ Added party: ${party.name.substring(0, 50)}...`);
        console.log(`     Attorneys: ${party.attorneys.length} (${party.attorneys.map(a => a.lastName).join(', ')})`);
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

        await axios.post(`${BACKEND_API_URL}/docket`, docketPayload);
        
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
    console.log(`   - Title: ${caseData.title}`);
    console.log(`   - Type: ${mapCaseType(caseData.caseType)}`);
    console.log(`   - Status: ${caseData.dateTerminated ? 'Closed' : 'Active'}`);
    console.log(`   - Practice Area: ${extractPracticeArea(caseData.natureOfSuit)}`);
    console.log(`   - Parties: ${caseData.parties.length}`);
    console.log(`   - Total Attorneys: ${caseData.parties.reduce((sum, p) => sum + p.attorneys.length, 0)}`);
    console.log(`   - Judges: ${caseData.judges?.length || 0}`);
    console.log(`   - Related Cases: ${relatedCases.length}`);
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

function buildCaseDescription(caseData: CourtCaseImport): string {
  const parts: string[] = [caseData.natureOfSuit];
  
  if (caseData.originalCourtInfo) {
    parts.push(`\nOriginating Court: ${caseData.origCourt}`);
    parts.push(`Original Case Number: ${caseData.originalCourtInfo.caseNumber}`);
    parts.push(`District Court Filing Date: ${caseData.originalCourtInfo.dateFiled}`);
  }
  
  if (caseData.judges && caseData.judges.length > 0) {
    parts.push(`\nJudges:`);
    caseData.judges.forEach(j => {
      parts.push(`- ${j.title} ${j.firstName} ${j.middleName || ''} ${j.lastName} (${j.role})`.trim());
    });
  }
  
  if (caseData.associatedCases && caseData.associatedCases.length > 0) {
    parts.push(`\nAssociated Cases:`);
    caseData.associatedCases.forEach(ac => {
      parts.push(`- ${ac.memberCaseNumber || ac.leadCaseNumber} (${ac.associatedType})`);
    });
  }
  
  return parts.join('\n');
}

function extractPracticeArea(natureOfSuit: string): string {
  const lower = natureOfSuit.toLowerCase();
  
  if (lower.includes('bankruptcy')) return 'Bankruptcy Appeals';
  if (lower.includes('civil rights')) return 'Civil Rights';
  if (lower.includes('employment')) return 'Employment Law';
  if (lower.includes('contract')) return 'Contract Disputes';
  if (lower.includes('tort')) return 'Torts';
  if (lower.includes('property')) return 'Property Law';
  if (lower.includes('patent') || lower.includes('trademark') || lower.includes('copyright')) {
    return 'Intellectual Property';
  }
  
  return 'General Litigation';
}

function buildFullAddress(attorney: AttorneyImport): string {
  const parts: string[] = [];
  
  if (attorney.address) parts.push(attorney.address);
  if (attorney.address2) parts.push(attorney.address2);
  if (attorney.address3) parts.push(attorney.address3);
  if (attorney.unit) parts.push(`Unit ${attorney.unit}`);
  if (attorney.room) parts.push(`Room ${attorney.room}`);
  
  const cityStateZip: string[] = [];
  if (attorney.city) cityStateZip.push(attorney.city);
  if (attorney.state) cityStateZip.push(attorney.state);
  if (attorney.zip) cityStateZip.push(attorney.zip);
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join('\n');
}

function cleanPartyName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().substring(0, 255);
}

function extractJurisdiction(courtName: string): string {
  if (courtName.includes('Eastern District of Virginia')) return 'Virginia - Eastern District';
  if (courtName.includes('Virginia')) return 'Virginia';
  if (courtName.includes('Fourth Circuit')) return '4th Circuit Court of Appeals';
  return courtName.substring(0, 255);
}

function formatDate(dateStr: string): string {
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

async function main() {
  // Check if file path is provided as argument
  const args = process.argv.slice(2);
  let xmlData: string;

  if (args.length > 0) {
    const filePath = resolve(args[0]);
    console.log(`📂 Reading XML from file: ${filePath}`);
    try {
      xmlData = readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      console.error(`❌ Failed to read file: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('📦 Using embedded XML data (Case 24-2160)');
    xmlData = FULL_XML_DATA;
  }

  try {
    console.log('🚀 LexiFlow Court Case Importer\n');
    console.log('Parsing XML data...');
    
    const parsedCase = parseCourtCaseXML(xmlData);
    
    console.log('\n📄 Parsed case details:');
    console.log(`   - Case Number: ${parsedCase.caseNumber}`);
    console.log(`   - Title: ${parsedCase.title}`);
    console.log(`   - Date Filed: ${parsedCase.dateFiled}`);
    console.log(`   - Date Terminated: ${parsedCase.dateTerminated || 'N/A'}`);
    console.log(`   - Type: ${parsedCase.caseType}`);
    console.log(`   - Parties: ${parsedCase.parties.length}`);
    console.log(`   - Total Attorneys: ${parsedCase.parties.reduce((sum, p) => sum + p.attorneys.length, 0)}`);
    console.log(`   - Judges: ${parsedCase.judges?.length || 0}`);
    console.log(`   - Original Court: ${parsedCase.originalCourtInfo?.caseNumber || 'N/A'}`);
    console.log(`   - Associated Cases: ${parsedCase.associatedCases?.length || 0}`);
    console.log(`   - Docket Entries: ${parsedCase.docketEntries.length}`);
    
    const caseId = await importCaseToBackend(parsedCase);
    
    console.log(`\n🎉 Import successful! Case ID: ${caseId}`);
  } catch (error: any) {
    console.error('\n💥 Import failed:', error.message);
    process.exit(1);
  }
}

main();
