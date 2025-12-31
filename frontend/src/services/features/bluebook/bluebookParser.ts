/**
 * @module services/bluebook/bluebookParser
 * @category Legal Research - Citation Parser
 * @description Intelligent citation parser supporting all major Bluebook citation types
 */

import {
  BluebookCitation,
  BluebookCitationType,
  CaseCitation,
  StatuteCitation,
  ConstitutionCitation,
  BookCitation,
  PeriodicalCitation,
  RegulationCitation,
  WebCitation,
  CitationValidationError,
  ValidationSeverity,
  CourtLevel,
  CitationSignal,
  Author
} from '@/types/bluebook';
import { IdGenerator } from '@/utils/idGenerator';

/**
 * Citation parser class with regex-based pattern matching
 */
export class BluebookParser {

  /**
   * Parse a raw citation string into structured format
   */
  static parse(rawCitation: string): BluebookCitation | null {
    const cleaned = rawCitation.trim();

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
    // Pattern: Party v. Party, Volume Reporter Page (Court Year)
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

        // Determine if last group is court or year
        const actualYear = year || courtOrYear;
        const court = year ? courtOrYear : undefined;

        return {
          id: IdGenerator.generic('cite'),
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
          metadata: this.createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse statute citation (e.g., "42 U.S.C. § 1983 (2018)")
   */
  private static parseStatuteCitation(text: string): StatuteCitation | null {
    const patterns = [
      // U.S. Code: Title U.S.C. § Section (Year)
      /^(\d+)\s+(U\.S\.C\.|U\.S\.C\.A\.|U\.S\.C\.S\.)\s+§+\s*([\d\w-]+(?:\([a-z0-9]\))*(?:-[\d\w]+)?)\s*(?:\((\d{4})\))?/i,

      // State Code: State Code § Section (Year)
      /^([\w.]+)\s+(?:Code|Stat\.?|Rev\. Stat\.?)\s+(?:Ann\.\s+)?§+\s*([\d\w.-]+)\s*(?:\((\d{4})\))?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const titleOrCode = match[1];
        const section = match[2] || match[3];
        const year = match[3] || match[4];

        return {
          id: IdGenerator.generic('cite'),
          type: BluebookCitationType.STATUTE,
          rawText: text,
          formatted: text,
          title: (titleOrCode && isNaN(parseInt(titleOrCode))) ? titleOrCode : parseInt(titleOrCode || '0'),
          code: match[2] || 'U.S.C.',
          section: section || '',
          year: year ? parseInt(year) : undefined,
          isValid: true,
          validationErrors: [],
          metadata: this.createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse constitutional citation (e.g., "U.S. Const. amend. XIV, § 1")
   */
  private static parseConstitutionCitation(text: string): ConstitutionCitation | null {
    const patterns = [
      // U.S. Constitution Amendment
      /^(U\.S\.|United States)\s+Const\.?\s+amend\.\s+([IVX]+),?\s*(?:§\s*(\d+))?/i,

      // U.S. Constitution Article
      /^(U\.S\.|United States)\s+Const\.?\s+art\.\s+([IVX]+),?\s*(?:§\s*(\d+))?/i,

      // State Constitution
      /^([\w.]+)\s+Const\.?\s+art\.\s+([IVX\d]+),?\s*(?:§\s*(\d+))?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const isAmendment = text.toLowerCase().includes('amend');
        const jurisdiction = match[1]?.includes('.') ? 'U.S.' : (match[1] || 'U.S.');

        return {
          id: IdGenerator.generic('cite'),
          type: BluebookCitationType.CONSTITUTION,
          rawText: text,
          formatted: text,
          jurisdiction,
          article: !isAmendment ? match[2] : undefined,
          amendment: isAmendment ? this.romanToDecimal(match[2] || '') : undefined,
          section: match[3],
          isValid: true,
          validationErrors: [],
          metadata: this.createDefaultMetadata()
        };
      }
    }

    return null;
  }

  /**
   * Parse regulation citation (e.g., "29 C.F.R. § 1614.101 (2020)")
   */
  private static parseRegulationCitation(text: string): RegulationCitation | null {
    const pattern = /^(\d+)\s+C\.F\.R\.\s+§\s*([\d.]+)\s*(?:\((\d{4})\))?/i;
    const match = text.match(pattern);

    if (match) {
      return {
        id: IdGenerator.generic('cite'),
        type: BluebookCitationType.REGULATION,
        rawText: text,
        formatted: text,
        title: parseInt(match[1] || '0'),
        section: match[2] || '',
        year: match[3] ? parseInt(match[3]) : new Date().getFullYear(),
        isValid: true,
        validationErrors: [],
        metadata: this.createDefaultMetadata()
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
        id: IdGenerator.generic('cite'),
        type: BluebookCitationType.BOOK,
        rawText: text,
        formatted: text,
        authors,
        title: match[2]?.trim() || '',
        edition: match[3] ? parseInt(match[3]) : undefined,
        year: parseInt(match[4] || '0'),
        isValid: true,
        validationErrors: [],
        metadata: this.createDefaultMetadata()
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
        id: IdGenerator.generic('cite'),
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
        metadata: this.createDefaultMetadata()
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
      // Extract title (text before URL)
      const title = text.substring(0, text.indexOf(match[0])).trim().replace(/,$/, '');

      return {
        id: IdGenerator.generic('cite'),
        type: BluebookCitationType.WEB_RESOURCE,
        rawText: text,
        formatted: text,
        title: title || 'Untitled Web Resource',
        url: match[1] || '',
        accessDate: new Date().toISOString(),
        isValid: true,
        validationErrors: [],
        metadata: this.createDefaultMetadata()
      };
    }

    return null;
  }

  /**
   * Extract citation signal if present
   */
  static extractSignal(text: string): { signal: CitationSignal; remainder: string } {
    const signals: Record<string, CitationSignal> = {
      'see also': CitationSignal.SEE_ALSO,
      'see generally': CitationSignal.SEE_GENERALLY,
      'but see': CitationSignal.BUT_SEE,
      'but cf': CitationSignal.BUT_CF,
      'see': CitationSignal.SEE,
      'cf': CitationSignal.CF,
      'compare': CitationSignal.COMPARE,
      'with': CitationSignal.WITH,
      'contra': CitationSignal.CONTRA,
      'accord': CitationSignal.ACCORD,
      'e.g.': CitationSignal.E_G,
      'eg': CitationSignal.E_G,
    };

    const lower = text.toLowerCase().trim();

    for (const [key, value] of Object.entries(signals)) {
      if (lower.startsWith(key)) {
        return {
          signal: value,
          remainder: text.substring(key.length).trim().replace(/^,\s*/, '')
        };
      }
    }

    return { signal: CitationSignal.NONE, remainder: text };
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

    return CourtLevel.STATE_SUPREME; // Default for state reporters
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
      id: IdGenerator.generic('cite'),
      type: BluebookCitationType.CASE, // Default type
      rawText: text,
      formatted: text,
      isValid: false,
      validationErrors: [{
        code: 'PARSE_FAILED',
        message: 'Unable to parse citation format',
        severity: ValidationSeverity.ERROR,
        suggestion: 'Verify citation follows Bluebook format'
      }],
      metadata: this.createDefaultMetadata()
    };
  }

  /**
   * Create default metadata
   */
  private static createDefaultMetadata() {
    const now = new Date().toISOString();
    return {
      createdAt: now,
      updatedAt: now,
      shortFormEstablished: false,
      citationCount: 0
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

    // Type-specific validation
    switch (citation.type) {
      case BluebookCitationType.CASE:
        errors.push(...this.validateCaseCitation(citation as CaseCitation));
        break;
      case BluebookCitationType.STATUTE:
        errors.push(...this.validateStatuteCitation(citation as StatuteCitation));
        break;
      // Add more type-specific validations
    }

    return errors;
  }

  /**
   * Validate case citation
   */
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

  /**
   * Validate statute citation
   */
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
}

