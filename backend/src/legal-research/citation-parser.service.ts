import { Injectable, Logger } from '@nestjs/common';

/**
 * Parsed citation information
 */
export interface ParsedCitation {
  fullCitation: string;
  caseName?: string;
  volume?: string;
  reporter?: string;
  page?: string;
  court?: string;
  year?: number;
  pincite?: string;
  type: 'case' | 'statute' | 'unknown';
  isValid: boolean;
  errors?: string[];
}

/**
 * Citation Parser Service
 * Implements Bluebook citation format parsing for legal citations
 *
 * Supports:
 * - U.S. Supreme Court citations
 * - Federal Circuit Court citations
 * - District Court citations
 * - State court citations
 * - U.S.C. statute citations
 * - CFR citations
 */
@Injectable()
export class CitationParserService {
  private readonly logger = new Logger(CitationParserService.name);

  /**
   * Standard reporter abbreviations (Bluebook format)
   */
  private readonly reporters = {
    // U.S. Supreme Court
    'U.S.': 'United States Reports',
    'S. Ct.': 'Supreme Court Reporter',
    'L. Ed.': "Lawyers' Edition",
    'L. Ed. 2d': "Lawyers' Edition, Second Series",

    // Federal Circuit Courts
    'F.': 'Federal Reporter',
    'F.2d': 'Federal Reporter, Second Series',
    'F.3d': 'Federal Reporter, Third Series',
    'F.4th': 'Federal Reporter, Fourth Series',
    'F. App\'x': 'Federal Appendix',

    // Federal District Courts
    'F. Supp.': 'Federal Supplement',
    'F. Supp. 2d': 'Federal Supplement, Second Series',
    'F. Supp. 3d': 'Federal Supplement, Third Series',

    // State reporters (examples)
    'N.E.': 'North Eastern Reporter',
    'N.E.2d': 'North Eastern Reporter, Second Series',
    'N.E.3d': 'North Eastern Reporter, Third Series',
    'S.E.': 'South Eastern Reporter',
    'S.E.2d': 'South Eastern Reporter, Second Series',
    'So.': 'Southern Reporter',
    'So. 2d': 'Southern Reporter, Second Series',
    'So. 3d': 'Southern Reporter, Third Series',
    'P.': 'Pacific Reporter',
    'P.2d': 'Pacific Reporter, Second Series',
    'P.3d': 'Pacific Reporter, Third Series',
    'A.': 'Atlantic Reporter',
    'A.2d': 'Atlantic Reporter, Second Series',
    'A.3d': 'Atlantic Reporter, Third Series',
    'N.W.': 'North Western Reporter',
    'N.W.2d': 'North Western Reporter, Second Series',
    'S.W.': 'South Western Reporter',
    'S.W.2d': 'South Western Reporter, Second Series',
    'S.W.3d': 'South Western Reporter, Third Series',

    // Specialty reporters
    'B.R.': 'Bankruptcy Reporter',
    'Fed. Cl.': 'Federal Claims Reporter',
    'Ct. Int\'l Trade': 'Court of International Trade',
  };

  /**
   * Parse a legal citation in Bluebook format
   *
   * Examples:
   * - Roe v. Wade, 410 U.S. 113 (1973)
   * - Brown v. Board of Education, 347 U.S. 483, 495 (1954)
   * - 42 U.S.C. § 1983
   *
   * @param citation The citation string to parse
   * @returns Parsed citation information
   */
  parseCitation(citation: string): ParsedCitation {
    const trimmedCitation = citation.trim();

    // Try to parse as case citation first
    const caseParsed = this.parseCaseCitation(trimmedCitation);
    if (caseParsed.isValid) {
      return caseParsed;
    }

    // Try to parse as statute citation
    const statuteParsed = this.parseStatuteCitation(trimmedCitation);
    if (statuteParsed.isValid) {
      return statuteParsed;
    }

    // Unable to parse
    return {
      fullCitation: trimmedCitation,
      type: 'unknown',
      isValid: false,
      errors: ['Unable to parse citation format'],
    };
  }

