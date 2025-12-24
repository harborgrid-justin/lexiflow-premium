/**
 * Legal Deadline Engine - Rule-based deadline calculation for docket entries
 * Production-grade deadline automation based on FRCP, FRAP, and local rules
 * 
 * @module services/features/legal/deadlineEngine
 * @description Comprehensive deadline calculation service providing:
 * - **Rule-based calculation** (FRCP, FRAP, local rules)
 * - **Pattern matching** (regex-based entry detection)
 * - **Business day calculation** (weekend exclusion)
 * - **Calendar day calculation** (all days included)
 * - **Jurisdiction support** (Federal, State, Both)
 * - **Multi-deadline generation** (multiple deadlines per entry)
 * - **Priority classification** (Critical, High, Normal)
 * - **Status tracking** (Upcoming, Due Soon, Overdue, Satisfied)
 * - **Batch processing** (generate deadlines for multiple entries)
 * - **Custom rules** (add firm-specific deadline rules)
 * 
 * @architecture
 * - Pattern: Rule Engine + Pattern Matcher
 * - Rules: Array of DeadlineRule objects with regex triggers
 * - Matching: Entry type + jurisdiction + title/description pattern
 * - Calculation: Business days (skip weekends) or calendar days
 * - Priority: Critical (< 7 days), High (7-30 days), Normal (> 30 days)
 * - Status: Real-time calculation based on today's date
 * - Extensibility: addRule() for custom firm rules
 * 
 * @rules
 * **Federal Rules Covered:**
 * - FRCP 4(m): Service deadline (90 days)
 * - FRCP 12(a)(1)(A): Answer due (21 days)
 * - FRCP 26(a)(1): Initial disclosures (14 business days)
 * - FRCP 26(a)(2): Expert disclosures (60 business days)
 * - FRCP 56(c): Summary judgment opposition (28 business days)
 * - FRAP 4(a)(1)(A): Notice of appeal (30 days)
 * - Local Rule 7.1: Motion opposition (21 business days)
 * - Local Rule 56.1: Summary judgment reply (42 business days)
 * 
 * **Entry Types:**
 * - Filing: Complaint, Motion, Brief
 * - Order: Discovery Order, Scheduling Order, Final Judgment
 * - Notice: Settlement Conference, Hearing Notice
 * 
 * **Pattern Triggers:**
 * - Complaint: /complaint/i → Answer (21 days), Service (90 days)
 * - Motion: /motion\s+(to|for)/i → Opposition (21 biz days), Reply (35 biz days)
 * - Summary Judgment: /motion\s+for\s+summary\s+judgment/i → Opposition (28 biz days)
 * - Discovery Order: /discovery\s+(order|schedule)/i → Fact cutoff (90 biz days)
 * - Final Judgment: /final\s+(judgment|order)/i → Notice of appeal (30 days)
 * - Scheduling Order: /scheduling\s+order/i → Amend pleadings (60 biz days)
 * 
 * @performance
 * - Rule matching: O(n*m) where n = rules, m = regex checks
 * - Business day calc: O(d) where d = days to add (iterates over days)
 * - Calendar day calc: O(1) - simple date arithmetic
 * - Batch processing: O(n*r) where n = entries, r = matching rules
 * - Sorting: O(n log n) for deadline list
 * 
 * @calculation
 * **Business Days:**
 * - Excludes: Saturdays (6), Sundays (0)
 * - Includes: Federal holidays NOT excluded (simplification)
 * - Algorithm: Iterate forward, skip weekends, decrement counter
 * 
 * **Calendar Days:**
 * - Includes: All days (weekends, holidays)
 * - Algorithm: Simple date addition
 * 
 * **Date Format:**
 * - Input: ISO 8601 (YYYY-MM-DD or full timestamp)
 * - Output: YYYY-MM-DD (local time zone)
 * 
 * @priority
 * **Priority Levels:**
 * - **Critical**: Statute of limitations, notice of appeal, answer deadlines
 * - **High**: Discovery cutoffs, expert disclosures, summary judgment opposition
 * - **Normal**: Reply briefs, non-dispositive motions
 * 
 * **Status Calculation:**
 * - Overdue: Deadline date < today
 * - Due Soon: 0 ≤ days until deadline ≤ 7
 * - Upcoming: Days until deadline > 7
 * - Satisfied: Manually marked complete
 * 
 * @usage
 * ```typescript
 * import { DeadlineEngine } from './deadlineEngine';
 * 
 * // Generate deadlines for complaint filing
 * const complaint: DocketEntry = {
 *   id: 'entry-123',
 *   caseId: 'case-456',
 *   type: 'Filing',
 *   title: 'Complaint for Breach of Contract',
 *   date: '2025-01-15',
 *   description: 'Plaintiff files complaint'
 * };
 * 
 * const deadlines = DeadlineEngine.generateDeadlines(complaint, 'Federal');
 * deadlines.forEach(d => {
 *   console.log(`${d.title}: ${d.date} (${d.priority})`);
 *   console.log(`  ${d.description} - ${d.ruleReference}`);
 * });
 * // Output:
 * // Answer Due: 2025-02-05 (Critical)
 * //   Defendant must file answer or motion - FRCP 12(a)(1)(A)
 * // Service Deadline: 2025-04-15 (Critical)
 * //   Complete service on all defendants - FRCP 4(m)
 * 
 * // Batch generate for multiple entries
 * const allDeadlines = DeadlineEngine.generateBatchDeadlines(docketEntries, 'Federal');
 * const sortedByPriority = allDeadlines.filter(d => d.priority === 'Critical');
 * 
 * // Check deadline status
 * const status = DeadlineEngine.calculateDeadlineStatus(deadlines[0]);
 * // Returns: 'Upcoming' | 'Due Soon' | 'Overdue' | 'Satisfied'
 * 
 * // Add custom firm rule
 * DeadlineEngine.addRule({
 *   entryType: 'Filing',
 *   triggerPattern: /mediation\s+statement/i,
 *   jurisdiction: 'Both',
 *   deadlines: [{
 *     title: 'Mediation Statement Due',
 *     daysFromFiling: 10,
 *     businessDaysOnly: true,
 *     description: 'File mediation statement per firm policy',
 *     priority: 'High',
 *     ruleReference: 'Firm Policy'
 *   }]
 * });
 * ```
 * 
 * @data_structures
 * **DeadlineRule:**
 * ```typescript
 * {
 *   entryType: 'Filing' | 'Order' | 'Notice',  // Docket entry type
 *   triggerPattern?: RegExp,                    // Pattern to match title/description
 *   jurisdiction: 'Federal' | 'State' | 'Both', // Applicable jurisdiction
 *   deadlines: DeadlineDefinition[]             // Array of deadlines to generate
 * }
 * ```
 * 
 * **DeadlineDefinition:**
 * ```typescript
 * {
 *   title: string,                              // Deadline name
 *   daysFromFiling: number,                     // Days to add to entry date
 *   businessDaysOnly?: boolean,                 // Exclude weekends (default: false)
 *   description: string,                        // What to do
 *   priority: 'Critical' | 'High' | 'Normal',   // Urgency level
 *   ruleReference?: string                      // Rule citation (e.g., 'FRCP 12(a)')
 * }
 * ```
 * 
 * **GeneratedDeadline:**
 * ```typescript
 * {
 *   id: string,                                 // Unique deadline ID
 *   title: string,                              // Deadline name
 *   date: string,                               // YYYY-MM-DD
 *   docketEntryId: string,                      // Source entry ID
 *   caseId: string,                             // Case ID
 *   status: 'Pending' | 'Satisfied',           // Completion status
 *   priority: 'Critical' | 'High' | 'Normal',   // Urgency level
 *   description: string,                        // Instructions
 *   ruleReference?: string                      // Rule citation
 * }
 * ```
 * 
 * @integration
 * - Docket Module: Auto-generate deadlines on entry creation
 * - Calendar: Display deadlines with color-coded priority
 * - Notifications: Alert users 7 days before critical deadlines
 * - Task Management: Create tasks from deadline definitions
 * - Compliance: Track adherence to court rules
 * - Analytics: Measure on-time deadline compliance rate
 * 
 * @testing
 * **Test Coverage:**
 * - Business day calculation: Weekend skipping, multi-week spans
 * - Calendar day calculation: Month boundaries, leap years
 * - Pattern matching: All rule triggers, false positives/negatives
 * - Jurisdiction filtering: Federal-only, State-only, Both
 * - Priority assignment: Critical vs High vs Normal
 * - Status calculation: Overdue, Due Soon, Upcoming, Satisfied
 * - Batch processing: Multiple entries, sorting by date
 * - Custom rules: addRule() integration
 * 
 * @limitations
 * - No federal holiday calendar (treats holidays as business days)
 * - No state-specific rules (generic State jurisdiction)
 * - No local court rules (only common local rules)
 * - No extension requests (assumes original deadlines)
 * - No time zone handling (uses local browser time)
 * - No conflict resolution (multiple rules = multiple deadlines)
 * 
 * @future
 * - Federal holiday calendar: Exclude federal holidays from business days
 * - State rules: California, New York, Texas-specific rules
 * - Local rules: Configurable by court district
 * - Extension tracking: Modify deadlines based on granted extensions
 * - Time zone: Store deadlines in UTC, display in local time
 * - Machine learning: Learn deadline patterns from historical data
 * - Conflict resolution: Dedupe similar deadlines from multiple rules
 * - Notification integration: Auto-schedule reminders
 */

