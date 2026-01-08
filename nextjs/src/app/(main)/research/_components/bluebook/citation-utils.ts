/**
 * @module research/bluebook/citation-utils
 * @category Legal Research - Citation Formatting
 * @description Citation parsing and formatting utilities for Bluebook citations
 */

import {
  BluebookCitation,
  BluebookCitationType,
  CaseCitation,
  StatuteCitation,
  ConstitutionCitation,
  RegulationCitation,
  BookCitation,
  PeriodicalCitation,
  WebCitation,
  CitationValidationError,
  ValidationSeverity,
  CourtLevel,
  Author,
  FormatOptions,
  CitationFormat
} from './types';

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate a unique citation ID
 */
function generateId(): string {
  return `cite-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create default metadata for citations
 */
function createDefaultMetadata() {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    shortFormEstablished: false,
    citationCount: 0
  };
}

// =============================================================================
// CITATION PARSER
// =============================================================================

export class BluebookParser {
  /**
   * Parse a raw citation string into structured format
   */
  static parse(rawCitation: string): BluebookCitation | null {
    const cleaned = rawCitation.trim();
    if (!cleaned) return null;

    // Try each parser in order of specificity
    return (
      this.parseCaseCitation(cleaned) ||
      this.parseStatuteCitation(cleaned) ||
      this.parseConstitutionCitation(cleaned) ||
      this.parseRegulationCitation(cleaned) ||
      this.parseBookCitation(cleaned) ||
      this.parsePeriodicalCitation(cleaned) ||
      this.parseWebCitation(cleaned) ||
      this.createUnknownCitation(cleaned)
    );
  }

  /**
   * Parse case citation (e.g., "Brown v. Board of Education, 347 U.S. 483 (1954)")
   */
  private static parseCaseCitation(text: string): CaseCitation | null {
    const patterns = [
      // Federal Supreme Court: Party v. Party, Vol U.S. Page (Year)
      /^(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+(U\.S\.|S\.\s*Ct\.|L\.\s*Ed\.(?:\s*2d)?)\s+(\d+)(?:,\s*(\d+))?\s*\((\d{4})\)/i,

      // Circuit Court: Party v. Party, Vol F.2d/F.3d Page (Circuit Year)
      /^(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+(F\.\s*2d|F\.\s*3d|F\.\s*4th)\s+(\d+)(?:,\s*(\d+))?\s*\(([\w\s.]+\s+Cir\.\s+)?(\d{4})\)/i,

      // District Court: Party v. Party, Vol F.Supp Page (D. Dist. Year)
      /^(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+(F\.\s*Supp\.(?:\s*2d|\s*3d)?)\s+(\d+)(?:,\s*(\d+))?\s*\((D\.\s+[\w.]+\s+)?(\d{4})\)/i,

      // State Court: Party v. Party, Vol Reporter Page (State Year)
      /^(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+([\w.]+)\s+(\d+)(?:,\s*(\d+))?\s*\(([\w\s.]+)?(\d{4})\)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const [, party1, party2, volume, reporter, page, pinpoint, courtOrYear, year] = match;

        const actualYear = year || courtOrYear;
        const court = year ? courtOrYear : undefined;

        return {
          id: generateId(),
          type: BluebookCitationType.CASE,
          rawText: text,
          formatted: text,
          caseName: `${party1?.trim() || ''} v. ${party2?.trim() || ''}`,
          party1: party1?.trim() || '',
          party2: party2?.trim() || '',
          volume: parseInt(volume || '0'),
          reporter: reporter?.replace(/\s+/g, ' ').trim() || '',
          page: parseInt(page || '0'),
          court: this.determineCourtLevel(reporter || '', court),
          courtAbbreviation: court?.trim() || '',
          year: parseInt(actualYear || '0'),
          pinpoint: pinpoint,
          isValid: true,
          validationErrors: [],
          metadata: createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse statute citation (e.g., "42 U.S.C. ss 1983 (2018)")
   */
  private static parseStatuteCitation(text: string): StatuteCitation | null {
    const patterns = [
      // U.S. Code: Title U.S.C. ss Section (Year)
      /^(\d+)\s+(U\.S\.C\.|U\.S\.C\.A\.|U\.S\.C\.S\.)\s*(?:\u00A7|ss?)\s*([\d\w-]+(?:\([a-z0-9]\))*(?:-[\d\w]+)?)\s*(?:\((\d{4})\))?/i,

      // State Code: State Code ss Section (Year)
      /^([\w.]+)\s+(?:Code|Stat\.?|Rev\. Stat\.?)\s+(?:Ann\.\s+)?(?:\u00A7|ss?)\s*([\d\w.-]+)\s*(?:\((\d{4})\))?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const titleOrCode = match[1];
        const section = match[2] || match[3];
        const year = match[3] || match[4];

        return {
          id: generateId(),
          type: BluebookCitationType.STATUTE,
          rawText: text,
          formatted: text,
          title: (titleOrCode && isNaN(parseInt(titleOrCode))) ? titleOrCode : parseInt(titleOrCode || '0'),
          code: match[2] || 'U.S.C.',
          section: section || '',
          year: year ? parseInt(year) : undefined,
          isValid: true,
          validationErrors: [],
          metadata: createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse constitutional citation (e.g., "U.S. Const. amend. XIV, ss 1")
   */
  private static parseConstitutionCitation(text: string): ConstitutionCitation | null {
    const patterns = [
      // U.S. Constitution Amendment
      /^(U\.S\.|United States)\s+Const\.?\s+amend\.\s+([IVX]+),?\s*(?:(?:\u00A7|ss?)\s*(\d+))?/i,

      // U.S. Constitution Article
      /^(U\.S\.|United States)\s+Const\.?\s+art\.\s+([IVX]+),?\s*(?:(?:\u00A7|ss?)\s*(\d+))?/i,

      // State Constitution
      /^([\w.]+)\s+Const\.?\s+art\.\s+([IVX\d]+),?\s*(?:(?:\u00A7|ss?)\s*(\d+))?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const isAmendment = text.toLowerCase().includes('amend');
        const jurisdiction = match[1]?.includes('.') ? 'U.S.' : (match[1] || 'U.S.');

        return {
          id: generateId(),
          type: BluebookCitationType.CONSTITUTION,
          rawText: text,
          formatted: text,
          jurisdiction,
          article: !isAmendment ? match[2] : undefined,
          amendment: isAmendment ? this.romanToDecimal(match[2] || '') : undefined,
          section: match[3],
          isValid: true,
          validationErrors: [],
          metadata: createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse regulation citation (e.g., "29 C.F.R. ss 1614.101 (2020)")
   */
  private static parseRegulationCitation(text: string): RegulationCitation | null {
    const pattern = /^(\d+)\s+C\.F\.R\.\s*(?:\u00A7|ss?)\s*([\d.]+)\s*(?:\((\d{4})\))?/i;
    const match = text.match(pattern);

    if (match) {
      return {
        id: generateId(),
        type: BluebookCitationType.REGULATION,
        rawText: text,
        formatted: text,
        title: parseInt(match[1] || '0'),
        section: match[2] || '',
        year: match[3] ? parseInt(match[3]) : new Date().getFullYear(),
        isValid: true,
        validationErrors: [],
        metadata: createDefaultMetadata()
      };
    }

    return null;
  }

  /**
   * Parse book citation
   */
  private static parseBookCitation(text: string): BookCitation | null {
    // Pattern: Author(s), Title (Edition Year)
    const pattern = /^([\w\s.,&]+),\s+(.+?)\s+(?:\((\d+)(?:st|nd|rd|th)?\s+ed\.\s+)?(\d{4})\)/i;
    const match = text.match(pattern);

    if (match && text.includes('(')) {
      const authors = this.parseAuthors(match[1] || '');

      return {
        id: generateId(),
        type: BluebookCitationType.BOOK,
        rawText: text,
        formatted: text,
        authors,
        title: match[2]?.trim() || '',
        edition: match[3] ? parseInt(match[3]) : undefined,
        year: parseInt(match[4] || '0'),
        isValid: true,
        validationErrors: [],
        metadata: createDefaultMetadata()
      };
    }

    return null;
  }

  /**
   * Parse law review/journal citation
   */
  private static parsePeriodicalCitation(text: string): PeriodicalCitation | null {
    // Pattern: Author, Title, Vol Publication Page (Year)
    const pattern = /^([\w\s.,&]+),\s+(.+?),\s+(\d+)\s+([\w\s.&]+)\s+(\d+)(?:,\s*(\d+))?\s*\((\d{4})\)/i;
    const match = text.match(pattern);

    if (match) {
      const authors = this.parseAuthors(match[1] || '');

      return {
        id: generateId(),
        type: BluebookCitationType.LAW_REVIEW,
        rawText: text,
        formatted: text,
        authors,
        title: match[2]?.trim() || '',
        volume: parseInt(match[3] || '0'),
        publication: match[4]?.trim() || '',
        page: parseInt(match[5] || '0'),
        year: parseInt(match[7] || '0'),
        isValid: true,
        validationErrors: [],
        metadata: createDefaultMetadata()
      };
    }

    return null;
  }

  /**
   * Parse web citation
   */
  private static parseWebCitation(text: string): WebCitation | null {
    const urlPattern = /(https?:\/\/[^\s]+)/i;
    const match = text.match(urlPattern);

    if (match) {
      const title = text.substring(0, text.indexOf(match[0])).trim().replace(/,$/, '');

      return {
        id: generateId(),
        type: BluebookCitationType.WEB_RESOURCE,
        rawText: text,
        formatted: text,
        title: title || 'Untitled Web Resource',
        url: match[1] || '',
        accessDate: new Date().toISOString(),
        isValid: true,
        validationErrors: [],
        metadata: createDefaultMetadata()
      };
    }

    return null;
  }

  /**
   * Parse multiple authors from string
   */
  private static parseAuthors(authorString: string): Author[] {
    const authors = authorString.split(/\s*[&,]\s*(?:and\s+)?/i);
    return authors.map((name): Author => {
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return { firstName: '', lastName: parts[0] || '', fullName: parts[0] || '' };
      } else if (parts.length === 2) {
        return { firstName: parts[0] || '', lastName: parts[1] || '', fullName: name.trim() };
      } else {
        return {
          firstName: parts[0] || '',
          middleName: parts.slice(1, -1).join(' '),
          lastName: parts[parts.length - 1] || '',
          fullName: name.trim()
        };
      }
    });
  }

  /**
   * Determine court level from reporter abbreviation
   */
  private static determineCourtLevel(reporter: string, court?: string): CourtLevel {
    const r = reporter.replace(/\s+/g, '').toLowerCase();

    if (r.includes('u.s.') && !r.includes('f.')) return CourtLevel.SUPREME_COURT;
    if (r.includes('f.2d') || r.includes('f.3d') || r.includes('f.4th')) return CourtLevel.CIRCUIT;
    if (r.includes('f.supp')) return CourtLevel.DISTRICT;
    if (r.includes('bankr')) return CourtLevel.BANKRUPTCY;
    if (court && court.toLowerCase().includes('cir.')) return CourtLevel.CIRCUIT;
    if (court && court.toLowerCase().includes('d.')) return CourtLevel.DISTRICT;

    return CourtLevel.STATE_SUPREME;
  }

  /**
   * Convert Roman numeral to decimal
   */
  private static romanToDecimal(roman: string): number {
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
      const currentChar = roman.charAt(i);
      const nextChar = roman.charAt(i + 1);
      const current = map[currentChar] || 0;
      const next = map[nextChar] || 0;
      if (next && current < next) {
        result -= current;
      } else {
        result += current;
      }
    }
    return result;
  }

  /**
   * Create fallback unknown citation
   */
  private static createUnknownCitation(text: string): BluebookCitation {
    return {
      id: generateId(),
      type: BluebookCitationType.UNKNOWN,
      rawText: text,
      formatted: text,
      isValid: false,
      validationErrors: [{
        code: 'PARSE_FAILED',
        message: 'Unable to parse citation format',
        severity: ValidationSeverity.ERROR,
        suggestion: 'Verify citation follows Bluebook format'
      }],
      metadata: createDefaultMetadata()
    };
  }

  /**
   * Batch parse multiple citations
   */
  static batchParse(citations: string[]): BluebookCitation[] {
    return citations.map(c => this.parse(c)).filter(Boolean) as BluebookCitation[];
  }

  /**
   * Validate citation against Bluebook rules
   */
  static validate(citation: BluebookCitation): CitationValidationError[] {
    const errors: CitationValidationError[] = [];

    switch (citation.type) {
      case BluebookCitationType.CASE:
        errors.push(...this.validateCaseCitation(citation as CaseCitation));
        break;
      case BluebookCitationType.STATUTE:
        errors.push(...this.validateStatuteCitation(citation as StatuteCitation));
        break;
      case BluebookCitationType.REGULATION:
        errors.push(...this.validateRegulationCitation(citation as RegulationCitation));
        break;
    }

    return errors;
  }

  private static validateCaseCitation(citation: CaseCitation): CitationValidationError[] {
    const errors: CitationValidationError[] = [];

    if (!citation.caseName || citation.caseName.length < 3) {
      errors.push({
        code: 'INVALID_CASE_NAME',
        message: 'Case name is too short or missing',
        severity: ValidationSeverity.ERROR
      });
    }

    if (!citation.year || citation.year < 1700 || citation.year > new Date().getFullYear()) {
      errors.push({
        code: 'INVALID_YEAR',
        message: 'Year is invalid or missing',
        severity: ValidationSeverity.ERROR
      });
    }

    if (!citation.reporter || citation.reporter.length === 0) {
      errors.push({
        code: 'MISSING_REPORTER',
        message: 'Reporter abbreviation is required',
        severity: ValidationSeverity.ERROR
      });
    }

    return errors;
  }

  private static validateStatuteCitation(citation: StatuteCitation): CitationValidationError[] {
    const errors: CitationValidationError[] = [];

    if (!citation.section) {
      errors.push({
        code: 'MISSING_SECTION',
        message: 'Section number is required',
        severity: ValidationSeverity.ERROR
      });
    }

    if (!citation.code) {
      errors.push({
        code: 'MISSING_CODE',
        message: 'Code designation is required',
        severity: ValidationSeverity.ERROR
      });
    }

    return errors;
  }

  private static validateRegulationCitation(citation: RegulationCitation): CitationValidationError[] {
    const errors: CitationValidationError[] = [];

    if (!citation.title) {
      errors.push({
        code: 'MISSING_TITLE',
        message: 'CFR title number is required',
        severity: ValidationSeverity.ERROR
      });
    }

    if (!citation.section) {
      errors.push({
        code: 'MISSING_SECTION',
        message: 'CFR section number is required',
        severity: ValidationSeverity.ERROR
      });
    }

    return errors;
  }
}

// =============================================================================
// CITATION FORMATTER
// =============================================================================

export class BluebookFormatter {
  /**
   * Format a Bluebook citation according to specified options
   */
  static format(citation: BluebookCitation, options: Partial<FormatOptions> = {}): string {
    const {
      italicizeCaseNames = true,
      useSmallCaps = false,
      format = CitationFormat.FULL
    } = options;

    switch (citation.type) {
      case BluebookCitationType.CASE:
        return this.formatCase(citation as CaseCitation, italicizeCaseNames, format);

      case BluebookCitationType.STATUTE:
        return this.formatStatute(citation as StatuteCitation, format);

      case BluebookCitationType.CONSTITUTION:
        return this.formatConstitution(citation as ConstitutionCitation);

      case BluebookCitationType.REGULATION:
        return this.formatRegulation(citation as RegulationCitation);

      case BluebookCitationType.BOOK:
        return this.formatBook(citation as BookCitation, italicizeCaseNames, useSmallCaps);

      case BluebookCitationType.LAW_REVIEW:
      case BluebookCitationType.JOURNAL:
        return this.formatPeriodical(citation as PeriodicalCitation, italicizeCaseNames, useSmallCaps);

      case BluebookCitationType.WEB_RESOURCE:
        return this.formatWeb(citation as WebCitation);

      default:
        return citation.rawText;
    }
  }

  /**
   * Format a case citation
   */
  private static formatCase(
    citation: CaseCitation,
    italicize: boolean,
    format: CitationFormat
  ): string {
    if (format === CitationFormat.ID) {
      return '<em>Id.</em>';
    }

    if (format === CitationFormat.SHORT_FORM) {
      const shortName = citation.party1.split(' ')[0];
      return `<em>${shortName}</em>, ${citation.volume} ${citation.reporter} at ${citation.page}`;
    }

    // Full citation format
    const caseName = italicize
      ? `<em>${citation.caseName}</em>`
      : citation.caseName;

    let formatted = `${caseName}, ${citation.volume} ${citation.reporter} ${citation.page}`;

    if (citation.courtAbbreviation && citation.court !== CourtLevel.SUPREME_COURT) {
      formatted += ` (${citation.courtAbbreviation}${citation.year})`;
    } else if (citation.year) {
      formatted += ` (${citation.year})`;
    }

    if (citation.pinpoint) {
      formatted += `, ${citation.pinpoint}`;
    }

    return formatted;
  }

  /**
   * Format a statute citation
   */
  private static formatStatute(citation: StatuteCitation, format: CitationFormat): string {
    if (format === CitationFormat.ID) {
      return '<em>Id.</em>';
    }

    let formatted = `${citation.title} ${citation.code} \u00A7 ${citation.section}`;

    if (citation.subsections && citation.subsections.length > 0) {
      formatted += `(${citation.subsections[0]})`;
    }

    if (citation.year) {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format a constitutional citation
   */
  private static formatConstitution(citation: ConstitutionCitation): string {
    let formatted = `${citation.jurisdiction} Const.`;

    if (citation.amendment) {
      formatted += ` amend. ${this.decimalToRoman(citation.amendment)}`;
    } else if (citation.article) {
      formatted += ` art. ${citation.article}`;
    }

    if (citation.section) {
      formatted += `, \u00A7 ${citation.section}`;
    }

    if (citation.clause) {
      formatted += `, cl. ${citation.clause}`;
    }

    return formatted;
  }

  /**
   * Format a regulation citation
   */
  private static formatRegulation(citation: RegulationCitation): string {
    let formatted = `${citation.title} C.F.R. \u00A7 ${citation.section}`;

    if (citation.year) {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format a book citation
   */
  private static formatBook(
    citation: BookCitation,
    italicize: boolean,
    smallCaps: boolean
  ): string {
    const authorStr = citation.authors?.[0]?.fullName || '';
    const author = smallCaps ? this.toSmallCaps(authorStr) : authorStr;
    const title = italicize ? `<em>${citation.title}</em>` : citation.title;

    let formatted = `${author}, ${title}`;

    if (citation.pageNumbers) {
      formatted += ` ${citation.pageNumbers}`;
    }

    if (citation.edition) {
      formatted += ` (${citation.edition}${this.getOrdinalSuffix(citation.edition)} ed. ${citation.year})`;
    } else {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format a periodical citation
   */
  private static formatPeriodical(
    citation: PeriodicalCitation,
    italicize: boolean,
    smallCaps: boolean
  ): string {
    const authorStr = citation.authors?.[0]?.fullName || '';
    const author = smallCaps ? this.toSmallCaps(authorStr) : authorStr;
    const title = italicize ? `<em>${citation.title}</em>` : citation.title;

    return `${author}, ${title}, ${citation.volume} ${citation.publication} ${citation.page} (${citation.year})`;
  }

  /**
   * Format a web citation
   */
  private static formatWeb(citation: WebCitation): string {
    const accessDate = new Date(citation.accessDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return `${citation.title}, ${citation.url} (last visited ${accessDate})`;
  }

  /**
   * Strip HTML formatting from citation
   */
  static stripFormatting(formatted: string): string {
    return formatted
      .replace(/<[^>]*>/g, '')  // Remove HTML tags
      .replace(/\u00A7/g, 'ss')  // Replace section symbol
      .trim();
  }

  /**
   * Convert decimal to Roman numeral
   */
  private static decimalToRoman(num: number): string {
    const romanNumerals: [number, string][] = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];

    let result = '';
    for (const [value, numeral] of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }

  /**
   * Convert text to small caps representation
   */
  private static toSmallCaps(text: string): string {
    return `<span class="small-caps">${text.toUpperCase()}</span>`;
  }

  /**
   * Get ordinal suffix for numbers
   */
  private static getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Get citation type display label
 */
export function getCitationTypeLabel(type: BluebookCitationType): string {
  const labels: Record<BluebookCitationType, string> = {
    [BluebookCitationType.CASE]: 'Case',
    [BluebookCitationType.STATUTE]: 'Statute',
    [BluebookCitationType.CONSTITUTION]: 'Constitution',
    [BluebookCitationType.REGULATION]: 'Regulation',
    [BluebookCitationType.BOOK]: 'Book',
    [BluebookCitationType.LAW_REVIEW]: 'Law Review',
    [BluebookCitationType.JOURNAL]: 'Journal',
    [BluebookCitationType.WEB_RESOURCE]: 'Web Resource',
    [BluebookCitationType.UNKNOWN]: 'Unknown'
  };
  return labels[type] || 'Unknown';
}

/**
 * Get citation type color class
 */
export function getCitationTypeColor(type: BluebookCitationType): string {
  const colors: Record<BluebookCitationType, string> = {
    [BluebookCitationType.CASE]: 'text-blue-600',
    [BluebookCitationType.STATUTE]: 'text-green-600',
    [BluebookCitationType.CONSTITUTION]: 'text-purple-600',
    [BluebookCitationType.REGULATION]: 'text-amber-600',
    [BluebookCitationType.BOOK]: 'text-rose-600',
    [BluebookCitationType.LAW_REVIEW]: 'text-indigo-600',
    [BluebookCitationType.JOURNAL]: 'text-cyan-600',
    [BluebookCitationType.WEB_RESOURCE]: 'text-slate-600',
    [BluebookCitationType.UNKNOWN]: 'text-gray-500'
  };
  return colors[type] || 'text-gray-500';
}

/**
 * Sample citations for demonstration
 */
export const SAMPLE_CITATIONS = `Brown v. Board of Education, 347 U.S. 483 (1954)
42 U.S.C. \u00A7 1983 (2018)
U.S. Const. art. I, \u00A7 8
21 C.F.R. \u00A7 314.126 (2022)
Roe v. Wade, 410 U.S. 113 (1973)
18 U.S.C. \u00A7 1030 (2018)`;
