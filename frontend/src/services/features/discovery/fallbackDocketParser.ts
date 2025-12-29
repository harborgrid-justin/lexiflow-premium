/**
 * @module services/fallbackDocketParser
 * @category Services - Docket
 * @description Client-side regex-based docket parser as fallback when AI services fail
 * Provides basic parsing with quality indicators
 */

import { DocketEntry, DocketEntryType, Case, Party, CaseId, PartyId, DocketId, MatterType } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FallbackParseResult {
  caseInfo: Partial<Case>;
  parties: Party[];
  docketEntries: DocketEntry[];
  quality: 'Low' | 'Medium' | 'High';
  confidence: number; // 0-100
  warnings: string[];
}

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const PATTERNS = {
  // Case number patterns
  caseNumber: /(?:Case No\.|Case Number:|No\.)\s*([A-Z0-9:-]+)/i,
  
  // Date patterns (various formats)
  date: /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/,
  
  // Docket entry line patterns
  docketLine: /^(\d+)\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.+)$/m,
  
  // Entry type indicators
  motion: /\b(motion|move[ds]?)\s+(to|for)\b/i,
  order: /\b(order|ordered)\b/i,
  notice: /\b(notice|notified)\b/i,
  filing: /\b(filed?|filing)\b/i,
  
  // Party patterns
  plaintiff: /plaintiff[s]?:\s*([^\n]+)/i,
  defendant: /defendant[s]?:\s*([^\n]+)/i,
  
  // Attorney patterns
  attorney: /(?:attorney|counsel)(?:\s+for)?:\s*([^\n]+)/i,
  
  // Court patterns
  court: /(?:in\s+the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:District\s+)?Court/i
};

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Normalize date to YYYY-MM-DD format
 */
