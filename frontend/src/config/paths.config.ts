/**
 * Application Route Paths Configuration
 *
 * Centralized path definitions for all application routes.
 * These paths are used for navigation, routing, and module registration.
 */

export const PATHS = {
  DASHBOARD: "dashboard",
  CASES: "cases",
  CREATE_CASE: "cases/create",
  CASE_MANAGEMENT: "cases", // Primary case management
  MATTERS: "cases", // Alias for backward compatibility

  // Case Management Enterprise Suite
  CASES_OVERVIEW: "cases/overview",
  CASES_CALENDAR: "cases/calendar-view",
  CASES_ANALYTICS: "cases/analytics",
  CASES_INTAKE: "cases/intake",
  CASES_OPERATIONS: "cases/operations",
  CASES_INSIGHTS: "cases/insights",
  CASES_FINANCIALS: "cases/financials",

  // Legacy aliases for backward compatibility
  MATTERS_OVERVIEW: "cases/overview",
  MATTERS_CALENDAR: "cases/calendar-view",
  MATTERS_ANALYTICS: "cases/analytics",
  MATTERS_INTAKE: "cases/intake",
  MATTERS_OPERATIONS: "cases/operations",
  MATTERS_INSIGHTS: "cases/insights",
  MATTERS_FINANCIALS: "cases/financials",

  DOCKET: "docket",
  WORKFLOWS: "workflows",
  MESSAGES: "messages",
  DISCOVERY: "discovery",
  EVIDENCE: "evidence",
  EXHIBITS: "exhibits",
  CORRESPONDENCE: "correspondence",
  JURISDICTION: "jurisdiction",
  ANALYTICS: "analytics",
  CALENDAR: "calendar",
  BILLING: "billing",
  REPORTS: "reports",
  PRACTICE: "practice",
  CRM: "crm",
  DOCUMENTS: "documents",
  DRAFTING: "drafting",
  LIBRARY: "library",
  CLAUSES: "clauses",
  RESEARCH: "research",
  CITATIONS: "citations",
  COMPLIANCE: "compliance",
  ADMIN: "admin",
  AUDIT: "audit",
  WAR_ROOM: "war_room",
  RULES_ENGINE: "rules_engine",
  ENTITIES: "entities",
  DATA_PLATFORM: "data_platform",
  PROFILE: "profile",
  SETTINGS: "settings",
  THEME: "settings/theme",
  DAF: "daf",
  PLEADINGS: "pleadings",
  PLEADING_BUILDER: "pleading_builder",
  LITIGATION: "litigation",
  LITIGATION_BUILDER: "litigation_builder",

  // Real Estate Division
  REAL_ESTATE: "real_estate",
  RE_PORTFOLIO_SUMMARY: "real_estate/portfolio_summary",
  RE_INVENTORY: "real_estate/inventory",
  RE_UTILIZATION: "real_estate/utilization",
  RE_OUTGRANTS: "real_estate/outgrants",
  RE_SOLICITATIONS: "real_estate/solicitations",
  RE_RELOCATION: "real_estate/relocation",
  RE_COST_SHARE: "real_estate/cost_share",
  RE_DISPOSAL: "real_estate/disposal",
  RE_ACQUISITION: "real_estate/acquisition",
  RE_ENCROACHMENT: "real_estate/encroachment",
  RE_USER_MGMT: "real_estate/user_management",
  RE_AUDIT: "real_estate/audit_readiness",
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
