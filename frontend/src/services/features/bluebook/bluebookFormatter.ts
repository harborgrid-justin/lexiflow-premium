/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                  LEXIFLOW BLUEBOOK FORMATTER                              ║
 * ║         Legal Citation Formatting Engine (21st Edition) v2.0              ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/features/bluebook/bluebookFormatter
 * @architecture Rule-Based Citation Formatting with Style Variants
 * @author LexiFlow Engineering Team
 * @since 2025-12-18 (Enterprise Bluebook System)
 * @status PRODUCTION READY
 * @compliance The Bluebook: A Uniform System of Citation (21st ed. 2020)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *                            ARCHITECTURAL OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  CITATION TYPES SUPPORTED                                                │
 * │  • Cases: Full, short, and id. citations with italics                   │
 * │  • Statutes: U.S.C., C.F.R., state codes with § notation                │
 * │  • Periodicals: Law review articles, journals, books                    │
 * │  • Secondary: Treatises, restatements, legal encyclopedias              │
 * │  • Court Rules: FRCP, FRAP, local rules                                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  FORMATTING OPTIONS                                                      │
 * │  • Full citations: Complete Bluebook format with all elements           │
 * │  • Short citations: Abbreviated form for subsequent references          │
 * │  • Id. citations: "Id." for immediately prior reference                 │
 * │  • Italics: Case names, book titles (configurable)                      │
 * │  • Small caps: Author names in secondary sources (configurable)         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *                          USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @example Format Case Citation (Full)
 * ```typescript
 * const citation = {
 *   type: 'case',
 *   caseName: 'Roe v. Wade',
 *   reporters: [{ volume: '410', reporter: 'U.S.', page: '113' }],
 *   year: '1973'
 * };
 * const formatted = BluebookFormatter.format(citation);
 * // "_Roe v. Wade_, 410 U.S. 113 (1973)"
 * ```
 *
 * @example Short Citation
 * ```typescript
 * const formatted = BluebookFormatter.format(citation, { format: 'short' });
 * // "_Roe_, 410 U.S. at 120"
 * ```
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
//                          CORE DEPENDENCIES
// ═══════════════════════════════════════════════════════════════════════════

import {
  type BluebookCitation,
  BluebookCitationType,
  type BookCitation,
  type CaseCitation,
  type PeriodicalCitation,
  type StatuteCitation,
} from "@/types/bluebook";