import { DocketEntry, DocketEntryType } from '@/types';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Deadline rule definition with pattern matching
 */
export interface DeadlineRule {
  entryType: DocketEntryType;
  triggerPattern?: RegExp;  // Match title/description
  jurisdiction: 'Federal' | 'State' | 'Both';
  deadlines: DeadlineDefinition[];
}

/**
 * Individual deadline specification
 */
export interface DeadlineDefinition {
  title: string;
  daysFromFiling: number;
  businessDaysOnly?: boolean;
  description: string;
  priority: 'Critical' | 'High' | 'Normal';
  ruleReference?: string;  // E.g., "FRCP 26(a)(1)"
}

/**
 * Generated deadline with computed date
 */
export interface GeneratedDeadline {
  id: string;
  title: string;
  date: string;  // YYYY-MM-DD
  docketEntryId: string;
  caseId: string;
  status: 'Pending' | 'Satisfied';
  priority: 'Critical' | 'High' | 'Normal';
  description: string;
  ruleReference?: string;
}

// =============================================================================
// DEADLINE RULES REGISTRY (Private)
// =============================================================================

/**
 * Pre-defined deadline rules for Federal and State courts
 * @private
 */
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

// =============================================================================
// UTILITY FUNCTIONS (Private)
// =============================================================================

/**
 * Calculate business days (excluding weekends)
 * @private
 */
function addBusinessDays(startDate: Date, days: number): Date {
  const current = new Date(startDate);
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
 * @private
 */
function addCalendarDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to YYYY-MM-DD
 * @private
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate unique deadline ID
 * @private
 */
function generateDeadlineId(entryId: string, index: number): string {
  return `deadline-${entryId}-${index}-${Date.now()}`;
}

// =============================================================================
// DEADLINE ENGINE
// =============================================================================

/**
 * DeadlineEngine
 * Provides rule-based deadline calculation for docket entries
 */
export const DeadlineEngine = {
  /**
   * Generate deadlines for a docket entry
   */
  generateDeadlines(entry: DocketEntry, jurisdiction: 'Federal' | 'State' = 'Federal'): GeneratedDeadline[] {
    const deadlines: GeneratedDeadline[] = [];
    const entryDate = new Date(entry.date || entry.entryDate || entry.dateFiled);
    
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

