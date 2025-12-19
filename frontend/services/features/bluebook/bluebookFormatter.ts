/**
 * @module services/features/bluebook/bluebookFormatter
 * @category Services - Bluebook
 * @description Production-ready Bluebook citation formatter with comprehensive formatting options
 */

import {
  BluebookCitation,
  BluebookCaseReporter,
  BluebookStatuteCitation,
  BluebookJournalCitation
} from '../../../types/bluebook';

interface FormattingOptions {
  italicizeCaseNames?: boolean;
  useSmallCaps?: boolean;
  format?: 'full' | 'short' | 'id';
}

interface TableOfAuthorities {
  cases: Array<{ citation: string; pages: number[] }>;
  statutes: Array<{ citation: string; pages: number[] }>;
  secondary: Array<{ citation: string; pages: number[] }>;
}

class BluebookFormatterClass {
  /**
   * Format a Bluebook citation according to specified options
   * @param citation Parsed citation object
   * @param options Formatting options
   * @returns Formatted citation string
   */
  format(citation: BluebookCitation, options: FormattingOptions = {}): string {
    const { italicizeCaseNames = true, useSmallCaps = false, format = 'full' } = options;

    switch (citation.type) {
      case 'case':
        return this.formatCase(citation, italicizeCaseNames, useSmallCaps, format);
      
      case 'statute':
        return this.formatStatute(citation as any, format);
      
      case 'journal':
      case 'book':
        return this.formatSecondary(citation, italicizeCaseNames, useSmallCaps);
      
      default:
        return citation.fullCitation || '';
    }
  }

  /**
   * Format a case citation
   */
  private formatCase(
    citation: BluebookCitation,
    italicize: boolean,
    smallCaps: boolean,
    format: 'full' | 'short' | 'id'
  ): string {
    if (format === 'id') {
      return citation.shortCitation || 'Id.';
    }

    if (format === 'short' && citation.shortCitation) {
      return citation.shortCitation;
    }

    // Full citation format
    const caseName = italicize ? `_${citation.caseName}_` : citation.caseName;
    const volume = citation.reporters?.[0]?.volume || '';
    const reporter = citation.reporters?.[0]?.reporter || '';
    const page = citation.reporters?.[0]?.page || '';
    const court = citation.court || '';
    const year = citation.year || '';

    let formatted = `${caseName}, ${volume} ${reporter} ${page}`;
    
    if (court && court !== 'U.S.') {
      formatted += ` (${court} ${year})`;
    } else if (year) {
      formatted += ` (${year})`;
    }

    if (citation.pinpoint) {
      formatted += `, ${citation.pinpoint}`;
    }

    return formatted;
  }

  /**
   * Format a statute citation
   */
  private formatStatute(citation: any, format: 'full' | 'short' | 'id'): string {
    if (format === 'id') {
      return 'Id.';
    }

    const title = citation.title || '';
    const code = citation.code || 'U.S.C.';
    const section = citation.section || '';
    const subsection = citation.subsection || '';

    let formatted = `${title} ${code} § ${section}`;
    
    if (subsection) {
      formatted += `(${subsection})`;
    }

    if (citation.year) {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format secondary sources (journals, books)
   */
  private formatSecondary(
    citation: BluebookCitation,
    italicize: boolean,
    smallCaps: boolean
  ): string {
    const author = smallCaps ? this.toSmallCaps(citation.author || '') : citation.author || '';
    const title = italicize ? `_${citation.title}_` : citation.title;
    const volume = citation.volume || '';
    const journal = citation.journalName || citation.publicationTitle || '';
    const page = citation.page || '';
    const year = citation.year || '';

    if (citation.type === 'journal') {
      return `${author}, ${title}, ${volume} ${journal} ${page} (${year})`;
    }

    return `${author}, ${title} (${year})`;
  }

  /**
   * Strip formatting markup from citation (italics, small caps)
   * @param formatted Formatted citation with markup
   * @returns Plain text citation
   */
  stripFormatting(formatted: string): string {
    return formatted
      .replace(/_([^_]+)_/g, '$1') // Remove italics markup
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/`([^`]+)`/g, '$1') // Remove code/monospace
      .trim();
  }

  /**
   * Convert text to small caps representation
   */
  private toSmallCaps(text: string): string {
    // Simple uppercase representation (browser rendering would handle actual small caps via CSS)
    return text.toUpperCase();
  }

  /**
   * Create a Table of Authorities from citations
   * @param citations Array of citations to organize
   * @returns Organized table of authorities
   */
  createTableOfAuthorities(citations: BluebookCitation[]): TableOfAuthorities {
    const toa: TableOfAuthorities = {
      cases: [],
      statutes: [],
      secondary: []
    };

    citations.forEach(citation => {
      const formatted = this.format(citation);
      const page = citation.page ? parseInt(citation.page, 10) : 1;

      switch (citation.type) {
        case 'case':
          const existingCase = toa.cases.find(c => c.citation === formatted);
          if (existingCase) {
            if (!existingCase.pages.includes(page)) {
              existingCase.pages.push(page);
            }
          } else {
            toa.cases.push({ citation: formatted, pages: [page] });
          }
          break;

        case 'statute':
        case 'regulation':
          const existingStatute = toa.statutes.find(s => s.citation === formatted);
          if (existingStatute) {
            if (!existingStatute.pages.includes(page)) {
              existingStatute.pages.push(page);
            }
          } else {
            toa.statutes.push({ citation: formatted, pages: [page] });
          }
          break;

        default:
          const existingSecondary = toa.secondary.find(s => s.citation === formatted);
          if (existingSecondary) {
            if (!existingSecondary.pages.includes(page)) {
              existingSecondary.pages.push(page);
            }
          } else {
            toa.secondary.push({ citation: formatted, pages: [page] });
          }
      }
    });

    // Sort pages
    toa.cases.forEach(c => c.pages.sort((a, b) => a - b));
    toa.statutes.forEach(s => s.pages.sort((a, b) => a - b));
    toa.secondary.forEach(s => s.pages.sort((a, b) => a - b));

    // Sort alphabetically
    toa.cases.sort((a, b) => a.citation.localeCompare(b.citation));
    toa.statutes.sort((a, b) => a.citation.localeCompare(b.citation));
    toa.secondary.sort((a, b) => a.citation.localeCompare(b.citation));

    return toa;
  }

  /**
   * Validate a citation format
   * @param citation Citation to validate
   * @returns Validation result with errors
   */
  validate(citation: BluebookCitation): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!citation.type) {
      errors.push('Citation type is required');
    }

    if (citation.type === 'case') {
      if (!citation.caseName) errors.push('Case name is required');
      if (!citation.reporters || citation.reporters.length === 0) {
        errors.push('At least one reporter is required');
      }
      if (!citation.year) errors.push('Year is required');
    }

    if (citation.type === 'statute') {
      const statute = citation as any;
      if (!statute.section) errors.push('Statute section is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const BluebookFormatter = new BluebookFormatterClass();
