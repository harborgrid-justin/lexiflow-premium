
import { MatterType, UserRole } from "../types.ts";

export interface SystemAssignment {
  practiceArea: MatterType;
  leadRole: UserRole;
  playbookId: string;
}

export const RulesEngine = {
  /**
   * Step 14: Apply jurisdiction-specific rules and map NOS codes to practice areas.
   */
  classifyPacerCase(nosCode: string): SystemAssignment {
    const nos = nosCode.substring(0, 3);
    
    // PACER NOS Code Mapping
    switch (nos) {
      case '110': // Insurance
      case '190': // Other Contract
        return { practiceArea: 'Litigation', leadRole: 'Senior Partner', playbookId: 'tpl-1' };
      
      case '820': // Copyright
      case '830': // Patent
      case '840': // Trademark
        return { practiceArea: 'IP', leadRole: 'Senior Partner', playbookId: 'tpl-1' };

      case '442': // Civil Rights: Jobs
      case '445': // Civil Rights: ADA
        return { practiceArea: 'Litigation', leadRole: 'Associate', playbookId: 'tpl-1' };

      case '160': // Stockholders Suits
        return { practiceArea: 'M&A', leadRole: 'Senior Partner', playbookId: 'tpl-5' };

      default:
        return { practiceArea: 'General', leadRole: 'Associate', playbookId: 'tpl-1' };
    }
  },

  calculateDeadlines(filingDate: string, ruleset: string): any[] {
    // Step 19: Automated deadline triggers based on Local Rules
    const base = new Date(filingDate);
    return [
      { id: 'dl-intake-1', title: 'Answer Due', date: new Date(base.getTime() + 21*86400000).toISOString().split('T')[0], ruleReference: 'FRCP 12(a)', status: 'Pending' },
      { id: 'dl-intake-2', title: 'Rule 26(f) Conference', date: new Date(base.getTime() + 30*86400000).toISOString().split('T')[0], ruleReference: 'FRCP 26(f)', status: 'Pending' }
    ];
  }
};
