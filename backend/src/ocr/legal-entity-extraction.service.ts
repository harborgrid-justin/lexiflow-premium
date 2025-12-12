import { Injectable, Logger } from '@nestjs/common';

export interface EntityExtractionResult {
  parties: Party[];
  dates: DateEntity[];
  amounts: AmountEntity[];
  locations: LocationEntity[];
  caseNumbers: CaseNumber[];
  citations: Citation[];
  attorneys: Attorney[];
  judges: Judge[];
  contracts: ContractReference[];
  statutes: StatuteReference[];
}

export interface Party {
  name: string;
  type: 'person' | 'organization' | 'government';
  role?: 'plaintiff' | 'defendant' | 'appellant' | 'appellee' | 'petitioner' | 'respondent';
  position?: number;
  context: string;
}

export interface DateEntity {
  date: string;
  normalizedDate?: Date;
  type: 'filing' | 'hearing' | 'deadline' | 'effective' | 'termination' | 'general';
  position: number;
  context: string;
}

export interface AmountEntity {
  amount: number;
  currency: string;
  type: 'damages' | 'fee' | 'settlement' | 'rent' | 'payment' | 'general';
  position: number;
  context: string;
}

export interface LocationEntity {
  location: string;
  type: 'court' | 'venue' | 'address' | 'jurisdiction';
  position: number;
  context: string;
}

export interface CaseNumber {
  caseNumber: string;
  court?: string;
  year?: number;
  position: number;
  context: string;
}

export interface Citation {
  citation: string;
  volume?: string;
  reporter?: string;
  page?: string;
  year?: number;
  type: 'case' | 'statute' | 'regulation';
  position: number;
  context: string;
}

export interface Attorney {
  name: string;
  barNumber?: string;
  firm?: string;
  role?: 'counsel' | 'co-counsel' | 'attorney of record';
  position: number;
  context: string;
}

export interface Judge {
  name: string;
  title?: string;
  court?: string;
  position: number;
  context: string;
}

export interface ContractReference {
  type: string;
  parties?: string[];
  date?: string;
  position: number;
  context: string;
}

export interface StatuteReference {
  title: string;
  section?: string;
  subsection?: string;
  position: number;
  context: string;
}

/**
 * Legal Entity Extraction Service
 * Extracts structured legal entities from OCR text:
 * - Party names (plaintiffs, defendants, etc.)
 * - Dates (filing dates, deadlines, effective dates)
 * - Monetary amounts (damages, fees, settlements)
 * - Case numbers and citations
 * - Attorneys and judges
 * - Legal references (statutes, regulations)
 * - Locations (courts, venues, jurisdictions)
 */
@Injectable()
export class LegalEntityExtractionService {
  private readonly logger = new Logger(LegalEntityExtractionService.name);

