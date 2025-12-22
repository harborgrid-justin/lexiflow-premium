import { Injectable } from '@nestjs/common';

/**
 * Bluebook citation formatting service
 * Provides parsing, formatting, and validation for legal citations
 */
@Injectable()
export class BluebookService {
  
  /**
   * Parse a raw citation string
   */
  parseCitation(rawCitation: string): any {
    // Case citation pattern
    const casePattern = /^(.+?)\s+v\.\s+(.+?),\s*(\d+)\s+([\w\s.]+)\s+(\d+)(?:,\s*(\d+))?\s*\((.*?)(\d{4})\)/i;
    const caseMatch = rawCitation.match(casePattern);
    
    if (caseMatch) {
      return {
        type: 'CASE',
        party1: caseMatch[1].trim(),
        party2: caseMatch[2].trim(),
        volume: parseInt(caseMatch[3] || '0', 10),
        reporter: caseMatch[4].trim(),
        page: parseInt(caseMatch[5] || '0', 10),
        pinpoint: caseMatch[6],
        court: caseMatch[7]?.trim(),
        year: parseInt(caseMatch[8] || '0', 10),
        raw: rawCitation
      };
    }

    // Statute citation pattern
    const statutePattern = /^(\d+)\s+(U\.S\.C\.|U\.S\.C\.A\.)\s+§\s*([\d\w-]+)\s*(?:\((\d{4})\))?/i;
    const statuteMatch = rawCitation.match(statutePattern);
    
    if (statuteMatch) {
      return {
        type: 'STATUTE',
        title: parseInt(statuteMatch[1] || '0', 10),
        code: statuteMatch[2],
        section: statuteMatch[3],
        year: statuteMatch[4] ? parseInt(statuteMatch[4], 10) : undefined,
        raw: rawCitation
      };
    }

    // Constitution pattern
    const constitutionPattern = /^(U\.S\.|United States)\s+Const\.?\s+(amend\.|art\.)\s+([IVX\d]+)/i;
    const constitutionMatch = rawCitation.match(constitutionPattern);
    
    if (constitutionMatch) {
      return {
        type: 'CONSTITUTION',
        jurisdiction: 'U.S.',
        provision: constitutionMatch[2].includes('amend') ? 'amendment' : 'article',
        number: constitutionMatch[3],
        raw: rawCitation
      };
    }

    // Regulation pattern
    const regulationPattern = /^(\d+)\s+C\.F\.R\.\s+§\s*([\d.]+)\s*(?:\((\d{4})\))?/i;
    const regulationMatch = rawCitation.match(regulationPattern);
    
    if (regulationMatch) {
      return {
        type: 'REGULATION',
        title: parseInt(regulationMatch[1] || '0', 10),
        section: regulationMatch[2],
        year: regulationMatch[3] ? parseInt(regulationMatch[3], 10) : undefined,
        raw: rawCitation
      };
    }

    // Unknown type
    return {
      type: 'UNKNOWN',
      raw: rawCitation,
      error: 'Unable to parse citation format'
    };
  }

  /**
   * Format a parsed citation
   */
  formatCitation(parsed: any, options: any = {}): string {
    const { italicizeCaseNames = true, _useSmallCaps = true } = options;

    switch (parsed.type) {
      case 'CASE':
        return this.formatCaseCitation(parsed, italicizeCaseNames);
      
      case 'STATUTE':
        return this.formatStatuteCitation(parsed);
      
      case 'CONSTITUTION':
        return this.formatConstitutionCitation(parsed);
      
      case 'REGULATION':
        return this.formatRegulationCitation(parsed);
      
      default:
        return parsed.raw;
    }
  }

  /**
   * Format case citation
   */
  private formatCaseCitation(parsed: any, italicize: boolean): string {
    const caseName = `${parsed.party1} v. ${parsed.party2}`;
    const formattedName = italicize ? `<em>${caseName}</em>` : caseName;
    
    let formatted = `${formattedName}, ${parsed.volume} ${parsed.reporter} ${parsed.page}`;
    
    if (parsed.pinpoint) {
      formatted += `, ${parsed.pinpoint}`;
    }
    
    const courtYear = [];
    if (parsed.court) courtYear.push(parsed.court);
    if (parsed.year) courtYear.push(parsed.year.toString());
    
    if (courtYear.length > 0) {
      formatted += ` (${courtYear.join(' ')})`;
    }
    
    return formatted;
  }

  /**
   * Format statute citation
   */
  private formatStatuteCitation(parsed: any): string {
    let formatted = `${parsed.title} ${parsed.code} § ${parsed.section}`;
    
    if (parsed.year) {
      formatted += ` (${parsed.year})`;
    }
    
    return formatted;
  }

