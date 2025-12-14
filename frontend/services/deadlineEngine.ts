/**
 * @module services/deadlineEngine
 * @category Services - Docket
 * @description Rule-based deadline calculation engine for docket entries based on
 * entry type, jurisdiction, and federal/state court rules
 */

import { DocketEntry, DocketEntryType } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DeadlineRule {
  entryType: DocketEntryType;
  triggerPattern?: RegExp; // Match title/description
  jurisdiction: 'Federal' | 'State' | 'Both';
  deadlines: DeadlineDefinition[];
}

export interface DeadlineDefinition {
  title: string;
  daysFromFiling: number;
  businessDaysOnly?: boolean;
  description: string;
  priority: 'Critical' | 'High' | 'Normal';
  ruleReference?: string; // E.g., "FRCP 26(a)(1)"
}

export interface GeneratedDeadline {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  docketEntryId: string;
  caseId: string;
  status: 'Pending' | 'Satisfied';
  priority: 'Critical' | 'High' | 'Normal';
  description: string;
  ruleReference?: string;
}

// ============================================================================
// DEADLINE RULES REGISTRY
// ============================================================================

const DEADLINE_RULES: DeadlineRule[] = [
  // Discovery Deadlines (Federal)
  {
    entryType: 'Filing',
    triggerPattern: /initial\s+disclosures?/i,
    jurisdiction: 'Federal',
    deadlines: [
      {
        title: 'Initial Disclosures Due',
        daysFromFiling: 14,
        businessDaysOnly: true,
        description: 'Parties must exchange initial disclosures',
        priority: 'High',
        ruleReference: 'FRCP 26(a)(1)'
      }
    ]
  },
  {
    entryType: 'Order',
    triggerPattern: /discovery\s+(order|schedule)/i,
    jurisdiction: 'Federal',
    deadlines: [
      {
        title: 'Fact Discovery Cutoff',
        daysFromFiling: 90,
        businessDaysOnly: true,
        description: 'Complete all fact discovery',
        priority: 'Critical',
        ruleReference: 'Court Order'
      },
      {
        title: 'Expert Disclosures Due',
        daysFromFiling: 60,
        businessDaysOnly: true,
        description: 'Disclose expert witnesses',
        priority: 'High',
        ruleReference: 'FRCP 26(a)(2)'
      }
    ]
  },
  
  // Motion Deadlines (Federal)
  {
    entryType: 'Filing',
    triggerPattern: /motion\s+(to|for)/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Opposition Brief Due',
        daysFromFiling: 21,
        businessDaysOnly: true,
        description: 'Opposing party must file response',
        priority: 'High',
        ruleReference: 'Local Rule 7.1'
      },
      {
        title: 'Reply Brief Due',
        daysFromFiling: 35,
        businessDaysOnly: true,
        description: 'Moving party may file reply',
        priority: 'Normal',
        ruleReference: 'Local Rule 7.1'
      }
    ]
  },
  
  // Complaint Filing Deadlines
  {
    entryType: 'Filing',
    triggerPattern: /complaint/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Answer Due',
        daysFromFiling: 21,
        businessDaysOnly: false,
        description: 'Defendant must file answer or motion',
        priority: 'Critical',
        ruleReference: 'FRCP 12(a)(1)(A)'
      },
      {
        title: 'Service Deadline',
        daysFromFiling: 90,
        businessDaysOnly: false,
        description: 'Complete service on all defendants',
        priority: 'Critical',
        ruleReference: 'FRCP 4(m)'
      }
    ]
  },
  
  // Scheduling Order Deadlines
  {
    entryType: 'Order',
    triggerPattern: /scheduling\s+order/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Amend Pleadings Deadline',
        daysFromFiling: 60,
        businessDaysOnly: true,
        description: 'Last day to amend pleadings as of right',
        priority: 'High',
        ruleReference: 'Court Order'
      },
      {
        title: 'Join Parties Deadline',
        daysFromFiling: 60,
        businessDaysOnly: true,
        description: 'Last day to join additional parties',
        priority: 'High',
        ruleReference: 'Court Order'
      }
    ]
  },
  
  // Summary Judgment Deadlines
  {
    entryType: 'Filing',
    triggerPattern: /motion\s+for\s+summary\s+judgment/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Summary Judgment Opposition',
        daysFromFiling: 28,
        businessDaysOnly: true,
        description: 'File opposition to summary judgment',
        priority: 'Critical',
        ruleReference: 'FRCP 56(c)'
      },
      {
        title: 'Summary Judgment Reply',
        daysFromFiling: 42,
        businessDaysOnly: true,
        description: 'File reply brief',
        priority: 'High',
        ruleReference: 'Local Rule 56.1'
      }
    ]
  },
  
  // Orders Requiring Response
  {
    entryType: 'Order',
    triggerPattern: /\b(respond|response|reply)\b/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Response to Order Due',
        daysFromFiling: 21,
        businessDaysOnly: true,
        description: 'Comply with court order requiring response',
        priority: 'High',
        ruleReference: 'Court Order'
      }
    ]
  },
  
  // Appeal Deadlines
  {
    entryType: 'Order',
    triggerPattern: /final\s+(judgment|order)/i,
    jurisdiction: 'Federal',
    deadlines: [
      {
        title: 'Notice of Appeal Due',
        daysFromFiling: 30,
        businessDaysOnly: false,
        description: 'File notice of appeal',
        priority: 'Critical',
        ruleReference: 'FRAP 4(a)(1)(A)'
      }
    ]
  },
  
  // Settlement Conference
  {
    entryType: 'Notice',
    triggerPattern: /settlement\s+conference/i,
    jurisdiction: 'Both',
    deadlines: [
      {
        title: 'Settlement Conference Date',
        daysFromFiling: 0,
        businessDaysOnly: false,
        description: 'Attend settlement conference',
        priority: 'Critical',
        ruleReference: 'Court Notice'
      }
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate business days (excluding weekends)
 */
function addBusinessDays(startDate: Date, days: number): Date {
  let current = new Date(startDate);
  let remaining = days;
  
  while (remaining > 0) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--;
    }
  }
  
  return current;
}