  /**
   * Extract all legal entities from text
   */
  async extractEntities(text: string): Promise<EntityExtractionResult> {
    try {
      this.logger.log('Starting legal entity extraction');

      const result: EntityExtractionResult = {
        parties: this.extractParties(text),
        dates: this.extractDates(text),
        amounts: this.extractAmounts(text),
        locations: this.extractLocations(text),
        caseNumbers: this.extractCaseNumbers(text),
        citations: this.extractCitations(text),
        attorneys: this.extractAttorneys(text),
        judges: this.extractJudges(text),
        contracts: this.extractContractReferences(text),
        statutes: this.extractStatuteReferences(text),
      };

      this.logger.log(
        `Entity extraction completed: ` +
        `${result.parties.length} parties, ` +
        `${result.dates.length} dates, ` +
        `${result.amounts.length} amounts`,
      );

      return result;

    } catch (error) {
      this.logger.error(`Entity extraction failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract party names and roles
   */
  private extractParties(text: string): Party[] {
    const parties: Party[] = [];

    // Pattern for plaintiff/defendant format
    const plaintiffDefendantPattern = /(\w+(?:\s+\w+)*),?\s+(Plaintiff|Defendant|Appellant|Appellee|Petitioner|Respondent)/gi;
    let match: RegExpExecArray;

    while ((match = plaintiffDefendantPattern.exec(text)) !== null) {
      const name = match[1].trim();
      const role = match[2].toLowerCase() as Party['role'];

      parties.push({
        name,
        type: this.determinePartyType(name),
        role,
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    // Pattern for "v." format (plaintiff v. defendant)
    const vsPattern = /([A-Z][a-zA-Z\s&.,']+)\s+v\.\s+([A-Z][a-zA-Z\s&.,']+)/g;
    while ((match = vsPattern.exec(text)) !== null) {
      const plaintiff = match[1].trim();
      const defendant = match[2].trim();

      if (!parties.some(p => p.name === plaintiff)) {
        parties.push({
          name: plaintiff,
          type: this.determinePartyType(plaintiff),
          role: 'plaintiff',
          position: match.index,
          context: this.getContext(text, match.index, 50),
        });
      }

      if (!parties.some(p => p.name === defendant)) {
        parties.push({
          name: defendant,
          type: this.determinePartyType(defendant),
          role: 'defendant',
          position: match.index + match[1].length + 4,
          context: this.getContext(text, match.index, 50),
        });
      }
    }

    // Pattern for contract parties (Party A/Party B or defined parties)
    const partyDefinitionPattern = /["']([A-Z][a-zA-Z\s&.,]+)["']\s+\((?:hereinafter|the)\s+["']?(\w+)["']?\)/gi;
    while ((match = partyDefinitionPattern.exec(text)) !== null) {
      const name = match[1].trim();

      if (!parties.some(p => p.name === name)) {
        parties.push({
          name,
          type: this.determinePartyType(name),
          position: match.index,
          context: this.getContext(text, match.index, 50),
        });
      }
    }

    return parties;
  }

  /**
   * Determine if party is person, organization, or government
   */
  private determinePartyType(name: string): 'person' | 'organization' | 'government' {
    // Check for organizational indicators
    const orgIndicators = [
      'inc', 'corp', 'corporation', 'llc', 'ltd', 'limited',
      'company', 'co.', 'partnership', 'associates', '&',
    ];

    const lowerName = name.toLowerCase();
    for (const indicator of orgIndicators) {
      if (lowerName.includes(indicator)) {
        return 'organization';
      }
    }

    // Check for government entities
    const govIndicators = [
      'united states', 'state of', 'city of', 'county of',
      'federal', 'government', 'department of', 'agency',
    ];

    for (const indicator of govIndicators) {
      if (lowerName.includes(indicator)) {
        return 'government';
      }
    }

    // Check if it looks like a person's name (2-3 words, title case)
    const words = name.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[A-Z]/.test(name)) {
      return 'person';
    }

    return 'organization'; // Default to organization
  }

  /**
   * Extract dates
   */
  private extractDates(text: string): DateEntity[] {
    const dates: DateEntity[] = [];

    // Various date formats
    const datePatterns = [
      {
        pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/g,
        type: 'general' as const,
      },
      {
        pattern: /\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g,
        type: 'general' as const,
      },
      {
        pattern: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
        type: 'general' as const,
      },
      {
        pattern: /\bfiled\s+(?:on\s+)?([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi,
        type: 'filing' as const,
      },
      {
        pattern: /\beffective\s+(?:date\s+)?([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi,
        type: 'effective' as const,
      },
      {
        pattern: /\bdeadline[:\s]+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi,
        type: 'deadline' as const,
      },
    ];

    for (const { pattern, type } of datePatterns) {
      let match: RegExpExecArray;
      while ((match = pattern.exec(text)) !== null) {
        const dateStr = match[1] || match[0];

        dates.push({
          date: dateStr,
          normalizedDate: this.parseDate(dateStr),
          type,
          position: match.index,
          context: this.getContext(text, match.index, 50),
        });
      }
    }

    return dates;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | undefined {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (error) {
      // Ignore parse errors
    }
    return undefined;
  }

  /**
   * Extract monetary amounts
   */
  private extractAmounts(text: string): AmountEntity[] {
    const amounts: AmountEntity[] = [];

    // Patterns for monetary amounts
    const amountPatterns = [
      {
        pattern: /\$\s?([\d,]+(?:\.\d{2})?)/g,
        currency: 'USD',
        type: 'general' as const,
      },
      {
        pattern: /damages?\s+(?:of|in\s+the\s+amount\s+of)?\s*\$\s?([\d,]+(?:\.\d{2})?)/gi,
        currency: 'USD',
        type: 'damages' as const,
      },
      {
        pattern: /settlement\s+(?:of|amount)?\s*\$\s?([\d,]+(?:\.\d{2})?)/gi,
        currency: 'USD',
        type: 'settlement' as const,
      },
      {
        pattern: /(?:attorney(?:'s)?\s+)?fees?\s+(?:of)?\s*\$\s?([\d,]+(?:\.\d{2})?)/gi,
        currency: 'USD',
        type: 'fee' as const,
      },
      {
        pattern: /rent\s+(?:of)?\s*\$\s?([\d,]+(?:\.\d{2})?)/gi,
        currency: 'USD',
        type: 'rent' as const,
      },
    ];

    for (const { pattern, currency, type } of amountPatterns) {
      let match: RegExpExecArray;
      while ((match = pattern.exec(text)) !== null) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);

        if (!isNaN(amount)) {
          amounts.push({
            amount,
            currency,
            type,
            position: match.index,
            context: this.getContext(text, match.index, 50),
          });
        }
      }
    }

    return amounts;
  }

  /**
   * Extract locations (courts, venues, etc.)
   */
  private extractLocations(text: string): LocationEntity[] {
    const locations: LocationEntity[] = [];

    // Court patterns
    const courtPattern = /(United States District Court|U\.S\. District Court|Circuit Court|Superior Court|Supreme Court)(?:\s+(?:for|of)\s+(?:the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*))?/gi;
    let match: RegExpExecArray;

    while ((match = courtPattern.exec(text)) !== null) {
      const court = match[0];
      const jurisdiction = match[2] || '';

      locations.push({
        location: court + (jurisdiction ? ' - ' + jurisdiction : ''),
        type: 'court',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    // Venue patterns
    const venuePattern = /venue\s+(?:is|in|shall\s+be)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi;
    while ((match = venuePattern.exec(text)) !== null) {
      locations.push({
        location: match[1],
        type: 'venue',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return locations;
  }

  /**
   * Extract case numbers
   */
  private extractCaseNumbers(text: string): CaseNumber[] {
    const caseNumbers: CaseNumber[] = [];

    // Various case number formats
    const caseNumberPatterns = [
      /Case\s+No\.?\s+(\d+[-:]\d+[-:][A-Z]+-[A-Z]+)/gi,
      /Docket\s+No\.?\s+([\dA-Z-]+)/gi,
      /Civil\s+Action\s+No\.?\s+([\dA-Z-]+)/gi,
      /Case\s+No\.?\s+([\dA-Z-]+)/gi,
    ];

    for (const pattern of caseNumberPatterns) {
      let match: RegExpExecArray;
      while ((match = pattern.exec(text)) !== null) {
        caseNumbers.push({
          caseNumber: match[1],
          position: match.index,
          context: this.getContext(text, match.index, 50),
        });
      }
    }

    return caseNumbers;
  }

  /**
   * Extract legal citations
   */
  private extractCitations(text: string): Citation[] {
    const citations: Citation[] = [];

    // U.S. Reports format: volume U.S. page (year)
    const usReportsPattern = /(\d+)\s+U\.S\.\s+(\d+)(?:\s+\((\d{4})\))?/g;
    let match: RegExpExecArray;

    while ((match = usReportsPattern.exec(text)) !== null) {
      citations.push({
        citation: match[0],
        volume: match[1],
        reporter: 'U.S.',
        page: match[2],
        year: match[3] ? parseInt(match[3]) : undefined,
        type: 'case',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    // Federal Reporter format: volume F.2d/F.3d page
    const fedReporterPattern = /(\d+)\s+(F\.2d|F\.3d|F\. Supp\.)\s+(\d+)/g;
    while ((match = fedReporterPattern.exec(text)) !== null) {
      citations.push({
        citation: match[0],
        volume: match[1],
        reporter: match[2],
        page: match[3],
        type: 'case',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    // Statute citations: Title U.S.C. § section
    const statutePattern = /(\d+)\s+U\.S\.C\.\s+§\s+(\d+)/g;
    while ((match = statutePattern.exec(text)) !== null) {
      citations.push({
        citation: match[0],
        volume: match[1],
        reporter: 'U.S.C.',
        page: match[2],
        type: 'statute',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return citations;
  }

  /**
   * Extract attorney information
   */
  private extractAttorneys(text: string): Attorney[] {
    const attorneys: Attorney[] = [];

    // Attorney pattern with bar number
    const attorneyPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+Esq\.?(?:\s+Bar\s+No\.?\s+(\d+))?/gi;
    let match: RegExpExecArray;

    while ((match = attorneyPattern.exec(text)) !== null) {
      attorneys.push({
        name: match[1],
        barNumber: match[2],
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    // Attorney of record pattern
    const attorneyOfRecordPattern = /Attorney\s+of\s+Record:\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi;
    while ((match = attorneyOfRecordPattern.exec(text)) !== null) {
      attorneys.push({
        name: match[1],
        role: 'attorney of record',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return attorneys;
  }

  /**
   * Extract judge information
   */
  private extractJudges(text: string): Judge[] {
    const judges: Judge[] = [];

    // Judge patterns
    const judgePatterns = [
      /(Judge|Justice|Hon\.|Honorable)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
      /Before:\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s+(?:Judge|Justice)/gi,
    ];

    for (const pattern of judgePatterns) {
      let match: RegExpExecArray;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[2] || match[1];
        const title = match[1] && match[2] ? match[1] : undefined;

        judges.push({
          name,
          title,
          position: match.index,
          context: this.getContext(text, match.index, 50),
        });
      }
    }

    return judges;
  }

  /**
   * Extract contract references
   */
  private extractContractReferences(text: string): ContractReference[] {
    const contracts: ContractReference[] = [];

    const contractPattern = /(Employment|Service|Lease|Purchase|Sales|Settlement)\s+Agreement/gi;
    let match: RegExpExecArray;

    while ((match = contractPattern.exec(text)) !== null) {
      contracts.push({
        type: match[1] + ' Agreement',
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return contracts;
  }

  /**
   * Extract statute and regulation references
   */
  private extractStatuteReferences(text: string): StatuteReference[] {
    const statutes: StatuteReference[] = [];

    // CFR references (Code of Federal Regulations)
    const cfrPattern = /(\d+)\s+C\.F\.R\.(?:\s+§)?\s+(\d+(?:\.\d+)?)/g;
    let match: RegExpExecArray;

    while ((match = cfrPattern.exec(text)) !== null) {
      statutes.push({
        title: `${match[1]} C.F.R.`,
        section: match[2],
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return statutes;
  }

  /**
   * Get context around a position in text
   */
  private getContext(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length);
    const end = Math.min(text.length, position + length);

    let context = text.substring(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }

  /**
   * Extract entities by category
   */
  async extractByCategory(
    text: string,
    category: keyof EntityExtractionResult,
  ): Promise<any[]> {
    const allEntities = await this.extractEntities(text);
    return allEntities[category];
  }

  /**
   * Search for specific entity mentions
   */
  findEntityMentions(text: string, entityName: string): Array<{ position: number; context: string }> {
    const mentions: Array<{ position: number; context: string }> = [];
    const regex = new RegExp(`\\b${entityName}\\b`, 'gi');
    let match: RegExpExecArray;

    while ((match = regex.exec(text)) !== null) {
      mentions.push({
        position: match.index,
        context: this.getContext(text, match.index, 50),
      });
    }

    return mentions;
  }
}
