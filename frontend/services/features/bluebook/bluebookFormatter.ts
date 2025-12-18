/**
 * @module services/bluebook/bluebookFormatter
 * @category Legal Research - Citation Formatter
 * @description Format structured citations into proper Bluebook style
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
  CitationFormat,
  BluebookFormatOptions,
  TypefaceStyle,
  CitationSignal,
  CourtLevel
} from '../../types/bluebook';

/**
 * Bluebook citation formatter
 */
export class BluebookFormatter {

  /**
   * Format a parsed citation according to Bluebook rules
   */
  static format(citation: BluebookCitation, options?: Partial<BluebookFormatOptions>): string {
    const opts = this.getDefaultOptions(options);
    
    let formatted = '';

    // Add signal if present
    if (opts.includeSignal && citation.signal && citation.signal !== CitationSignal.NONE) {
      formatted += this.formatSignal(citation.signal) + ' ';
    }

    // Format based on type
    switch (citation.type) {
      case BluebookCitationType.CASE:
        formatted += this.formatCaseCitation(citation as CaseCitation, opts);
        break;
      case BluebookCitationType.STATUTE:
        formatted += this.formatStatuteCitation(citation as StatuteCitation, opts);
        break;
      case BluebookCitationType.CONSTITUTION:
        formatted += this.formatConstitutionCitation(citation as ConstitutionCitation, opts);
        break;
      case BluebookCitationType.REGULATION:
        formatted += this.formatRegulationCitation(citation as RegulationCitation, opts);
        break;
      case BluebookCitationType.BOOK:
        formatted += this.formatBookCitation(citation as BookCitation, opts);
        break;
      case BluebookCitationType.LAW_REVIEW:
      case BluebookCitationType.JOURNAL:
        formatted += this.formatPeriodicalCitation(citation as PeriodicalCitation, opts);
        break;
      case BluebookCitationType.WEB_RESOURCE:
        formatted += this.formatWebCitation(citation as WebCitation, opts);
        break;
      default:
        formatted += citation.rawText;
    }

    // Add parenthetical if present
    if (opts.includeParenthetical && citation.parenthetical) {
      formatted += ` (${citation.parenthetical})`;
    }

    return formatted;
  }

  /**
   * Format case citation (Rule 10)
   */
  private static formatCaseCitation(citation: CaseCitation, options: BluebookFormatOptions): string {
    let formatted = '';

    // Case name formatting
    const caseName = options.italicizeCaseNames
      ? `<em>${citation.caseName}</em>`
      : citation.caseName;
    
    formatted += caseName + ', ';

    // Reporter citation
    formatted += `${citation.volume} ${this.formatReporter(citation.reporter)} ${citation.page}`;

    // Pinpoint
    if (options.includePinpoint && citation.pinpoint) {
      formatted += `, ${citation.pinpoint}`;
    }

    // Court and year parenthetical
    const courtYear = this.formatCourtYear(citation);
    if (courtYear) {
      formatted += ` ${courtYear}`;
    }

    return formatted;
  }

  /**
   * Format court and year parenthetical
   */
  private static formatCourtYear(citation: CaseCitation): string {
    const parts: string[] = [];

    // Add court abbreviation if not Supreme Court
    if (citation.court !== CourtLevel.SUPREME_COURT && citation.courtAbbreviation) {
      parts.push(citation.courtAbbreviation);
    }

    // Add year
    if (citation.year) {
      parts.push(citation.year.toString());
    }

    return parts.length > 0 ? `(${parts.join(' ')})` : '';
  }

  /**
   * Format statute citation (Rule 12)
   */
  private static formatStatuteCitation(citation: StatuteCitation, options: BluebookFormatOptions): string {
    let formatted = '';

    // Title
    formatted += citation.title;

    // Code
    formatted += ` ${citation.code}`;

    // Section symbol
    formatted += ' §';

    // Section number with subsections
    if (citation.subsections && citation.subsections.length > 0) {
      formatted += ` ${citation.section}(${citation.subsections.join(')(')})`;
    } else {
      formatted += ` ${citation.section}`;
    }

    // Year and supplement
    if (citation.year) {
      if (citation.supplement) {
        formatted += ` (Supp. ${citation.year})`;
      } else {
        formatted += ` (${citation.year})`;
      }
    }

    return formatted;
  }

  /**
   * Format constitutional citation (Rule 11)
   */
  private static formatConstitutionCitation(citation: ConstitutionCitation, options: BluebookFormatOptions): string {
    let formatted = citation.jurisdiction + ' Const.';

    if (citation.amendment) {
      formatted += ` amend. ${this.toRoman(citation.amendment)}`;
    } else if (citation.article) {
      formatted += ` art. ${citation.article}`;
    }

    if (citation.section) {
      formatted += `, § ${citation.section}`;
    }

    if (citation.clause) {
      formatted += `, cl. ${citation.clause}`;
    }

    if (citation.repealed) {
      formatted += ' (repealed)';
    }

    return formatted;
  }