/**
 * Calculate calendar days
 */
function addCalendarDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate unique deadline ID
 */
function generateDeadlineId(entryId: string, index: number): string {
  return `deadline-${entryId}-${index}-${Date.now()}`;
}

// ============================================================================
// DEADLINE ENGINE
// ============================================================================

export const DeadlineEngine = {
  /**
   * Generate deadlines for a docket entry
   */
  generateDeadlines(entry: DocketEntry, jurisdiction: 'Federal' | 'State' = 'Federal'): GeneratedDeadline[] {
    const deadlines: GeneratedDeadline[] = [];
    const entryDate = new Date(entry.date);
    
    // Find matching rules
    const matchingRules = DEADLINE_RULES.filter(rule => {
      // Check entry type
      if (rule.entryType !== entry.type) return false;
      
      // Check jurisdiction
      if (rule.jurisdiction !== 'Both' && rule.jurisdiction !== jurisdiction) return false;
      
      // Check trigger pattern if specified
      if (rule.triggerPattern) {
        const searchText = `${entry.title} ${entry.description || ''}`;
        if (!rule.triggerPattern.test(searchText)) return false;
      }
      
      return true;
    });
    
    // Generate deadlines from matching rules
    matchingRules.forEach((rule, ruleIndex) => {
      rule.deadlines.forEach((def, defIndex) => {
        const deadlineDate = def.businessDaysOnly
          ? addBusinessDays(entryDate, def.daysFromFiling)
          : addCalendarDays(entryDate, def.daysFromFiling);
        
        deadlines.push({
          id: generateDeadlineId(entry.id, ruleIndex * 100 + defIndex),
          title: def.title,
          date: formatDate(deadlineDate),
          docketEntryId: entry.id,
          caseId: entry.caseId,
          status: 'Pending',
          priority: def.priority,
          description: def.description,
          ruleReference: def.ruleReference
        });
      });
    });
    
    return deadlines;
  },
  
  /**
   * Get all deadline rules
   */
  getRules(): DeadlineRule[] {
    return [...DEADLINE_RULES];
  },
  
  /**
   * Add custom deadline rule
   */
  addRule(rule: DeadlineRule): void {
    DEADLINE_RULES.push(rule);
  },
  
  /**
   * Calculate deadline status
   */
  calculateDeadlineStatus(deadline: GeneratedDeadline): 'Upcoming' | 'Due Soon' | 'Overdue' | 'Satisfied' {
    if (deadline.status === 'Satisfied') return 'Satisfied';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadlineDate = new Date(deadline.date);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) return 'Overdue';
    if (daysUntilDeadline <= 7) return 'Due Soon';
    return 'Upcoming';
  },
  
  /**
   * Get deadlines for multiple entries
   */
  generateBatchDeadlines(entries: DocketEntry[], jurisdiction: 'Federal' | 'State' = 'Federal'): GeneratedDeadline[] {
    const allDeadlines: GeneratedDeadline[] = [];
    
    for (const entry of entries) {
      const entryDeadlines = this.generateDeadlines(entry, jurisdiction);
      allDeadlines.push(...entryDeadlines);
    }
    
    // Sort by date
    return allDeadlines.sort((a, b) => a.date.localeCompare(b.date));
  }
};
