/**
 * @module services/features/deadlines/deadlineEngine
 * @category Services - Deadlines
 * @description Production-ready deadline calculation engine based on jurisdiction rules
 */

import { DocketEntry, DeadlineComputation } from '../../../types';

interface DeadlineRule {
  jurisdict: string;
  triggerText: string;
  daysToRespond: number;
  description: string;
}

/**
 * Common deadline rules for federal and state jurisdictions
 */
const DEADLINE_RULES: DeadlineRule[] = [
  { jurisdiction: 'Federal', triggerText: 'Motion to Dismiss', daysToRespond: 21, description: 'Response to Motion to Dismiss' },
  { jurisdiction: 'Federal', triggerText: 'Motion for Summary Judgment', daysToRespond: 21, description: 'Response to Motion for Summary Judgment' },
  { jurisdiction: 'Federal', triggerText: 'Discovery Request', daysToRespond: 30, description: 'Response to Discovery Request' },
  { jurisdiction: 'Federal', triggerText: 'Interrogatories', daysToRespond: 30, description: 'Response to Interrogatories' },
  { jurisdiction: 'Federal', triggerText: 'Request for Production', daysToRespond: 30, description: 'Response to Request for Production' },
  { jurisdiction: 'Federal', triggerText: 'Request for Admission', daysToRespond: 30, description: 'Response to Request for Admission' },
  { jurisdiction: 'Federal', triggerText: 'Notice of Deposition', daysToRespond: 14, description: 'Deposition Preparation Deadline' },
  { jurisdiction: 'Federal', triggerText: 'Appeal', daysToRespond: 30, description: 'Notice of Appeal Deadline' },
  { jurisdiction: 'Federal', triggerText: 'Order to Show Cause', daysToRespond: 14, description: 'Response to Order to Show Cause' },
  { jurisdiction: 'Federal', triggerText: 'Complaint', daysToRespond: 21, description: 'Answer to Complaint' },
  
  // California
  { jurisdiction: 'California', triggerText: 'Motion', daysToRespond: 9, description: 'Opposition to Motion (CA)' },
  { jurisdiction: 'California', triggerText: 'Discovery', daysToRespond: 30, description: 'Response to Discovery (CA)' },
  { jurisdiction: 'California', triggerText: 'Demurrer', daysToRespond: 30, description: 'Response to Demurrer (CA)' },
];

class DeadlineEngineClass {
  /**
   * Generate deadlines based on docket entry content and jurisdiction
   * @param entry Docket entry to analyze
   * @param jurisdiction Jurisdiction (e.g., 'Federal', 'California')
   * @returns Array of calculated deadlines
   */
  generateDeadlines(entry: DocketEntry, jurisdiction: string = 'Federal'): DeadlineComputation[] {
    const deadlines: DeadlineComputation[] = [];
    const entryDate = new Date(entry.filingDate || entry.eventDate || new Date());
    const titleLower = entry.title.toLowerCase();
    const descLower = (entry.description || '').toLowerCase();

    // Find matching rules
    const matchingRules = DEADLINE_RULES.filter(rule => {
      if (rule.jurisdiction !== jurisdiction) return false;
      
      const triggerLower = rule.triggerText.toLowerCase();
      return titleLower.includes(triggerLower) || descLower.includes(triggerLower);
    });

    // Generate deadline for each matching rule
    matchingRules.forEach(rule => {
      const dueDate = new Date(entryDate);
      dueDate.setDate(dueDate.getDate() + rule.daysToRespond);

      deadlines.push({
        id: `deadline-${entry.id}-${rule.daysToRespond}`,
        docketEntryId: entry.id,
        description: rule.description,
        dueDate: dueDate.toISOString().split('T')[0],
        jurisdiction,
        rule: rule.triggerText,
        daysFromTrigger: rule.daysToRespond,
        status: 'pending'
      });
    });

    return deadlines;
  }

  /**
   * Calculate deadline from a specific trigger date
   * @param triggerDate Starting date
   * @param days Number of days to add
   * @param excludeWeekends Whether to skip weekends
   */
  calculateDeadline(triggerDate: Date, days: number, excludeWeekends: boolean = false): Date {
    const result = new Date(triggerDate);
    
    if (!excludeWeekends) {
      result.setDate(result.getDate() + days);
      return result;
    }

    // Add business days only
    let daysAdded = 0;
    while (daysAdded < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        daysAdded++;
      }
    }

    return result;
  }

  /**
   * Get all available deadline rules for a jurisdiction
   * @param jurisdiction Jurisdiction name
   */
  getRulesForJurisdiction(jurisdiction: string): DeadlineRule[] {
    return DEADLINE_RULES.filter(rule => rule.jurisdiction === jurisdiction);
  }

  /**
   * Get all unique jurisdictions with rules
   */
  getAvailableJurisdictions(): string[] {
    const jurisdictions = new Set<string>();
    DEADLINE_RULES.forEach(rule => jurisdictions.add(rule.jurisdiction));
    return Array.from(jurisdictions).sort();
  }

  /**
   * Check if a deadline is approaching (within warning threshold)
   * @param deadlineDate Deadline date
   * @param warningDays Number of days before deadline to warn (default 7)
   */
  isApproaching(deadlineDate: string, warningDays: number = 7): boolean {
    const deadline = new Date(deadlineDate);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntil <= warningDays && daysUntil > 0;
  }

  /**
   * Check if a deadline has passed
   * @param deadlineDate Deadline date
   */
  isPast(deadlineDate: string): boolean {
    const deadline = new Date(deadlineDate);
    const now = new Date();
    return deadline < now;
  }
}

export const DeadlineEngine = new DeadlineEngineClass();
