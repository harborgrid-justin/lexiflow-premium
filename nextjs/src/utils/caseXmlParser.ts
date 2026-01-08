/**
 * Case XML Parser Utility
 *
 * Parses XML case data into structured TypeScript objects.
 * Handles court case XML formats with parties, docket entries, and associated cases.
 */

import { CaseStatus, MatterType } from "@/types/enums";

/**
 * Structured data extracted from case XML
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

/**
 * Parsed party information from case XML
 */
export interface ParsedParty {
  name: string;
  role: string;
  type: string;
  attorneys: ParsedAttorney[];
}

/**
 * Parsed attorney information
 */
export interface ParsedAttorney {
  name: string;
  email: string;
  phone: string;
  firm: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

/**
 * Parsed docket entry from case XML
 */
export interface ParsedDocketEntry {
  dateFiled: string;
  description: string;
  docLink?: string;
  entryNumber?: string;
}

/**
 * Parsed associated case relationship
 */
export interface ParsedAssociatedCase {
  leadCaseNumber: string;
  memberCaseNumber: string;
  relationship: string;
  dateStart: string;
}

/**
 * Error thrown when XML parsing fails
 */
export class XMLParseError extends Error {
  constructor(
    message: string,
    public readonly xmlSnippet?: string
  ) {
    super(message);
    this.name = "XMLParseError";
  }
}

/**
 * Sanitizes XML string to handle common formatting issues before parsing.
 *
 * @param xml - Raw XML string to sanitize
 * @returns Sanitized XML string safe for parsing
 *
 * @example
 * ```ts
 * const clean = sanitizeXml('<case title="Smith & Jones">');
 * // Returns: '<case title="Smith &amp; Jones">'
 * ```
 */
export const sanitizeXml = (xml: string): string => {
  if (!xml) return "";

  // 1. Escape ampersands that aren't already escaped entities
  let clean = xml.replace(
    /&(?!(?:apos|quot|[gl]t|amp|#\d+|#x[\da-fA-F]+);)/g,
    "&amp;"
  );

  // 2. Fix unescaped < in attributes or text (heuristic: < followed by space or number is not a tag start)
  clean = clean.replace(
    /<(?=\s|\d|[!@#$%^&*()_+\-=\[\]{};':"\\|,.\/?])/g,
    "&lt;"
  );

  return clean;
};

/**
 * Safely retrieves an attribute value from an element
 */
const getAttr = (el: Element | null, attr: string): string =>
  el?.getAttribute(attr) ?? "";

/**
 * Converts date string from MM/DD/YYYY format to ISO string.
 * Falls back to current date if parsing fails.
 *
 * @param dateStr - Date string in MM/DD/YYYY or other parseable format
 * @returns ISO date string
 */
const parseDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString();

  // Try MM/DD/YYYY format
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [month, day, year] = parts;
      if (month && day && year) {
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(d.getTime())) return d.toISOString();
      }
    }
  }

  // Try standard Date parse
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Fallback to current date
  return new Date().toISOString();
};

/**
 * Parses party elements from XML document.
 *
 * @param xmlDoc - Parsed XML document
 * @returns Array of parsed parties with their attorneys
 */
export const parseParties = (xmlDoc: Document): ParsedParty[] => {
  const parties: ParsedParty[] = [];
  const partyEls = xmlDoc.querySelectorAll("party");

  partyEls.forEach((p) => {
    const rawInfo = getAttr(p, "info").trim();
    const typeRole = getAttr(p, "type").trim();

    // Parse attorneys for this party
    const attorneys: ParsedAttorney[] = [];
    const attyEls = p.querySelectorAll("attorney");

    attyEls.forEach((at) => {
      const firstName = getAttr(at, "firstName");
      const middleName = getAttr(at, "middleName");
      const lastName = getAttr(at, "lastName");

      attorneys.push({
        name: [firstName, middleName, lastName]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
        email: getAttr(at, "email"),
        phone: getAttr(at, "businessPhone") || getAttr(at, "personalPhone"),
        firm: getAttr(at, "office"),
        address: [
          getAttr(at, "address1"),
          getAttr(at, "address2"),
          getAttr(at, "address3"),
        ]
          .filter(Boolean)
          .join(" ")
          .trim(),
        city: getAttr(at, "city"),
        state: getAttr(at, "state"),
        zip: getAttr(at, "zip"),
      });
    });

    parties.push({
      name: rawInfo,
      role: typeRole,
      type: typeRole,
      attorneys,
    });
  });

  return parties;
};

/**
 * Parses docket entry elements from XML document.
 *
 * @param xmlDoc - Parsed XML document
 * @returns Array of parsed docket entries
 */
export const parseDocketEntries = (xmlDoc: Document): ParsedDocketEntry[] => {
  const docketEntries: ParsedDocketEntry[] = [];
  const docketTexts = xmlDoc.querySelectorAll("docketText");

  docketTexts.forEach((dt) => {
    const dateFiled = getAttr(dt, "dateFiled");
    const description = getAttr(dt, "text");
    const docLink = getAttr(dt, "docLink");
    const entryNumber = getAttr(dt, "entryNumber");

    docketEntries.push({
      dateFiled: dateFiled ? parseDate(dateFiled) : "",
      description,
      ...(docLink && { docLink }),
      ...(entryNumber && { entryNumber }),
    });
  });

  return docketEntries;
};

/**
 * Parses associated case elements from XML document.
 *
 * @param xmlDoc - Parsed XML document
 * @returns Array of parsed associated cases
 */
export const parseAssociatedCases = (
  xmlDoc: Document
): ParsedAssociatedCase[] => {
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

  return associatedCases;
};

/**
 * Determines MatterType from raw case type string.
 *
 * @param rawType - Raw type string from XML
 * @returns Appropriate MatterType enum value
 */
const determineMatterType = (rawType: string): MatterType => {
  const lowerType = rawType.toLowerCase();

  if (lowerType.includes("bankruptcy")) return MatterType.LITIGATION;
  if (lowerType.includes("real estate")) return MatterType.REAL_ESTATE;
  if (lowerType.includes("corporate")) return MatterType.CORPORATE;
  if (lowerType.includes("employment")) return MatterType.EMPLOYMENT;
  if (lowerType.includes("intellectual") || lowerType.includes("patent"))
    return MatterType.INTELLECTUAL_PROPERTY;
  if (lowerType.includes("compliance")) return MatterType.COMPLIANCE;
  if (lowerType.includes("advisory")) return MatterType.ADVISORY;
  if (lowerType.includes("transaction")) return MatterType.TRANSACTIONAL;

  return MatterType.LITIGATION;
};

/**
 * Parses XML case data into a structured object.
 *
 * Handles malformed XML by attempting sanitization before parsing.
 * Extracts case header info, parties, docket entries, and associated cases.
 *
 * @param xmlString - Raw XML string containing case data
 * @returns Structured case data object
 * @throws XMLParseError if XML cannot be parsed even after sanitization
 *
 * @example
 * ```ts
 * const xml = '<case><stub caseNumber="1:24-cv-01234" shortTitle="Smith v. Jones" /></case>';
 * const data = parseCaseXml(xml);
 * console.log(data.caseInfo.caseNumber); // "1:24-cv-01234"
 * ```
 */
export const parseCaseXml = (xmlString: string): XMLParsedCaseData => {
  if (!xmlString || typeof xmlString !== "string") {
    throw new XMLParseError("XML string is required and must be a string");
  }

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
    const errorMsg = parseError.textContent ?? "Unknown XML parsing error";
    console.error("XML Parse Failure. Error:", errorMsg);
    console.debug(
      "Failed XML snippet (first 500 chars):",
      xmlString.substring(0, 500)
    );

    throw new XMLParseError(
      `XML Parsing Error: ${errorMsg}`,
      xmlString.substring(0, 500)
    );
  }

