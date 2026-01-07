import axios from "axios";
import * as dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend .env file
dotenv.config({ path: resolve(__dirname, "../backend/.env") });

// Configuration from backend .env
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3000";
const AUTH_EMAIL = process.env.AUTH_EMAIL || "admin@lexiflow.com";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "password";

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
    attributeNamePrefix: "@_",
  });

  const result = parser.parse(xmlString);
  const caseSummary = result.caseSummary;

  const stub = caseSummary.stub;
  const parties = Array.isArray(caseSummary.party)
    ? caseSummary.party
    : [caseSummary.party];
  const docketTexts = caseSummary.docketTexts?.docketText || [];
  const docketArray = Array.isArray(docketTexts) ? docketTexts : [docketTexts];

  // Parse parties
  const parsedParties: PartyImport[] = parties
    .filter((p: any) => p)
    .map((party: any) => {
      // Handling attorney array safely
      let attorneys = [];
      if (party.attorney) {
        if (Array.isArray(party.attorney)) {
          attorneys = party.attorney;
        } else {
          attorneys = [party.attorney];
        }
      }

      return {
        name: party["@_info"],
        type: extractPartyType(party["@_type"]),
        role: extractPartyRole(party["@_type"]),
        prisonerNumber: party["@_prisonerNumber"] || undefined,
        attorneys: attorneys.map((atty: any) => ({
          firstName: atty["@_firstName"],
          middleName: atty["@_middleName"] || undefined,
          lastName: atty["@_lastName"],
          generation: atty["@_generation"] || undefined,
          suffix: atty["@_suffix"] || undefined,
          email: atty["@_email"] || undefined,
          phone: atty["@_personalPhone"] || undefined,
          fax: atty["@_fax"] || undefined,
          address: atty["@_address1"] || undefined,
          address2: atty["@_address2"] || undefined,
          address3: atty["@_address3"] || undefined,
          city: atty["@_city"] || undefined,
          state: atty["@_state"] || undefined,
          zip: atty["@_zip"] || undefined,
          firm: atty["@_office"] || undefined,
          office: atty["@_office"] || undefined,
          unit: atty["@_unit"] || undefined,
          room: atty["@_room"] || undefined,
          businessPhone: atty["@_businessPhone"] || undefined,
          terminationDate: atty["@_terminationDate"] || undefined,
          noticeInfo: atty["@_noticeInfo"] || undefined,
          isProSe: atty["@_noticeInfo"]?.includes("Pro Se") || false,
        })),
      };
    });

  // Parse docket entries
  const parsedDocketEntries: DocketEntryImport[] = docketArray
    .filter((entry: any) => entry && entry["@_dateFiled"] && entry["@_text"])
    .map((entry: any) => ({
      dateFiled: entry["@_dateFiled"],
      text: cleanDocketText(entry["@_text"]),
      docLink: entry["@_docLink"] || undefined,
    }));

  // Parse judges
  const origCourt = caseSummary.origCourts?.origCourt;
  const origPersons = origCourt?.origPerson;
  const judges: JudgeInfo[] = [];

  if (origPersons) {
    const judgeArray = Array.isArray(origPersons) ? origPersons : [origPersons];
    judgeArray.forEach((person: any) => {
      if (person["@_role"]?.includes("Judge")) {
        judges.push({
          role: person["@_role"],
          firstName: person["@_firstName"],
          middleName: person["@_middleName"] || undefined,
          lastName: person["@_lastName"],
          title: person["@_title"],
        });
      }
    });
  }

  // Parse original court info
  const originalCourtInfo: OriginalCourtInfo | undefined = origCourt
    ? {
        district: origCourt["@_district"],
        division: origCourt["@_division"],
        caseNumber: origCourt["@_caseNumber"],
        dateFiled: origCourt["@_dateFiled"],
        caseNumberLink: origCourt["@_caseNumberLink"] || undefined,
      }
    : undefined;

  // Parse associated cases
  const associatedCase = caseSummary.associatedCase;
  const associatedCases: AssociatedCaseInfo[] = [];

  if (associatedCase) {
    const caseArray = Array.isArray(associatedCase)
      ? associatedCase
      : [associatedCase];
    caseArray.forEach((ac: any) => {
      associatedCases.push({
        leadCaseNumber: ac["@_leadCaseNumber"],
        memberCaseNumber: ac["@_memberCaseNumber"] || undefined,
        associatedType: ac["@_associatedType"],
        dateStart: ac["@_dateStart"] || undefined,
      });
    });
  }

  // Parse court dates
  const origDateSet = origCourt?.origDateSet;
  const courtDates: CourtDates | undefined = origDateSet
    ? {
        dateJudgment: origDateSet["@_dateJudgment"] || undefined,
        dateJudgmentEOD: origDateSet["@_dateJudgmentEOD"] || undefined,
        dateNOAFiled: origDateSet["@_dateNOAFiled"] || undefined,
        dateRecdCoa: origDateSet["@_dateRecdCoa"] || undefined,
      }
    : undefined;

  return {
    caseNumber: stub["@_caseNumber"],
    title: stub["@_shortTitle"],
    dateFiled: stub["@_dateFiled"],
    dateTerminated: stub["@_dateTerminated"] || undefined,
    natureOfSuit: stub["@_natureOfSuit"],
    origCourt: stub["@_origCourt"],
    caseType: caseSummary.caseType?.["@_type"] || "Civil",
    parties: parsedParties,
    docketEntries: parsedDocketEntries,
    judges: judges.length > 0 ? judges : undefined,
    originalCourtInfo,
    associatedCases: associatedCases.length > 0 ? associatedCases : undefined,
    courtDates,
  };
}