  /**
   * Format constitutional citation
   */
  private formatConstitutionCitation(parsed: any): string {
    const provision = parsed.provision === 'amendment' ? 'amend.' : 'art.';
    return `${parsed.jurisdiction} Const. ${provision} ${parsed.number}`;
  }

  /**
   * Format regulation citation
   */
  private formatRegulationCitation(parsed: any): string {
    let formatted = `${parsed.title} C.F.R. § ${parsed.section}`;
    
    if (parsed.year) {
      formatted += ` (${parsed.year})`;
    }
    
    return formatted;
  }

  /**
   * Validate a citation
   */
  validateCitation(parsed: any): any[] {
    const errors = [];

    switch (parsed.type) {
      case 'CASE':
        if (!parsed.party1 || !parsed.party2) {
          errors.push({
            code: 'INVALID_CASE_NAME',
            message: 'Case name is missing or incomplete',
            severity: 'ERROR'
          });
        }
        if (!parsed.year || parsed.year < 1700) {
          errors.push({
            code: 'INVALID_YEAR',
            message: 'Year is invalid or missing',
            severity: 'ERROR'
          });
        }
        break;

      case 'STATUTE':
        if (!parsed.section) {
          errors.push({
            code: 'MISSING_SECTION',
            message: 'Section number is required',
            severity: 'ERROR'
          });
        }
        break;

      case 'UNKNOWN':
        errors.push({
          code: 'PARSE_FAILED',
          message: parsed.error || 'Unable to parse citation format',
          severity: 'ERROR'
        });
        break;
    }

    return errors;
  }

  /**
   * Batch format citations
   */
  batchFormat(citations: string[], options: any = {}): any {
    const startTime = Date.now();
    const results = [];
    let successful = 0;
    let failed = 0;
    let warnings = 0;

    for (const citation of citations) {
      const parsed = this.parseCitation(citation);
      const errors = this.validateCitation(parsed);
      const formatted = this.formatCitation(parsed, options);
      const isValid = errors.length === 0 || errors.every(e => e.severity !== 'ERROR');

      results.push({
        original: citation,
        formatted,
        type: parsed.type,
        isValid,
        errors,
        suggestions: this.generateSuggestions(parsed, errors)
      });

      if (isValid) {
        successful++;
        if (errors.length > 0) warnings++;
      } else {
        failed++;
      }
    }

    const processingTime = Date.now() - startTime;

    return {
      results,
      summary: {
        total: citations.length,
        successful,
        failed,
        warnings,
        processingTime
      }
    };
  }

  /**
   * Generate suggestions for fixing citations
   */
  private generateSuggestions(parsed: any, errors: any[]): string[] {
    const suggestions = [];

    if (parsed.type === 'UNKNOWN') {
      suggestions.push('Verify citation follows Bluebook format');
      suggestions.push('Check for proper case name format (Party v. Party)');
      suggestions.push('Ensure reporter abbreviation is correct');
    }

    if (errors.some(e => e.code === 'INVALID_YEAR')) {
      suggestions.push('Check year is within valid range (1700-present)');
    }

    if (errors.some(e => e.code === 'MISSING_SECTION')) {
      suggestions.push('Add section number after §');
    }

    return suggestions;
  }

  /**
   * Generate table of authorities
   */
  generateTableOfAuthorities(citations: string[]): string {
    const parsed = citations.map(c => this.parseCitation(c));
    const grouped: Record<string, any[]> = {};

    // Group by type
    parsed.forEach(p => {
      if (!grouped[p.type]) {
        grouped[p.type] = [];
      }
      grouped[p.type].push(p);
    });

    let html = '<div class="table-of-authorities">';

    const typeOrder = ['CASE', 'CONSTITUTION', 'STATUTE', 'REGULATION', 'BOOK'];
    const typeLabels: Record<string, string> = {
      CASE: 'Cases',
      CONSTITUTION: 'Constitutional Provisions',
      STATUTE: 'Statutes',
      REGULATION: 'Regulations',
      BOOK: 'Books and Treatises'
    };

    typeOrder.forEach(type => {
      if (grouped[type] && grouped[type].length > 0) {
        html += `<h3>${typeLabels[type] || type}</h3><ul>`;
        grouped[type].forEach(p => {
          const formatted = this.formatCitation(p, { italicizeCaseNames: true });
          html += `<li>${formatted}</li>`;
        });
        html += '</ul>';
      }
    });

    html += '</div>';
    return html;
  }
}
