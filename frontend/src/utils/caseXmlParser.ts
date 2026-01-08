import { CaseStatus, MatterType } from "@/types/enums";

/**
 * Interface representing the structured data extracted from the XML
 */
export interface XMLParsedCaseData {
  caseInfo: {
    caseNumber: string;
    title: string;
    description: string;
    filingDate: string;
    dateTerminated?: string;
    natureOfSuit: string;
    court: string;
    judge: string;
    magistrateJudge?: string;
    type: MatterType;
    status: CaseStatus;
    jurisdiction?: string;
    origCourtCaseNumber?: string;
  };
  parties: ParsedParty[];
  docketEntries: ParsedDocketEntry[];
  associatedCases: ParsedAssociatedCase[];
}

interface ParsedParty {
  name: string;
  role: string; // e.g., Debtor - Appellant, Creditor - Appellee
  type: string; // derived from role or context
  attorneys: ParsedAttorney[];
}

interface ParsedAttorney {
  name: string;
  email: string;
  phone: string;
  firm: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface ParsedDocketEntry {
  dateFiled: string;
  description: string;
  docLink?: string;
  entryNumber?: string; // Implicit or parsed
}

interface ParsedAssociatedCase {
  leadCaseNumber: string;
  memberCaseNumber: string;
  relationship: string;
  dateStart: string;
}

/**
 * Sanitizes XML string to handle common formatting issues before parsing
 */
const sanitizeXml = (xml: string): string => {
  if (!xml) return "";

  // 1. Escape ampersands that aren't already escaped entities
  let clean = xml.replace(
    /&(?!(?:apos|quot|[gl]t|amp|#\d+|#x[\da-fA-F]+);)/g,
    "&amp;"
  );

  // 2. Fix unescaped < in attributes or text (heuristic: < followed by space or number is not a tag start)
  clean = clean.replace(
    /<(?=\s|\d|[!@#$%^&*()_+\-=[\]{};':"\\|,./?])/g,
    "&lt;"
  );

  return clean;
};

/**
 * Parses the provided XML string into a structured object
 * @param xmlString The XML content to parse
 * @returns XMLParsedCaseData
 */
export const parseCaseXml = (xmlString: string): XMLParsedCaseData => {
  const parser = new DOMParser();

  // Attempt to parse raw string first to preserve intended structure if valid
  let xmlDoc = parser.parseFromString(xmlString, "text/xml");
  let parseError = xmlDoc.querySelector("parsererror");

  // If raw parse fails, try sanitizing
  if (parseError) {
    const sanitizedXml = sanitizeXml(xmlString);
    xmlDoc = parser.parseFromString(sanitizedXml, "text/xml");
    parseError = xmlDoc.querySelector("parsererror");
  }

  if (parseError) {
    // Extract more detail if possible
    const errorMsg = parseError.textContent || "Unknown XML parsing error";
    // Log the error for debugging
    console.error("XML Parse Failure. Error:", errorMsg);
    console.debug(
      "Failed XML snippet (first 500 chars):",
      xmlString.substring(0, 500)
    );

    throw new Error(`XML Parsing Error: ${errorMsg}`);
  }

  // Helper to get attribute safely
  const getAttr = (el: Element | null, attr: string): string =>
    el?.getAttribute(attr) || "";

  // 1. Parse Case Info (from <stub>, <caseType>, <origCourts>)
  const stub = xmlDoc.querySelector("stub");
  const caseTypeEl = xmlDoc.querySelector("caseType");
  const origCourt = xmlDoc.querySelector("origCourts > origCourt");
  const origPersonPresiding = xmlDoc.querySelector(
    "origCourts > origCourt > origPerson[role='Presiding Judge']"
  );
  const origPersonMagistrate = xmlDoc.querySelector(
    "origCourts > origCourt > origPerson[role*='Magistrate']"
  ); // Loose matching

  const caseNumber = getAttr(stub, "caseNumber");
  const title = getAttr(stub, "shortTitle");
  const filingDate = getAttr(stub, "dateFiled"); // "03/12/2025"
  const dateTerminated = getAttr(stub, "dateTerminated");
  const natureOfSuit = getAttr(stub, "natureOfSuit");
  const origCourtName = getAttr(stub, "origCourt");

  // Determine Type and Status
  // Just guessing MatterType mapping here based on available enums
  let type: MatterType = MatterType.LITIGATION;
  const rawType = getAttr(caseTypeEl, "type");
  if (rawType.toLowerCase().includes("bankruptcy"))
    type = MatterType.LITIGATION; // Or specialized if available

  let status: CaseStatus = CaseStatus.Active;
  if (dateTerminated) status = CaseStatus.Closed;

  // 2. Parse Parties
  const parties: ParsedParty[] = [];
  const partyEls = xmlDoc.querySelectorAll("party");
  partyEls.forEach((p) => {
    const rawInfo = getAttr(p, "info").trim();
    const typeRole = getAttr(p, "type").trim(); // e.g. "Debtor - Appellant"

    // Attorneys
    const attorneys: ParsedAttorney[] = [];
    const attyEls = p.querySelectorAll("attorney");
    attyEls.forEach((at) => {
      attorneys.push({
        name: `${getAttr(at, "firstName")} ${getAttr(at, "middleName")} ${getAttr(at, "lastName")}`
          .replace(/\s+/g, " ")
          .trim(),
        email: getAttr(at, "email"),
        phone: getAttr(at, "businessPhone") || getAttr(at, "personalPhone"),
        firm: getAttr(at, "office"),
        address:
          `${getAttr(at, "address1")} ${getAttr(at, "address2")} ${getAttr(at, "address3")}`.trim(),
        city: getAttr(at, "city"),
        state: getAttr(at, "state"),
        zip: getAttr(at, "zip"),
      });
    });

    parties.push({
      name: rawInfo, // Using info as name for now
      role: typeRole,
      type: typeRole,
      attorneys,
    });
  });

  // 3. Parse Docket Entries
  const docketEntries: ParsedDocketEntry[] = [];
  const docketTexts = xmlDoc.querySelectorAll("docketText");
  docketTexts.forEach((dt) => {
    docketEntries.push({
      dateFiled: getAttr(dt, "dateFiled"),
      description: getAttr(dt, "text"),
      docLink: getAttr(dt, "docLink"),
    });
  });

  // 4. Parse Associated Cases
  const associatedCases: ParsedAssociatedCase[] = [];
  const assocEls = xmlDoc.querySelectorAll("associatedCase");
  assocEls.forEach((ac) => {
    associatedCases.push({
      leadCaseNumber: getAttr(ac, "leadCaseNumber"),
      memberCaseNumber: getAttr(ac, "memberCaseNumber"),
      relationship: getAttr(ac, "associatedType"),
      dateStart: getAttr(ac, "dateStart"),
    });
  });

  return {
    caseInfo: {
      caseNumber,
      title,
      description: natureOfSuit,
      filingDate: parseDate(filingDate),
      dateTerminated: dateTerminated ? parseDate(dateTerminated) : undefined,
      natureOfSuit,
      court: origCourtName,
      judge: origPersonPresiding
        ? `${getAttr(origPersonPresiding, "firstName")} ${getAttr(origPersonPresiding, "lastName")}`
        : "",
      magistrateJudge: origPersonMagistrate
        ? `${getAttr(origPersonMagistrate, "firstName")} ${getAttr(origPersonMagistrate, "lastName")}`
        : undefined,
      type,
      status,
      origCourtCaseNumber: getAttr(origCourt, "caseNumber"), // "1:24-cv-01442-LMB-IDD"
      jurisdiction: "Federal", // Default guess
    },
    parties,
    docketEntries,
    associatedCases,
  };
};

// Helper to convert MM/DD/YYYY to ISO string or undefined
const parseDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();

  // Try MM/DD/YYYY
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = parts[0];
      const day = parts[1];
      const year = parts[2];
      if (month && day && year) {
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(d.getTime())) return d.toISOString();
      }
    }
  }

  // Try standard Date parse
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Fallback
  return new Date().toISOString();
};
