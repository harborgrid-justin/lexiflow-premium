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

  // Discovery & Evidence Management
  DEPOSITIONS: "depositions",
  INTERROGATORIES: "interrogatories",
  ADMISSIONS: "admissions",
  PRODUCTION_REQUESTS: "production-requests",
  SUBPOENAS: "subpoenas",
  CUSTODIANS: "custodians",
  LEGAL_HOLDS: "legal-holds",

  // Trial & Litigation
  MOTIONS: "motions",
  BRIEFS: "briefs",
  WITNESSES: "witnesses",
  EXPERT_WITNESSES: "expert-witnesses",
  TRIAL_EXHIBITS: "trial-exhibits",
  JURY_SELECTION: "jury-selection",
  COURT_DATES: "court-dates",
  COURT_REPORTERS: "court-reporters",

  // Alternative Dispute Resolution
  MEDIATION: "mediation",
  ARBITRATION: "arbitration",
  SETTLEMENTS: "settlements",
  APPEALS: "appeals",
  JUDGMENTS: "judgments",

  // Billing & Finance
  INVOICES: "invoices",
  EXPENSES: "expenses",
  TIME_ENTRIES: "time-entries",
  TIMESHEETS: "timesheets",
  RETAINERS: "retainers",
  FEE_AGREEMENTS: "fee-agreements",
  ENGAGEMENT_LETTERS: "engagement-letters",
  BILLING_REPORTS: "billing-reports",
  RATE_TABLES: "rate-tables",
  PAYMENT_PLANS: "payment-plans",
  TRUST_LEDGER: "trust-ledger",
  TRUST_ACCOUNTING: "trust-accounting",
  WRITE_OFFS: "write-offs",
  BUDGET_FORECASTING: "budget-forecasting",
  COLLECTIONS_QUEUE: "collections-queue",

  // Client & Business Development
  CLIENTS: "clients",
  ORGANIZATIONS: "organizations",
  INTAKE_FORMS: "intake-forms",
  CLIENT_PORTAL: "client-portal",
  CONTRACTS: "contracts",

  // Parties & Relationships
  PARTIES: "parties",

  // Conflict Management
  CONFLICTS: "conflicts",
  CONFLICT_ALERTS: "conflict-alerts",
  CONFLICT_WAIVERS: "conflict-waivers",
  ETHICAL_WALLS: "ethical-walls",

  // Compliance & Risk
  COMPLIANCE_ALERTS: "compliance-alerts",
  STATUTE_ALERTS: "statute-alerts",
  STATUTE_TRACKER: "statute-tracker",
  BAR_REQUIREMENTS: "bar-requirements",

  // Document Management
  TEMPLATES: "templates",
  DOCUMENT_VERSIONS: "document-versions",
  DOCUMENT_APPROVALS: "document-approvals",

  // Team & Administration
  TEAM: "team",
  USERS: "users",
  PERMISSIONS: "permissions",
  SETTINGS: "settings",
  SYSTEM_SETTINGS: "system-settings",
  PROFILE: "profile",
  PRACTICE_AREAS: "practice-areas",

  // Operations & Infrastructure
  TASKS: "tasks",
  DEADLINES: "deadlines",
  NOTIFICATIONS: "notifications",
  REPORTS: "reports",
  INTEGRATIONS: "integrations",
  VENDORS: "vendors",
  PROCESS_SERVERS: "process-servers",
  EQUIPMENT: "equipment",
  CONFERENCE_ROOMS: "conference-rooms",
  ANNOUNCEMENTS: "announcements",

  // Security & Audit
  AUDIT_LOGS: "audit-logs",
  ACCESS_LOGS: "access-logs",
  BACKUP_RESTORE: "backup-restore",

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