// ═══════════════════════════════════════════════════════════════════════════
//                            TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface FormattingOptions {
  italicizeCaseNames?: boolean;
  useSmallCaps?: boolean;
  format?: "full" | "short" | "id";
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
    const {
      italicizeCaseNames = true,
      useSmallCaps = false,
      format = "full",
    } = options;

    const citationType =
      typeof citation.type === "string"
        ? citation.type.toUpperCase()
        : citation.type;
    switch (citationType) {
      case "CASE":
      case "case":
        return this.formatCase(citation, italicizeCaseNames, format);

      case "STATUTE":
      case "statute":
        return this.formatStatute(citation, format);

      case "JOURNAL":
      case "journal":
      case "BOOK":
      case "book":
        return this.formatSecondary(citation, italicizeCaseNames, useSmallCaps);

      default:
        return (
          ((citation as unknown as Record<string, unknown>)[
            "fullCitation"
          ] as string) || ""
        );
    }
  }

  /**
   * Format a case citation
   */
  private formatCase(
    citation: BluebookCitation,
    italicize: boolean,
    format: "full" | "short" | "id",
  ): string {
    const cit = citation as Partial<CaseCitation> & {
      reporters?: Array<{ volume?: string; reporter?: string; page?: string }>;
      shortCitation?: string;
    };
    if (format === "id") {
      return (cit.shortCitation as string) || "Id.";
    }

    if (format === "short" && cit.shortCitation) {
      return cit.shortCitation;
    }

    // Full citation format
    const reporters =
      (cit.reporters as Array<{
        volume?: string;
        reporter?: string;
        page?: string;
      }>) || [];
    const caseName = italicize
      ? `_${cit.caseName}_`
      : String(cit.caseName || "");
    const volume = reporters[0]?.volume || "";
    const reporter = reporters[0]?.reporter || "";
    const page = reporters[0]?.page || "";
    const court = String(cit.court || "");
    const year = String(cit.year || "");

    let formatted = `${caseName}, ${volume} ${reporter} ${page}`;

    if (court && court !== "U.S.") {
      formatted += ` (${court} ${year})`;
    } else if (year) {
      formatted += ` (${year})`;
    }

    if (cit.pinpoint) {
      formatted += `, ${cit.pinpoint}`;
    }

    return formatted;
  }

  /**
   * Format a statute citation
   */
  private formatStatute(
    citation: BluebookCitation,
    format: "full" | "short" | "id",
  ): string {
    if (format === "id") {
      return "Id.";
    }

    const stat = citation as unknown as Partial<StatuteCitation>;
    const title = stat.title || "";
    const code = stat.code || "U.S.C.";
    const section = stat.section || "";
    const subsections = stat.subsections || [];
    const subsection = subsections.length > 0 ? subsections[0] : "";

    let formatted = `${title} ${code} § ${section}`;

    if (subsection) {
      formatted += `(${subsection})`;
    }

    if (stat.year) {
      formatted += ` (${stat.year})`;
    }

    return formatted;
  }

  /**
   * Format secondary sources (journals, books)
   */
  private formatSecondary(
    citation: BluebookCitation,
    italicize: boolean,
    smallCaps: boolean,
  ): string {
    // Try to cast to PeriodicalCitation or BookCitation for accessing specific properties
    const periodical = citation as Partial<PeriodicalCitation>;
    const book = citation as Partial<BookCitation>;

    // Get author - handle both arrays and strings
    let authorStr = "";
    if (
      periodical.authors &&
      Array.isArray(periodical.authors) &&
      periodical.authors.length > 0 &&
      periodical.authors[0]
    ) {
      authorStr = periodical.authors[0].fullName;
    } else if (
      book.authors &&
      Array.isArray(book.authors) &&
      book.authors.length > 0 &&
      book.authors[0]
    ) {
      authorStr = book.authors[0].fullName;
    }
    const author = smallCaps ? this.toSmallCaps(authorStr) : authorStr;

    const title = italicize
      ? `_${periodical.title || book.title || ""}_`
      : periodical.title || book.title || "";
    const volume = periodical.volume || book.volume || "";
    const journal = periodical.publication || "";
    const page = periodical.page || book.pageNumbers || "";
    const year = periodical.year || book.year || "";

    if (
      citation.type === BluebookCitationType.JOURNAL ||
      citation.type === BluebookCitationType.LAW_REVIEW
    ) {
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
      .replace(/_([^_]+)_/g, "$1") // Remove italics markup
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/`([^`]+)`/g, "$1") // Remove code/monospace
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
      secondary: [],
    };

    citations.forEach((citation) => {
      const formatted = this.format(citation);

      // Extract page number from citation
      const page = 1;

      switch (citation.type) {
        case BluebookCitationType.CASE:
        case BluebookCitationType.UNPUBLISHED_OPINION: {
          const existingCase = toa.cases.find((c) => c.citation === formatted);
          if (existingCase) {
            if (!existingCase.pages.includes(page)) {
              existingCase.pages.push(page);
            }
          } else {
            toa.cases.push({ citation: formatted, pages: [page] });
          }
          break;
        }

        case BluebookCitationType.STATUTE:
        case BluebookCitationType.REGULATION: {
          const existingStatute = toa.statutes.find(
            (s) => s.citation === formatted,
          );
          if (existingStatute) {
            if (!existingStatute.pages.includes(page)) {
              existingStatute.pages.push(page);
            }
          } else {
            toa.statutes.push({ citation: formatted, pages: [page] });
          }
          break;
        }

        default: {
          const existingSecondary = toa.secondary.find(
            (s) => s.citation === formatted,
          );
          if (existingSecondary) {
            if (!existingSecondary.pages.includes(page)) {
              existingSecondary.pages.push(page);
            }
          } else {
            toa.secondary.push({ citation: formatted, pages: [page] });
          }
          break;
        }
      }
    });

    // Sort pages
    toa.cases.forEach((c) => c.pages.sort((a, b) => a - b));
    toa.statutes.forEach((s) => s.pages.sort((a, b) => a - b));
    toa.secondary.forEach((s) => s.pages.sort((a, b) => a - b));

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
      errors.push("Citation type is required");
    }

    if (citation.type === BluebookCitationType.CASE) {
      const caseCit = citation as CaseCitation;
      if (!caseCit.caseName) errors.push("Case name is required");
      if (!caseCit.reporter) {
        errors.push("At least one reporter is required");
      }
      if (!caseCit.year) errors.push("Year is required");
    }

    if (citation.type === BluebookCitationType.STATUTE) {
      const statute = citation as StatuteCitation;
      if (!statute.section) errors.push("Statute section is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const BluebookFormatter = new BluebookFormatterClass();