  // Parse Case Info from <stub>, <caseType>, <origCourts>
  const stub = xmlDoc.querySelector("stub");
  const caseTypeEl = xmlDoc.querySelector("caseType");
  const origCourt = xmlDoc.querySelector("origCourts > origCourt");
  const origPersonPresiding = xmlDoc.querySelector(
    "origCourts > origCourt > origPerson[role='Presiding Judge']"
  );
  const origPersonMagistrate = xmlDoc.querySelector(
    "origCourts > origCourt > origPerson[role*='Magistrate']"
  );

  const caseNumber = getAttr(stub, "caseNumber");
  const title = getAttr(stub, "shortTitle");
  const filingDate = getAttr(stub, "dateFiled");
  const dateTerminated = getAttr(stub, "dateTerminated");
  const natureOfSuit = getAttr(stub, "natureOfSuit");
  const origCourtName = getAttr(stub, "origCourt");

  // Determine Type and Status
  const rawType = getAttr(caseTypeEl, "type");
  const type = determineMatterType(rawType);
  const status = dateTerminated ? CaseStatus.Closed : CaseStatus.Active;

  // Build judge names
  const judgeName = origPersonPresiding
    ? `${getAttr(origPersonPresiding, "firstName")} ${getAttr(origPersonPresiding, "lastName")}`.trim()
    : "";

  const magistrateJudgeName = origPersonMagistrate
    ? `${getAttr(origPersonMagistrate, "firstName")} ${getAttr(origPersonMagistrate, "lastName")}`.trim()
    : undefined;

  return {
    caseInfo: {
      caseNumber,
      title,
      description: natureOfSuit,
      filingDate: parseDate(filingDate),
      dateTerminated: dateTerminated ? parseDate(dateTerminated) : undefined,
      natureOfSuit,
      court: origCourtName,
      judge: judgeName,
      magistrateJudge: magistrateJudgeName,
      type,
      status,
      origCourtCaseNumber: getAttr(origCourt, "caseNumber"),
      jurisdiction: "Federal",
    },
    parties: parseParties(xmlDoc),
    docketEntries: parseDocketEntries(xmlDoc),
    associatedCases: parseAssociatedCases(xmlDoc),
  };
};

/**
 * Validates if a string is parseable as case XML.
 *
 * @param xmlString - String to validate
 * @returns true if the string can be parsed as valid case XML
 */
export const isValidCaseXml = (xmlString: string): boolean => {
  try {
    parseCaseXml(xmlString);
    return true;
  } catch {
    return false;
  }
};