  /**
   * Format regulation citation (Rule 14)
   */
  private static formatRegulationCitation(citation: RegulationCitation, options: BluebookFormatOptions): string {
    let formatted = `${citation.title} C.F.R. § ${citation.section}`;

    if (citation.year) {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format book citation (Rule 15)
   */
  private static formatBookCitation(citation: BookCitation, options: BluebookFormatOptions): string {
    let formatted = '';

    // Authors
    formatted += this.formatAuthors(citation.authors);

    // Title (in small caps for Bluebook)
    const title = options.useSmallCaps
      ? `<span class="small-caps">${citation.title}</span>`
      : citation.title.toUpperCase();
    formatted += `, ${title}`;

    // Page numbers
    if (citation.pageNumbers) {
      formatted += ` ${citation.pageNumbers}`;
    }

    // Edition and year
    if (citation.edition && citation.edition > 1) {
      formatted += ` (${citation.edition}${this.getOrdinalSuffix(citation.edition)} ed. ${citation.year})`;
    } else {
      formatted += ` (${citation.year})`;
    }

    return formatted;
  }

  /**
   * Format periodical citation (Rule 16)
   */
  private static formatPeriodicalCitation(citation: PeriodicalCitation, options: BluebookFormatOptions): string {
    let formatted = '';

    // Authors
    formatted += this.formatAuthors(citation.authors);

    // Title (italicized)
    formatted += `, <em>${citation.title}</em>`;

    // Volume, publication, page
    formatted += `, ${citation.volume} ${citation.publication} ${citation.page}`;

    // Year
    formatted += ` (${citation.year})`;

    return formatted;
  }

  /**
   * Format web citation (Rule 18.2)
   */
  private static formatWebCitation(citation: WebCitation, options: BluebookFormatOptions): string {
    let formatted = '';

    if (citation.author) {
      formatted += `${citation.author}, `;
    }

    formatted += `<em>${citation.title}</em>`;

    if (citation.publisher) {
      formatted += `, ${citation.publisher}`;
    }

    formatted += `, ${citation.url}`;

    if (citation.archived && citation.archiveUrl) {
      formatted += ` (archived at ${citation.archiveUrl})`;
    }

    formatted += ` (last visited ${this.formatDate(citation.accessDate)})`;

    return formatted;
  }

  /**
   * Format signal prefix
   */
  private static formatSignal(signal: CitationSignal): string {
    const signalMap: Record<CitationSignal, string> = {
      [CitationSignal.NONE]: '',
      [CitationSignal.SEE]: '<em>See</em>',
      [CitationSignal.SEE_ALSO]: '<em>See also</em>',
      [CitationSignal.CF]: '<em>Cf.</em>',
      [CitationSignal.COMPARE]: '<em>Compare</em>',
      [CitationSignal.WITH]: '<em>with</em>',
      [CitationSignal.CONTRA]: '<em>Contra</em>',
      [CitationSignal.BUT_SEE]: '<em>But see</em>',
      [CitationSignal.BUT_CF]: '<em>But cf.</em>',
      [CitationSignal.SEE_GENERALLY]: '<em>See generally</em>',
      [CitationSignal.ACCORD]: '<em>Accord</em>',
      [CitationSignal.E_G]: '<em>e.g.</em>',
    };

    return signalMap[signal] || '';
  }

  /**
   * Format authors list
   */
  private static formatAuthors(authors: any[]): string {
    if (authors.length === 0) return '';
    if (authors.length === 1) return authors[0].fullName;
    if (authors.length === 2) return `${authors[0].fullName} & ${authors[1].fullName}`;
    
    // Three or more authors: use "et al."
    return `${authors[0].fullName} et al.`;
  }

  /**
   * Format reporter abbreviation
   */
  private static formatReporter(reporter: string): string {
    // Normalize spacing in reporter abbreviations
    return reporter
      .replace(/\s+/g, ' ')
      .replace(/\s*\.\s*/g, '. ')
      .trim()
      .replace(/\s+$/, '');
  }

  /**
   * Format date for web citations
   */
  private static formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}. ${date.getDate()}, ${date.getFullYear()}`;
  }

  /**
   * Convert number to Roman numeral
   */
  private static toRoman(num: number): string {
    const values = [
      { value: 1000, numeral: 'M' },
      { value: 900, numeral: 'CM' },
      { value: 500, numeral: 'D' },
      { value: 400, numeral: 'CD' },
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];

    let result = '';
    for (const { value, numeral } of values) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  }

  /**
   * Get ordinal suffix for numbers
   */
  private static getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Format short form citation (subsequent references)
   */
  static formatShortForm(citation: BluebookCitation, options?: Partial<BluebookFormatOptions>): string {
    if (citation.type === BluebookCitationType.CASE) {
      const caseCite = citation as CaseCitation;
      // Use party name only for short form
      const firstParty = caseCite.party1.split(/\s+/)[0];
      return `${firstParty}, ${caseCite.volume} ${this.formatReporter(caseCite.reporter)} at ${caseCite.page}`;
    }

    // For other types, use standard formatting
    return this.format(citation, options);
  }

  /**
   * Format id. citation
   */
  static formatId(pinpoint?: string): string {
    let result = '<em>Id.</em>';
    if (pinpoint) {
      result += ` at ${pinpoint}`;
    }
    return result;
  }

  /**
   * Format supra citation
   */
  static formatSupra(hereinafterName: string, pinpoint?: string): string {
    let result = `${hereinafterName}, <em>supra</em>`;
    if (pinpoint) {
      result += ` note ${pinpoint}`;
    }
    return result;
  }

  /**
   * Get default formatting options
   */
  private static getDefaultOptions(partial?: Partial<BluebookFormatOptions>): BluebookFormatOptions {
    return {
      format: CitationFormat.FULL,
      includeSignal: true,
      includeParenthetical: true,
      includePinpoint: true,
      typeface: TypefaceStyle.NORMAL,
      italicizeCaseNames: true,
      useSmallCaps: true,
      spacing: 'BLUEBOOK' as any,
      ...partial
    };
  }

  /**
   * Strip HTML formatting for plain text export
   */
  static stripFormatting(formatted: string): string {
    return formatted
      .replace(/<\/?em>/g, '')
      .replace(/<span class="small-caps">(.*?)<\/span>/g, '$1')
      .replace(/<\/?[^>]+(>|$)/g, '');
  }

  /**
   * Convert formatted citation to HTML
   */
  static toHTML(citation: BluebookCitation, options?: Partial<BluebookFormatOptions>): string {
    return this.format(citation, options);
  }

  /**
   * Convert formatted citation to plain text
   */
  static toPlainText(citation: BluebookCitation, options?: Partial<BluebookFormatOptions>): string {
    const formatted = this.format(citation, options);
    return this.stripFormatting(formatted);
  }

  /**
   * Batch format multiple citations
   */
  static batchFormat(citations: BluebookCitation[], options?: Partial<BluebookFormatOptions>): string[] {
    return citations.map(c => this.format(c, options));
  }

  /**
   * Create citation table of authorities
   */
  static createTableOfAuthorities(citations: BluebookCitation[]): string {
    const grouped: Record<string, BluebookCitation[]> = {};

    // Group by type
    citations.forEach(c => {
      const type = c.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(c);
    });

    let html = '<div class="table-of-authorities">';

    // Format each group
    const typeOrder = [
      BluebookCitationType.CASE,
      BluebookCitationType.CONSTITUTION,
      BluebookCitationType.STATUTE,
      BluebookCitationType.REGULATION,
      BluebookCitationType.BOOK,
      BluebookCitationType.LAW_REVIEW,
    ];

    typeOrder.forEach(type => {
      if (grouped[type] && grouped[type].length > 0) {
        html += `<h3>${this.getTypeLabel(type)}</h3>`;
        html += '<ul>';
        grouped[type]
          .sort((a, b) => this.toPlainText(a).localeCompare(this.toPlainText(b)))
          .forEach(c => {
            html += `<li>${this.format(c)}</li>`;
          });
        html += '</ul>';
      }
    });

    html += '</div>';
    return html;
  }

  /**
   * Get friendly label for citation type
   */
  private static getTypeLabel(type: BluebookCitationType): string {
    const labels: Record<BluebookCitationType, string> = {
      [BluebookCitationType.CASE]: 'Cases',
      [BluebookCitationType.CONSTITUTION]: 'Constitutional Provisions',
      [BluebookCitationType.STATUTE]: 'Statutes',
      [BluebookCitationType.REGULATION]: 'Regulations',
      [BluebookCitationType.BOOK]: 'Books and Treatises',
      [BluebookCitationType.LAW_REVIEW]: 'Law Reviews and Journals',
      [BluebookCitationType.NEWSPAPER]: 'Newspapers',
      [BluebookCitationType.JOURNAL]: 'Journals',
      [BluebookCitationType.WEB_RESOURCE]: 'Web Resources',
      [BluebookCitationType.LEGISLATIVE_MATERIAL]: 'Legislative Materials',
      [BluebookCitationType.TREATY]: 'Treaties',
      [BluebookCitationType.RESTATEMENT]: 'Restatements',
      [BluebookCitationType.UNIFORM_LAW]: 'Uniform Laws',
      [BluebookCitationType.MODEL_CODE]: 'Model Codes',
      [BluebookCitationType.BRIEF]: 'Briefs and Records',
      [BluebookCitationType.RECORD]: 'Records',
      [BluebookCitationType.ADMINISTRATIVE_DECISION]: 'Administrative Decisions',
      [BluebookCitationType.EXECUTIVE_ORDER]: 'Executive Orders',
      [BluebookCitationType.UNPUBLISHED_OPINION]: 'Unpublished Opinions',
      [BluebookCitationType.FOREIGN_LAW]: 'Foreign Law',
      [BluebookCitationType.INTERNATIONAL_LAW]: 'International Law',
    };

    return labels[type] || 'Other Sources';
  }
}