function normalizeDate(dateStr: string): string {
  try {
    // Try parsing various formats
    let date: Date;
    
    if (dateStr.includes('-') && dateStr.length === 10) {
      // Already in YYYY-MM-DD
      return dateStr;
    }
    
    // Try MM/DD/YYYY or MM-DD-YYYY
    const parts = dateStr.split(/[/-]/);
    if (parts.length === 3) {
      const [first, second, third] = parts;
      
      // Determine if format is MM/DD/YYYY or DD/MM/YYYY (assume US format)
      if (third.length === 4) {
        // MM/DD/YYYY
        date = new Date(parseInt(third), parseInt(first) - 1, parseInt(second));
      } else if (first.length === 4) {
        // YYYY/MM/DD
        date = new Date(parseInt(first), parseInt(second) - 1, parseInt(third));
      } else {
        // Two-digit year, assume MM/DD/YY
        const year = parseInt(third) + (parseInt(third) < 50 ? 2000 : 1900);
        date = new Date(year, parseInt(first) - 1, parseInt(second));
      }
      
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    // Fallback: use Date constructor
    date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Date normalization failed:', dateStr, e);
  }
  
  // Return current date as fallback
  return new Date().toISOString().split('T')[0];
}

/**
 * Determine entry type from text
 */
function determineEntryType(text: string): DocketEntryType {
  const lower = text.toLowerCase();
  
  if (PATTERNS.order.test(lower)) return 'Order';
  if (PATTERNS.motion.test(lower)) return 'Motion';
  if (PATTERNS.notice.test(lower)) return 'Notice';
  if (lower.includes('minute entry')) return 'Minute Entry';
  if (lower.includes('exhibit')) return 'Exhibit';
  if (lower.includes('hearing')) return 'Hearing';
  
  return 'Filing'; // Default
}

/**
 * Extract case information
 */
function extractCaseInfo(text: string): { caseInfo: Partial<Case>; confidence: number } {
  const info: Partial<Case> = {};
  let confidence = 0;
  
  // Extract case number
  const caseNumMatch = text.match(PATTERNS.caseNumber);
  if (caseNumMatch) {
    info.id = caseNumMatch[1].trim() as CaseId;
    info.title = `Case ${caseNumMatch[1].trim()}`;
    confidence += 30;
  }
  
  // Extract court
  const courtMatch = text.match(PATTERNS.court);
  if (courtMatch) {
    info.court = courtMatch[1].trim();
    confidence += 20;
  }
  
  // Default values
  if (!info.id) {
    info.id = `CASE-${Date.now()}` as CaseId;
    info.title = 'Imported Case (No Number Found)';
  }
  
  info.status = 'Discovery' as Record<string, unknown>;
  info.matterType = MatterType.LITIGATION;
  info.jurisdiction = info.court?.toLowerCase().includes('federal') ? 'Federal' : 'State';
  info.filingDate = new Date().toISOString().split('T')[0];
  
  return { caseInfo: info, confidence };
}

/**
 * Extract parties
 */
function extractParties(text: string, caseId: CaseId): { parties: Party[]; confidence: number } {
  const parties: Party[] = [];
  let confidence = 0;

  // Extract plaintiff
  const plaintiffMatch = text.match(PATTERNS.plaintiff);
  if (plaintiffMatch) {
    const names = plaintiffMatch[1].split(/,|\band\b/).map(n => n.trim());
    names.forEach((name, idx) => {
      if (name) {
        parties.push({
          id: `plaintiff-${idx}` as PartyId,
          caseId: caseId,
          name: name,
          role: 'Plaintiff',
          type: name.toLowerCase().includes('inc') || name.toLowerCase().includes('corp') ? 'Corporation' : 'Individual',
          contact: ''
        });
      }
    });
    confidence += 40;
  }

  // Extract defendant
  const defendantMatch = text.match(PATTERNS.defendant);
  if (defendantMatch) {
    const names = defendantMatch[1].split(/,|\band\b/).map(n => n.trim());
    names.forEach((name, idx) => {
      if (name) {
        parties.push({
          id: `defendant-${idx}` as PartyId,
          caseId: caseId,
          name: name,
          role: 'Defendant',
          type: name.toLowerCase().includes('inc') || name.toLowerCase().includes('corp') ? 'Corporation' : 'Individual',
          contact: ''
        });
      }
    });
    confidence += 40;
  }

  return { parties, confidence };
}

/**
 * Extract docket entries
 */
function extractDocketEntries(text: string, caseId: CaseId): { entries: DocketEntry[]; confidence: number } {
  const entries: DocketEntry[] = [];
  let confidence = 0;
  
  // Split text into lines
  const lines = text.split('\n');
  
  let entryNumber = 1;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Try to match docket line pattern: "1  01/15/2024  Motion to Dismiss filed by..."
    const match = trimmed.match(PATTERNS.docketLine);
    if (match) {
      const [, seqStr, dateStr, description] = match;
      const normalizedDate = normalizeDate(dateStr);

      entries.push({
        id: `dk-fallback-${Date.now()}-${entryNumber}` as DocketId,
        sequenceNumber: parseInt(seqStr) || entryNumber,
        caseId: caseId,
        date: normalizedDate,
        dateFiled: normalizedDate,
        entryDate: normalizedDate,
        type: determineEntryType(description),
        title: description.substring(0, 100),
        description: description,
        filedBy: 'Unknown',
        isSealed: false
      });

      entryNumber++;
      confidence += 5;
    } else {
      // Try loose matching: any line with a date
      const dateMatch = trimmed.match(PATTERNS.date);
      if (dateMatch && trimmed.length > 20) {
        const normalizedDate = normalizeDate(dateMatch[1]);

        entries.push({
          id: `dk-fallback-${Date.now()}-${entryNumber}` as DocketId,
          sequenceNumber: entryNumber,
          caseId: caseId,
          date: normalizedDate,
          dateFiled: normalizedDate,
          entryDate: normalizedDate,
          type: determineEntryType(trimmed),
          title: trimmed.substring(0, 100),
          description: trimmed,
          filedBy: 'Unknown',
          isSealed: false
        });

        entryNumber++;
        confidence += 2;
      }
    }
  }
  
  return { entries, confidence: Math.min(confidence, 100) };
}

// ============================================================================
// MAIN PARSER
// ============================================================================

export const FallbackDocketParser = {
  /**
   * Parse docket text using regex patterns
   */
  parse(text: string): FallbackParseResult {
    const warnings: string[] = [];
    
    if (!text || text.trim().length < 50) {
      warnings.push('Input text is too short for reliable parsing');
    }
    
    // Extract case info
    const { caseInfo, confidence: caseConfidence } = extractCaseInfo(text);

    // Extract parties
    const { parties, confidence: partiesConfidence } = extractParties(text, caseInfo.id!);
    if (parties.length === 0) {
      warnings.push('No parties found - may need manual entry');
    }

    // Extract docket entries
    const { entries, confidence: entriesConfidence } = extractDocketEntries(text, caseInfo.id!);
    if (entries.length === 0) {
      warnings.push('No docket entries found - check input format');
    }
    
    // Calculate overall confidence
    const totalConfidence = (caseConfidence + partiesConfidence + entriesConfidence) / 3;
    
    // Determine quality level
    let quality: 'Low' | 'Medium' | 'High';
    if (totalConfidence >= 70) quality = 'High';
    else if (totalConfidence >= 40) quality = 'Medium';
    else quality = 'Low';
    
    if (quality === 'Low') {
      warnings.push('Low confidence parse - recommend manual review');
    }
    
    return {
      caseInfo,
      parties,
      docketEntries: entries,
      quality,
      confidence: Math.round(totalConfidence),
      warnings
    };
  },
  
  /**
   * Validate parsed result
   */
  validateResult(result: FallbackParseResult): boolean {
    return (
        result.caseInfo.id &&
        result.docketEntries.length > 0
    );
  }
};

