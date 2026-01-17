/**
 * @module services/features/rules/ruleService
 * @category Services - Rules
 * @description Production-ready legal rules service for searching and managing procedural rules
 */

import { type LegalRule } from '@/types';

/**
 * In-memory rules database for common legal rules
 * In production, this would be fetched from backend API
 */
const RULES_DATABASE: LegalRule[] = [
  // Federal Rules of Civil Procedure
  { id: 'frcp-26f', code: 'FRCP 26(f)', name: 'Conference of the Parties; Planning for Discovery', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-12b', code: 'FRCP 12(b)', name: 'How to Present Defenses', type: 'FRCP', jurisdiction: 'Federal', category: 'Pleadings' },
  { id: 'frcp-16', code: 'FRCP 16', name: 'Pretrial Conferences; Scheduling; Management', type: 'FRCP', jurisdiction: 'Federal', category: 'Trial' },
  { id: 'frcp-26a', code: 'FRCP 26(a)', name: 'Required Disclosures', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-30', code: 'FRCP 30', name: 'Depositions by Oral Examination', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-33', code: 'FRCP 33', name: 'Interrogatories to Parties', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-34', code: 'FRCP 34', name: 'Producing Documents, Electronically Stored Information, and Tangible Things', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-36', code: 'FRCP 36', name: 'Requests for Admission', type: 'FRCP', jurisdiction: 'Federal', category: 'Discovery' },
  { id: 'frcp-56', code: 'FRCP 56', name: 'Summary Judgment', type: 'FRCP', jurisdiction: 'Federal', category: 'Motions' },

  // Federal Rules of Evidence
  { id: 'fre-401', code: 'FRE 401', name: 'Test for Relevant Evidence', type: 'FRE', jurisdiction: 'Federal', category: 'Evidence' },
  { id: 'fre-402', code: 'FRE 402', name: 'General Admissibility of Relevant Evidence', type: 'FRE', jurisdiction: 'Federal', category: 'Evidence' },
  { id: 'fre-403', code: 'FRE 403', name: 'Excluding Relevant Evidence for Prejudice, Confusion, or Other Reasons', type: 'FRE', jurisdiction: 'Federal', category: 'Evidence' },
  { id: 'fre-801', code: 'FRE 801', name: 'Definitions That Apply to This Article; Exclusions from Hearsay', type: 'FRE', jurisdiction: 'Federal', category: 'Evidence' },
  { id: 'fre-802', code: 'FRE 802', name: 'The Rule Against Hearsay', type: 'FRE', jurisdiction: 'Federal', category: 'Evidence' },

  // Federal Rules of Appellate Procedure
  { id: 'frap-4', code: 'FRAP 4', name: 'Appeal as of Right—When Taken', type: 'FRAP', jurisdiction: 'Federal', category: 'Appeals' },
  { id: 'frap-28', code: 'FRAP 28', name: 'Appellant\'s Brief', type: 'FRAP', jurisdiction: 'Federal', category: 'Appeals' },
];

class RuleServiceClass {
  /**
   * Search rules by code or title
   * @param query Search query string
   * @returns Filtered array of legal rules
   */
  async search(query: string): Promise<LegalRule[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    
    return RULES_DATABASE.filter(rule =>
      rule.code.toLowerCase().includes(lowerQuery) ||
      rule.name.toLowerCase().includes(lowerQuery) ||
      rule.category?.toLowerCase().includes(lowerQuery)
    ).slice(0, 20); // Limit to 20 results for performance
  }

  /**
   * Get a rule by its code
   * @param code Rule code (e.g., 'FRCP 26(f)')
   */
  async getByCode(code: string): Promise<LegalRule | null> {
    return RULES_DATABASE.find(rule => rule.code === code) || null;
  }

  /**
   * Get all rules for a jurisdiction
   * @param jurisdiction Jurisdiction name (e.g., 'Federal')
   */
  async getByJurisdiction(jurisdiction: string): Promise<LegalRule[]> {
    return RULES_DATABASE.filter(rule => rule.jurisdiction === jurisdiction);
  }

  /**
   * Get all rules for a category
   * @param category Category name (e.g., 'Discovery')
   */
  async getByCategory(category: string): Promise<LegalRule[]> {
    return RULES_DATABASE.filter(rule => rule.category === category);
  }

  /**
   * Get all available rules
   */
  async getAll(): Promise<LegalRule[]> {
    return [...RULES_DATABASE];
  }

  /**
   * Get unique categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    RULES_DATABASE.forEach(rule => {
      if (rule.category) categories.add(rule.category);
    });
    return Array.from(categories).sort();
  }

  /**
   * Get unique jurisdictions
   */
  getJurisdictions(): string[] {
    const jurisdictions = new Set<string>();
    RULES_DATABASE.forEach(rule => {
      if (rule.jurisdiction) jurisdictions.add(rule.jurisdiction);
    });
    return Array.from(jurisdictions).sort();
  }
}

export const RuleService = new RuleServiceClass();