function cleanDocketText(text: string): string {
  if (!text) return "";
  // Remove HTML tags and extra whitespace
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractPartyType(typeString: string): string {
  if (!typeString) return "Other";
  const lower = typeString.toLowerCase();

  if (lower.includes("appellant")) return "Appellant";
  if (lower.includes("appellee")) return "Appellee";
  if (lower.includes("plaintiff")) return "Plaintiff";
  if (lower.includes("defendant")) return "Defendant";
  if (lower.includes("petitioner")) return "Petitioner";
  if (lower.includes("respondent")) return "Respondent";
  if (lower.includes("debtor")) return "Appellant";
  if (lower.includes("creditor")) return "Appellee";

  return "Other";
}

function extractPartyRole(typeString: string): string {
  if (!typeString) return "other";
  const lower = typeString.toLowerCase();

  if (lower.includes("appellant")) return "appellant";
  if (lower.includes("appellee")) return "appellee";
  if (lower.includes("plaintiff")) return "plaintiff";
  if (lower.includes("defendant")) return "defendant";
  if (lower.includes("petitioner")) return "petitioner";
  if (lower.includes("respondent")) return "respondent";

  return "other";
}

function mapCaseType(caseTypeStr: string): string {
  if (!caseTypeStr) return "Civil";
  const lower = caseTypeStr.toLowerCase();

  if (lower.includes("bankruptcy")) return "Bankruptcy";
  if (lower.includes("civil")) return "Civil";
  if (lower.includes("criminal")) return "Criminal";
  if (lower.includes("family")) return "Family";
  if (lower.includes("immigration")) return "Immigration";
  if (lower.includes("corporate")) return "Corporate";
  if (lower.includes("labor")) return "Labor";

  return "Civil";
}

function inferDocketEntryType(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("motion")) return "Motion";
  if (lower.includes("order")) return "Order";
  if (lower.includes("notice")) return "Notice";
  if (lower.includes("hearing")) return "Hearing";
  if (lower.includes("judgment")) return "Judgment";
  if (lower.includes("transcript")) return "Transcript";
  if (lower.includes("exhibit")) return "Exhibit";
  if (lower.includes("brief")) return "Filing";
  if (lower.includes("response") || lower.includes("answer")) return "Filing";
  if (lower.includes("affidavit") || lower.includes("certificate"))
    return "Filing";

  return "Other";
}

/**
 * Login and get JWT token
 */
