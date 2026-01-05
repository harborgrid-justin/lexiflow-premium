/**
 * Litigation Domain Filter Types
 * Centralized filter interfaces for litigation API services
 */

// Case Team Filters
export interface CaseTeamFilters {
  caseId?: string;
  userId?: string;
  role?: 'lead_attorney' | 'associate' | 'paralegal' | 'legal_assistant' | 'consultant' | 'expert' | 'support';
  isActive?: boolean;
}

// Case Phase Filters
export interface CasePhaseFilters {
  caseId?: string;
  phaseName?: 'investigation' | 'pleadings' | 'discovery' | 'motion_practice' | 'settlement' | 'trial_prep' | 'trial' | 'post_trial' | 'appeal';
  status?: 'not_started' | 'in_progress' | 'completed' | 'skipped';
}

// Pleading Filters
export interface PleadingFilters {
  caseId?: string;
  type?: 'complaint' | 'answer' | 'reply' | 'counterclaim' | 'cross_claim' | 'amended_complaint' | 'amended_answer';
  status?: 'draft' | 'filed' | 'served' | 'responded' | 'withdrawn';
}

// Motion Filters
export interface MotionFilters {
  caseId?: string;
  type?: string;
  status?: 'draft' | 'filed' | 'pending' | 'granted' | 'denied' | 'withdrawn';
}

// Party Filters
export interface PartyFilters {
  caseId?: string;
  type?: string;
  role?: string;
}

// Matter Filters
export interface MatterFilters {
  status?: string;
  clientId?: string;
  leadAttorneyId?: string;
  practiceArea?: string;
  search?: string;
}