  /**
   * Parse case citation (e.g., "Roe v. Wade, 410 U.S. 113 (1973)")
   */
  private parseCaseCitation(citation: string): ParsedCitation {
    const errors: string[] = [];

    // Standard case citation pattern: Case Name, Volume Reporter Page (Court Year)
    // Example: Roe v. Wade, 410 U.S. 113 (1973)
    const casePattern = /^(.+?),\s*(\d+)\s+([A-Za-z.\s']+?)\s+(\d+)(?:,\s*(\d+))?\s*\((.+?)\s+(\d{4})\)/;
    const match = citation.match(casePattern);

    if (match) {
      const [, caseName, volume, reporter, page, pincite, court, year] = match;

      // Validate reporter
      const reporterTrimmed = reporter.trim();
      if (!this.reporters[reporterTrimmed]) {
        errors.push(`Unknown reporter: ${reporterTrimmed}`);
      }

      return {
        fullCitation: citation,
        caseName: caseName.trim(),
        volume,
        reporter: reporterTrimmed,
        page,
        pincite: pincite || undefined,
        court: court.trim(),
        year: parseInt(year, 10),
        type: 'case',
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    // Try simplified pattern without court designation
    // Example: Roe v. Wade, 410 U.S. 113 (1973)
    const simplePattern = /^(.+?),\s*(\d+)\s+([A-Za-z.\s']+?)\s+(\d+)(?:,\s*(\d+))?\s*\((\d{4})\)/;
    const simpleMatch = citation.match(simplePattern);

    if (simpleMatch) {
      const [, caseName, volume, reporter, page, pincite, year] = simpleMatch;

      const reporterTrimmed = reporter.trim();
      if (!this.reporters[reporterTrimmed]) {
        errors.push(`Unknown reporter: ${reporterTrimmed}`);
      }

      return {
        fullCitation: citation,
        caseName: caseName.trim(),
        volume,
        reporter: reporterTrimmed,
        page,
        pincite: pincite || undefined,
        year: parseInt(year, 10),
        type: 'case',
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    return {
      fullCitation: citation,
      type: 'unknown',
      isValid: false,
      errors: ['Does not match case citation pattern'],
    };
  }

  /**
   * Parse statute citation (e.g., "42 U.S.C. § 1983")
   */
  private parseStatuteCitation(citation: string): ParsedCitation {
    // U.S.C. pattern: Title U.S.C. § Section
    const uscPattern = /^(\d+)\s+U\.S\.C\.\s+§\s+(\d+[a-z]?(?:-\d+)?)/i;
    const uscMatch = citation.match(uscPattern);

    if (uscMatch) {
      const [, title, section] = uscMatch;
      return {
        fullCitation: citation,
        volume: title,
        reporter: 'U.S.C.',
        page: section,
        type: 'statute',
        isValid: true,
      };
    }

    // C.F.R. pattern: Title C.F.R. § Section
    const cfrPattern = /^(\d+)\s+C\.F\.R\.\s+§\s+(\d+(?:\.\d+)?)/i;
    const cfrMatch = citation.match(cfrPattern);

    if (cfrMatch) {
      const [, title, section] = cfrMatch;
      return {
        fullCitation: citation,
        volume: title,
        reporter: 'C.F.R.',
        page: section,
        type: 'statute',
        isValid: true,
      };
    }

    // State statute pattern: State Code § Section
    const statePattern = /^([A-Za-z.]+)\s+([A-Za-z.]+)\s+(?:Code\s+)?§\s+(\d+(?:[.-]\d+)*)/i;
    const stateMatch = citation.match(statePattern);

    if (stateMatch) {
      const [, state, code, section] = stateMatch;
      return {
        fullCitation: citation,
        court: state,
        reporter: `${state} ${code}`,
        page: section,
        type: 'statute',
        isValid: true,
      };
    }

    return {
      fullCitation: citation,
      type: 'unknown',
      isValid: false,
      errors: ['Does not match statute citation pattern'],
    };
  }

  /**
   * Extract all citations from text
   *
   * @param text Text to extract citations from
   * @returns Array of parsed citations
   */
  extractCitations(text: string): ParsedCitation[] {
    const citations: ParsedCitation[] = [];

    // Pattern to find case citations in text
    const casePattern = /([A-Z][^,]+?,\s*\d+\s+[A-Za-z.\s']+?\s+\d+(?:,\s*\d+)?\s*\([^)]+\s+\d{4}\))/g;
    let match;

    while ((match = casePattern.exec(text)) !== null) {
      const citation = match[1];
      const parsed = this.parseCitation(citation);
      if (parsed.isValid) {
        citations.push(parsed);
      }
    }

    // Pattern to find statute citations
    const statutePattern = /\b\d+\s+(?:U\.S\.C\.|C\.F\.R\.)\s+§\s+\d+[a-z]?(?:-\d+)?\b/gi;
    let statuteMatch;

    while ((statuteMatch = statutePattern.exec(text)) !== null) {
      const citation = statuteMatch[0];
      const parsed = this.parseCitation(citation);
      if (parsed.isValid) {
        citations.push(parsed);
      }
    }

    return citations;
  }

  /**
   * Validate Bluebook citation format
   *
   * @param citation Citation string to validate
   * @returns True if valid Bluebook format
   */
  validateCitation(citation: string): boolean {
    const parsed = this.parseCitation(citation);
    return parsed.isValid;
  }

  /**
   * Format citation to standard Bluebook format
   *
   * @param parsed Parsed citation
   * @returns Formatted citation string
   */
  formatCitation(parsed: ParsedCitation): string {
    if (parsed.type === 'case') {
      let formatted = `${parsed.caseName}, ${parsed.volume} ${parsed.reporter} ${parsed.page}`;

      if (parsed.pincite) {
        formatted += `, ${parsed.pincite}`;
      }

      if (parsed.court && parsed.year) {
        formatted += ` (${parsed.court} ${parsed.year})`;
      } else if (parsed.year) {
        formatted += ` (${parsed.year})`;
      }

      return formatted;
    }

    if (parsed.type === 'statute') {
      return `${parsed.volume} ${parsed.reporter} § ${parsed.page}`;
    }

    return parsed.fullCitation;
  }

  /**
   * Get short form citation (id., supra, etc.)
   *
   * @param parsed Parsed citation
   * @param previousCitation Previous citation for comparison
   * @returns Short form citation if applicable
   */
  getShortFormCitation(parsed: ParsedCitation, previousCitation?: ParsedCitation): string {
    if (!previousCitation) {
      return this.formatCitation(parsed);
    }

    // If same case, use "Id." with page number if different
    if (
      parsed.type === 'case' &&
      previousCitation.type === 'case' &&
      parsed.caseName === previousCitation.caseName &&
      parsed.volume === previousCitation.volume &&
      parsed.reporter === previousCitation.reporter
    ) {
      if (parsed.page === previousCitation.page) {
        return 'Id.';
      } else if (parsed.pincite) {
        return `Id. at ${parsed.pincite}`;
      }
    }

    // Otherwise use full citation
    return this.formatCitation(parsed);
  }
}