async function login(): Promise<string> {
  try {
    console.log("🔐 Authenticating...");
    console.log(`   Email: ${AUTH_EMAIL}`);
    console.log(`   URL: ${BACKEND_API_URL}/api/auth/login`);

    const response = await axios.post(`${BACKEND_API_URL}/api/auth/login`, {
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD,
    });

    console.log("✅ Authentication successful");
    return response.data.accessToken;
  } catch (error: any) {
    console.error("❌ Authentication failed");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Status code:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error("No response received from server");
      console.error("Request:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw new Error("Failed to authenticate");
  }
}

async function importCaseToBackend(caseData: CourtCaseImport, token: string) {
  try {
    console.log(
      `\n📋 Importing case: ${caseData.caseNumber} - ${caseData.title}`
    );

    // Extract judge names
    const presidingJudge = caseData.judges?.find((j) =>
      j.role.includes("Presiding")
    )
      ? `${caseData.judges.find((j) => j.role.includes("Presiding"))!.firstName} ${caseData.judges.find((j) => j.role.includes("Presiding"))!.lastName}`
      : undefined;

    const magistrateJudge = caseData.judges?.find(
      (j) => j.role.includes("Magistrate") || j.role.includes("Ordering")
    )
      ? `${caseData.judges.find((j) => j.role.includes("Magistrate") || j.role.includes("Ordering"))!.firstName} ${caseData.judges.find((j) => j.role.includes("Magistrate") || j.role.includes("Ordering"))!.lastName}`
      : undefined;

    // Build comprehensive metadata
    const metadata: Record<string, any> = {
      source: "PACER/ECF Import",
      importDate: new Date().toISOString(),
      originalCourtInfo: caseData.originalCourtInfo,
      courtDates: caseData.courtDates,
      judges: caseData.judges?.map((j) => ({
        role: j.role,
        name: `${j.firstName} ${j.middleName || ""} ${j.lastName}`.trim(),
        title: j.title,
      })),
    };

    // Build related cases array
    const relatedCases: Array<{
      court: string;
      caseNumber: string;
      relationship?: string;
    }> = [];
    if (caseData.originalCourtInfo) {
      relatedCases.push({
        court: "District Court",
        caseNumber: caseData.originalCourtInfo.caseNumber,
        relationship: "Originating Case",
      });
    }

    if (caseData.associatedCases) {
      caseData.associatedCases.forEach((ac) => {
        if (
          ac.memberCaseNumber &&
          ac.memberCaseNumber !== caseData.caseNumber
        ) {
          relatedCases.push({
            court: "Same Court",
            caseNumber: ac.memberCaseNumber,
            relationship: ac.associatedType,
          });
        }
      });
    }

    // Step 1: Create the case
    console.log("\n1️⃣ Creating case record...");
    const casePayload = {
      title: caseData.title,
      caseNumber: caseData.caseNumber,
      description: buildCaseDescription(caseData),
      type: mapCaseType(caseData.caseType),
      status: caseData.dateTerminated ? "Closed" : "Active",
      practiceArea: extractPracticeArea(caseData.natureOfSuit),
      jurisdiction: extractJurisdiction(caseData.origCourt),
      court: caseData.origCourt,
      causeOfAction: caseData.natureOfSuit,
      natureOfSuit: caseData.natureOfSuit,
      filingDate: formatDate(caseData.dateFiled),
      closeDate: caseData.dateTerminated
        ? formatDate(caseData.dateTerminated)
        : undefined,
      dateTerminated: caseData.dateTerminated
        ? formatDate(caseData.dateTerminated)
        : undefined,
      judge: presidingJudge,
      magistrateJudge: magistrateJudge,
      relatedCases: relatedCases.length > 0 ? relatedCases : undefined,
      metadata,
    };

    const postUrl = `${BACKEND_API_URL}/api/cases`;
    console.log(`   POST ${postUrl}`);
    let caseId;
    try {
      const caseResponse = await axios.post(postUrl, casePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const createdCase = caseResponse.data;
      caseId = createdCase.id;
      console.log(`✅ Case created with ID: ${caseId}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log("   ⚠️ Case might already exist, attempting to find...");
        try {
          const searchUrl = `${BACKEND_API_URL}/api/cases?search=${encodeURIComponent(caseData.caseNumber)}`;
          const searchResponse = await axios.get(searchUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });

          let items: any[] = [];

          const d = searchResponse.data;

          if (Array.isArray(d)) items = d;
          else if (d.data && Array.isArray(d.data))
            items = d.data; // items is in data
          else if (d.data && d.data.data && Array.isArray(d.data.data))
            items = d.data.data; // nested data.data
          else if (d.items && Array.isArray(d.items)) items = d.items;
          else if (d.data && d.data.items && Array.isArray(d.data.items))
            items = d.data.items;

          console.log(`Debug: Resolved items array length: ${items.length}`);

          if (items.length > 0) {
            console.log(
              `   🔎 First item caseNumber: '${items[0].caseNumber}'`
            );
          }

          const foundCase = Array.isArray(items)
            ? items.find((c: any) => c.caseNumber === caseData.caseNumber)
            : null;

          if (foundCase) {
            caseId = foundCase.id;
            console.log(`   ✅ Found existing case: ${caseId}`);
          } else {
            console.error(
              "   ❌ Case returned 409 but could not be found via search."
            );
            throw error;
          }
        } catch (searchError: any) {
          console.error(
            "   ❌ Could not find existing case:",
            searchError.message
          );
          throw error;
        }
      } else {
        throw error;
      }
    }

    console.log(
      `   Judges: ${presidingJudge || "N/A"}, ${magistrateJudge || "N/A"}`
    );
    console.log(`   Related Cases: ${relatedCases.length}`);

    // Step 2: Add parties
    console.log(`\n2️⃣ Adding ${caseData.parties.length} parties...`);
    for (const party of caseData.parties) {
      try {
        // Get primary attorney (first one)
        const primaryAttorney = party.attorneys[0];

        // Build full attorney information for metadata
        const attorneysMetadata = party.attorneys.map((atty) => ({
          name: `${atty.firstName} ${atty.middleName || ""} ${atty.lastName}`.trim(),
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
          counsel:
            party.attorneys.length > 0
              ? party.attorneys
                  .map((a) => `${a.firstName} ${a.lastName}`)
                  .join(", ")
              : undefined,

          // Primary attorney details (from first attorney)
          attorneyName: primaryAttorney
            ? `${primaryAttorney.firstName} ${primaryAttorney.middleName || ""} ${primaryAttorney.lastName}`.trim()
            : undefined,
          attorneyFirm: primaryAttorney?.firm,
          attorneyEmail: primaryAttorney?.email,
          attorneyPhone:
            primaryAttorney?.phone || primaryAttorney?.businessPhone,
          attorneyFax: primaryAttorney?.fax,
          attorneyAddress: primaryAttorney
            ? buildFullAddress(primaryAttorney)
            : undefined,
          isProSe: primaryAttorney?.isProSe || false,
          isAttorneyToBeNoticed:
            primaryAttorney?.noticeInfo?.includes("NTC") || false,

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

        await axios.post(`${BACKEND_API_URL}/api/parties`, partyPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(`   ✓ Added party: ${party.name.substring(0, 50)}...`);
        console.log(
          `     Attorneys: ${party.attorneys.length} (${party.attorneys.map((a) => a.lastName).join(", ")})`
        );
      } catch (error: any) {
        console.error(`   ✗ Failed to add party: ${error.message}`);
      }
    }

    // Step 3: Add docket entries
    console.log(
      `\n3️⃣ Adding ${caseData.docketEntries.length} docket entries...`
    );
    let sequenceNumber = 1;
    let successCount = 0;

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

        await axios.post(`${BACKEND_API_URL}/api/docket`, docketPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        successCount++;

        if (sequenceNumber % 10 === 0) {
          console.log(`   ✓ Added ${sequenceNumber} docket entries...`);
        }
      } catch (error: any) {
        console.error(
          `   ✗ Failed to add docket entry ${sequenceNumber}: ${error.message}`
        );
      }
    }

    console.log(
      `   ✓ Completed. Successfully added ${successCount} of ${caseData.docketEntries.length} docket entries`
    );

    console.log("\n✅ Case import completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Case ID: ${caseId}`);
    return caseId;
  } catch (error: any) {
    console.error("\n❌ Error importing case:", error.message);
    if (error.response?.data) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    throw error;
  }
}

function buildCaseDescription(caseData: CourtCaseImport): string {
  const parts: string[] = [caseData.natureOfSuit];

  if (caseData.originalCourtInfo) {
    parts.push(`\nOriginating Court: ${caseData.origCourt}`);
    parts.push(
      `Original Case Number: ${caseData.originalCourtInfo.caseNumber}`
    );
    parts.push(
      `District Court Filing Date: ${caseData.originalCourtInfo.dateFiled}`
    );
  }

  if (caseData.judges && caseData.judges.length > 0) {
    parts.push(`\nJudges:`);
    caseData.judges.forEach((j) => {
      parts.push(
        `- ${j.title} ${j.firstName} ${j.middleName || ""} ${j.lastName} (${j.role})`.trim()
      );
    });
  }

  if (caseData.associatedCases && caseData.associatedCases.length > 0) {
    parts.push(`\nAssociated Cases:`);
    caseData.associatedCases.forEach((ac) => {
      parts.push(
        `- ${ac.memberCaseNumber || ac.leadCaseNumber} (${ac.associatedType})`
      );
    });
  }

  return parts.join("\n");
}

function extractPracticeArea(natureOfSuit: string): string {
  if (!natureOfSuit) return "General Litigation";
  const lower = natureOfSuit.toLowerCase();

  if (lower.includes("bankruptcy")) return "Bankruptcy Appeals";
  if (lower.includes("civil rights")) return "Civil Rights";
  if (lower.includes("employment")) return "Employment Law";
  if (lower.includes("contract")) return "Contract Disputes";
  if (lower.includes("tort")) return "Torts";
  if (lower.includes("property")) return "Property Law";
  if (
    lower.includes("patent") ||
    lower.includes("trademark") ||
    lower.includes("copyright")
  ) {
    return "Intellectual Property";
  }

  return "General Litigation";
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
    parts.push(cityStateZip.join(", "));
  }

  return parts.join("\n");
}

function cleanPartyName(name: string): string {
  if (!name) return "Unknown Party";
  return name.replace(/\s+/g, " ").trim().substring(0, 255);
}

function extractJurisdiction(courtName: string): string {
  if (!courtName) return "Federal";
  if (courtName.includes("Eastern District of Virginia"))
    return "Virginia - Eastern District";
  if (courtName.includes("Virginia")) return "Virginia";
  if (courtName.includes("Fourth Circuit"))
    return "4th Circuit Court of Appeals";
  return courtName.substring(0, 255);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

async function main() {
  const xmlPath = resolve(__dirname, "../04_25-1229_Docket.xml");
  console.log(`📂 Reading XML from file: ${xmlPath}`);
  let xmlData = "";

  try {
    xmlData = readFileSync(xmlPath, "utf-8");
  } catch (error: any) {
    console.error(`❌ Failed to read file: ${error.message}`);
    process.exit(1);
  }

  try {
    console.log("🚀 LexiFlow Court Case Importer\n");
    console.log("Parsing XML data...");

    const parsedCase = parseCourtCaseXML(xmlData);

    console.log("\n📄 Parsed case details:");
    console.log(`   - Case Number: ${parsedCase.caseNumber}`);
    console.log(`   - Title: ${parsedCase.title}`);
    console.log(`   - Date Filed: ${parsedCase.dateFiled}`);
    console.log(`   - Date Terminated: ${parsedCase.dateTerminated || "N/A"}`);
    console.log(`   - Type: ${parsedCase.caseType}`);
    console.log(`   - Parties: ${parsedCase.parties.length}`);
    console.log(
      `   - Total Attorneys: ${parsedCase.parties.reduce((sum, p) => sum + p.attorneys.length, 0)}`
    );
    console.log(`   - Judges: ${parsedCase.judges?.length || 0}`);
    console.log(
      `   - Original Court: ${parsedCase.originalCourtInfo?.caseNumber || "N/A"}`
    );
    console.log(
      `   - Associated Cases: ${parsedCase.associatedCases?.length || 0}`
    );
    console.log(`   - Docket Entries: ${parsedCase.docketEntries.length}`);

    const token = await login();
    const caseId = await importCaseToBackend(parsedCase, token);

    console.log(`\n🎉 Import successful! Case ID: ${caseId}`);
  } catch (error: any) {
    console.error("\n💥 Import failed:", error.message);
    process.exit(1);
  }
}

main();
