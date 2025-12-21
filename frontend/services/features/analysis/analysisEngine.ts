/**
 * @module services/analysisEngine
 * @category Services - Analysis
 * @description Legal text analysis engine with citation extraction (reporters, code sections) and
 * conflict detection via party name nexus scanning. Uses high-performance regex patterns for
 * common reporter formats (e.g., 410 U.S. 113, 24 F.3d 100) and USC citations. Scans text against
 * indexed party names to detect potential conflicts or related matters.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Types
import { Citation, Party, Case } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface ExtractionResult {
  citations: string[];
  entities: string[];
  dates: string[];
}

export interface ConflictResult {
  entity: string;
  potentialMatches: { caseId: string; caseTitle: string; role: string }[];
  type?: 'client' | 'party' | 'position';
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// SERVICE
// ============================================================================
export const AnalysisEngine = {
  /**
   * Extracts legal citations using high-performance regex patterns.
   */
  extractCitations: (text: string): string[] => {
    // Regex for common reporters (e.g., 410 U.S. 113, 24 F.3d 100, Cal.Rptr.2d)
    const reporterRegex = /(\d+)\s+([a-zA-Z0-9\.\s]+?)\s+(\d+)/g;
    // Regex for codes (e.g., 11 U.S.C. § 362)
    const codeRegex = /(\d+)\s+U\.?S\.?C\.?(\s+§+\s+)?(\d+)/gi;
    
    const citations = new Set<string>();
    
    let match;
    while ((match = reporterRegex.exec(text)) !== null) {
        // Filter out common false positives (dates, currency)
        if (!match[2].match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|AM|PM/i)) {
             citations.add(match[0]);
        }
    }
    while ((match = codeRegex.exec(text)) !== null) {
        citations.add(match[0]);
    }

    return Array.from(citations);
  },

  /**
   * Scans text for internal party names to detect conflicts or related matters.
   */
  scanForInternalNexus: (text: string, allCases: Case[]): ConflictResult[] => {
      const results: ConflictResult[] = [];
      const partiesMap = new Map<string, { caseId: string; caseTitle: string; role: string }[]>();

      // Build Index
      allCases.forEach(c => {
          c.parties?.forEach(p => {
              const name = p.name.toLowerCase();
              if (!partiesMap.has(name)) partiesMap.set(name, []);
              partiesMap.get(name)?.push({ caseId: c.id, caseTitle: c.title, role: p.role });
          });
      });

      // Scan
      const lowerText = text.toLowerCase();
      partiesMap.forEach((matches, name) => {
          if (name.length > 4 && lowerText.includes(name)) {
              results.push({
                  entity: name, // Should map back to original casing in real implementation
                  potentialMatches: matches
              });
          }
      });

      return results;
  }
};

