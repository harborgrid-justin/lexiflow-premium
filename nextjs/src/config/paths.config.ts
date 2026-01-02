/**
 * Application Route Paths Configuration
 *
 * Centralized path definitions for all application routes.
 * These paths are used for navigation, routing, and module registration.
 */

export const PATHS = {
  DASHBOARD: "case-overview",
  CASES: "cases",
  CREATE_CASE: "cases/create",
  CASE_MANAGEMENT: "cases", // Primary case management
  MATTERS: "cases", // Alias for backward compatibility

  // Case Management Enterprise Suite
  CASES_OVERVIEW: "case-overview",
  CASES_CALENDAR: "case-calendar",
  CASES_ANALYTICS: "case-analytics",
  CASES_INTAKE: "case-intake",
  CASES_OPERATIONS: "case-operations",
  CASES_INSIGHTS: "case-insights",
  CASES_FINANCIALS: "case-financials",

  // Legacy aliases for backward compatibility
  MATTERS_OVERVIEW: "case-overview",
  MATTERS_CALENDAR: "case-calendar",
  MATTERS_ANALYTICS: "case-analytics",
  MATTERS_INTAKE: "case-intake",
  MATTERS_OPERATIONS: "case-operations",
  MATTERS_INSIGHTS: "case-insights",
  MATTERS_FINANCIALS: "case-financials",

  DOCKET: "docket",
  WORKFLOWS: "workflows",
  MESSAGES: "messenger",
  DISCOVERY: "discovery",
  EVIDENCE: "evidence",
  EXHIBITS: "exhibits",
  CORRESPONDENCE: "correspondence",
  JURISDICTION: "jurisdiction",
  ANALYTICS: "analytics",
  CALENDAR: "case-calendar",
  BILLING: "billing",
  PRACTICE: "firm-operations",
  CRM: "crm",
  DOCUMENTS: "documents",
  DRAFTING: "drafting",
  LIBRARY: "knowledge-base",
  CLAUSES: "clauses",
  RESEARCH: "research",
  CITATIONS: "citations",
  COMPLIANCE: "compliance",
  ADMIN: "admin",
  WAR_ROOM: "war-room",
  RULES_ENGINE: "rules",
  ENTITIES: "entity-director",
  DATA_PLATFORM: "database-control",
  PROFILE: "profile",
  DAF: "daf",
  PLEADING_BUILDER: "pleadings",
  LITIGATION_BUILDER: "litigation-strategy",

  // Real Estate Division
  // REAL_ESTATE: "real_estate",
  // RE_PORTFOLIO_SUMMARY: "real_estate/portfolio_summary",
  // RE_INVENTORY: "real_estate/inventory",
  // RE_UTILIZATION: "real_estate/utilization",
  // RE_OUTGRANTS: "real_estate/outgrants",
  // RE_SOLICITATIONS: "real_estate/solicitations",
  // RE_RELOCATION: "real_estate/relocation",
  // RE_COST_SHARE: "real_estate/cost_share",
  // RE_DISPOSAL: "real_estate/disposal",
  // RE_ACQUISITION: "real_estate/acquisition",
  // RE_ENCROACHMENT: "real_estate/encroachment",
  // RE_USER_MGMT: "real_estate/user_management",
  // RE_AUDIT: "real_estate/audit_readiness",
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
