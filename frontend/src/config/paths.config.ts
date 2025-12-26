/**
 * Application Route Paths Configuration
 * 
 * Centralized path definitions for all application routes.
 * These paths are used for navigation, routing, and module registration.
 */

export const PATHS = {
  DASHBOARD: 'dashboard',
  CASES: 'cases',
  CREATE_CASE: 'cases/create',
  CASE_MANAGEMENT: 'cases', // Primary case management
  MATTERS: 'cases', // Alias for backward compatibility
  
  // Case Management Enterprise Suite
  CASES_OVERVIEW: 'cases/overview',
  CASES_CALENDAR: 'cases/calendar-view',
  CASES_ANALYTICS: 'cases/analytics',
  CASES_INTAKE: 'cases/intake',
  CASES_OPERATIONS: 'cases/operations',
  CASES_INSIGHTS: 'cases/insights',
  CASES_FINANCIALS: 'cases/financials',
  
  // Legacy aliases for backward compatibility
  MATTERS_OVERVIEW: 'cases/overview',
  MATTERS_CALENDAR: 'cases/calendar-view',
  MATTERS_ANALYTICS: 'cases/analytics',
  MATTERS_INTAKE: 'cases/intake',
  MATTERS_OPERATIONS: 'cases/operations',
  MATTERS_INSIGHTS: 'cases/insights',
  MATTERS_FINANCIALS: 'cases/financials',
  
  DOCKET: 'docket',
  WORKFLOWS: 'workflows',
  MESSAGES: 'messages',
  DISCOVERY: 'discovery',
  EVIDENCE: 'evidence',
  EXHIBITS: 'exhibits',
  CORRESPONDENCE: 'correspondence',
  JURISDICTION: 'jurisdiction',
  ANALYTICS: 'analytics',
  CALENDAR: 'calendar',
  BILLING: 'billing',
  PRACTICE: 'practice',
  CRM: 'crm',
  DOCUMENTS: 'documents',
  DRAFTING: 'drafting',
  LIBRARY: 'library',
  CLAUSES: 'clauses',
  RESEARCH: 'research',
  CITATIONS: 'citations',
  COMPLIANCE: 'compliance',
  ADMIN: 'admin',
  WAR_ROOM: 'war_room',
  RULES_ENGINE: 'rules_engine',
  ENTITIES: 'entities',
  DATA_PLATFORM: 'data_platform',
  PROFILE: 'profile',
  DAF: 'daf',
  PLEADING_BUILDER: 'pleading_builder',
  LITIGATION_BUILDER: 'litigation_builder'
} as const;

export type AppPath = typeof PATHS[keyof typeof PATHS];
