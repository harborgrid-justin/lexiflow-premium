/**
 * Application Route Paths Configuration
 * 
 * Centralized path definitions for all application routes.
 * These paths are used for navigation, routing, and module registration.
 */

export const PATHS = {
  DASHBOARD: 'dashboard',
  CASES: 'cases',
  MATTERS: 'matters',
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
  PLEADING_BUILDER: 'pleading_builder',
  LITIGATION_BUILDER: 'litigation_builder'
} as const;

export type AppPath = typeof PATHS[keyof typeof PATHS];
