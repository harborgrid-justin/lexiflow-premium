/**
 * API Configuration for Next.js 16
 * Comprehensive mapping of all NestJS backend endpoints
 *
 * Backend-first architecture - all data flows through PostgreSQL + NestJS
 */

import { cookies } from "next/headers";

// Backend API URL - use environment variable or fallback to localhost
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/**
 * Complete API Endpoints Mapping
 * Maps to 90+ NestJS controllers in backend/src/
 */
export const API_ENDPOINTS = {
  // ==================== Authentication & Users ====================
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
  },
  USERS: {
    LIST: "/users",
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: (id: string) => `/users/${id}/profile`,
  },

  // ==================== Cases & Matter Management ====================
  CASES: {
    LIST: "/cases",
    DETAIL: (id: string) => `/cases/${id}`,
    CREATE: "/cases",
    UPDATE: (id: string) => `/cases/${id}`,
    DELETE: (id: string) => `/cases/${id}`,
    TEAMS: (id: string) => `/cases/${id}/teams`,
    FINANCIALS: (id: string) => `/cases/${id}/financials`,
  },
  MATTERS: {
    LIST: "/matters",
    DETAIL: (id: string) => `/matters/${id}`,
    CREATE: "/matters",
    UPDATE: (id: string) => `/matters/${id}`,
    DELETE: (id: string) => `/matters/${id}`,
  },
  CASE_PHASES: {
    LIST: "/case-phases",
    DETAIL: (id: string) => `/case-phases/${id}`,
    CREATE: "/case-phases",
    UPDATE: (id: string) => `/case-phases/${id}`,
    DELETE: (id: string) => `/case-phases/${id}`,
  },

  // ==================== Documents & Content ====================
  DOCUMENTS: {
    LIST: "/documents",
    DETAIL: (id: string) => `/documents/${id}`,
    UPLOAD: "/documents/upload",
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    CONTENT: (id: string) => `/documents/${id}/content`,
    FOLDERS: "/documents/folders/list",
    VERSIONS: (id: string) => `/documents/${id}/versions`,
    REDACT: (id: string) => `/documents/${id}/redact`,
  },
  TEMPLATES: {
    LIST: "/templates",
    DETAIL: (id: string) => `/templates/${id}`,
    CREATE: "/templates",
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
    VERSIONS: (id: string) => `/templates/${id}/versions`,
  },
  CONTRACTS: {
    LIST: "/contracts",
    DETAIL: (id: string) => `/contracts/${id}`,
    CREATE: "/contracts",
    UPDATE: (id: string) => `/contracts/${id}`,
    DELETE: (id: string) => `/contracts/${id}`,
    MILESTONES: (id: string) => `/contracts/${id}/milestones`,
    AMENDMENTS: (id: string) => `/contracts/${id}/amendments`,
  },
  ENGAGEMENT_LETTERS: {
    LIST: "/engagement-letters",
    DETAIL: (id: string) => `/engagement-letters/${id}`,
    CREATE: "/engagement-letters",
    UPDATE: (id: string) => `/engagement-letters/${id}`,
    DELETE: (id: string) => `/engagement-letters/${id}`,
    SIGN: (id: string) => `/engagement-letters/${id}/sign`,
  },
  DOCUMENT_VERSIONS: {
    LIST: (documentId: string) => `/documents/${documentId}/versions`,
    ALL: "/document-versions/all",
    DETAIL: (documentId: string, versionId: string) =>
      `/documents/${documentId}/versions/${versionId}`,
    CREATE: (documentId: string) => `/documents/${documentId}/versions`,
  },
  CLAUSES: {
    LIST: "/clauses",
    DETAIL: (id: string) => `/clauses/${id}`,
    CREATE: "/clauses",
    UPDATE: (id: string) => `/clauses/${id}`,
    DELETE: (id: string) => `/clauses/${id}`,
  },

  // ==================== Pleadings & Motions ====================
  PLEADINGS: {
    LIST: "/pleadings",
    DETAIL: (id: string) => `/pleadings/${id}`,
    CREATE: "/pleadings",
    UPDATE: (id: string) => `/pleadings/${id}`,
    DELETE: (id: string) => `/pleadings/${id}`,
  },
  MOTIONS: {
    LIST: "/motions",
    DETAIL: (id: string) => `/motions/${id}`,
    BY_CASE: (caseId: string) => `/motions/case/${caseId}`,
    CREATE: "/motions",
    UPDATE: (id: string) => `/motions/${id}`,
    DELETE: (id: string) => `/motions/${id}`,
  },
  BRIEFS: {
    LIST: "/briefs",
    DETAIL: (id: string) => `/briefs/${id}`,
    CREATE: "/briefs",
    UPDATE: (id: string) => `/briefs/${id}`,
    DELETE: (id: string) => `/briefs/${id}`,
  },
  EXHIBITS: {
    LIST: "/exhibits",
    DETAIL: (id: string) => `/exhibits/${id}`,
    CREATE: "/exhibits",
    UPDATE: (id: string) => `/exhibits/${id}`,
    DELETE: (id: string) => `/exhibits/${id}`,
  },

  // ==================== Docket Management ====================
  DOCKET: {
    LIST: "/docket",
    DETAIL: (id: string) => `/docket/${id}`,
    BY_CASE: (caseId: string) => `/docket/case/${caseId}`,
    CREATE: "/docket",
    UPDATE: (id: string) => `/docket/${id}`,
    DELETE: (id: string) => `/docket/${id}`,
    PACER_SYNC: "/docket/pacer/sync",
  },

  // ==================== Discovery & Evidence ====================
  DISCOVERY: {
    ROOT: "/discovery",
    REQUESTS: "/discovery-requests",
    PRODUCTIONS: "/productions",
  },
  DISCOVERY_REQUESTS: {
    LIST: "/discovery-requests",
    DETAIL: (id: string) => `/discovery-requests/${id}`,
    CREATE: "/discovery-requests",
    UPDATE: (id: string) => `/discovery-requests/${id}`,
    DELETE: (id: string) => `/discovery-requests/${id}`,
  },
  PRODUCTIONS: {
    LIST: "/productions",
    DETAIL: (id: string) => `/productions/${id}`,
    CREATE: "/productions",
    UPDATE: (id: string) => `/productions/${id}`,
    DELETE: (id: string) => `/productions/${id}`,
  },
  EVIDENCE: {
    LIST: "/evidence",
    DETAIL: (id: string) => `/evidence/${id}`,
    CREATE: "/evidence",
    UPDATE: (id: string) => `/evidence/${id}`,
    DELETE: (id: string) => `/evidence/${id}`,
  },
  CUSTODIANS: {
    LIST: "/custodians",
    DETAIL: (id: string) => `/custodians/${id}`,
    CREATE: "/custodians",
    UPDATE: (id: string) => `/custodians/${id}`,
    DELETE: (id: string) => `/custodians/${id}`,
  },
  CUSTODIAN_INTERVIEWS: {
    LIST: "/custodian-interviews",
    DETAIL: (id: string) => `/custodian-interviews/${id}`,
    CREATE: "/custodian-interviews",
    UPDATE: (id: string) => `/custodian-interviews/${id}`,
    DELETE: (id: string) => `/custodian-interviews/${id}`,
  },
  DEPOSITIONS: {
    LIST: "/depositions",
    DETAIL: (id: string) => `/depositions/${id}`,
    CREATE: "/depositions",
    UPDATE: (id: string) => `/depositions/${id}`,
    DELETE: (id: string) => `/depositions/${id}`,
  },
  LEGAL_HOLDS: {
    LIST: "/legal-holds",
    DETAIL: (id: string) => `/legal-holds/${id}`,
    CREATE: "/legal-holds",
    UPDATE: (id: string) => `/legal-holds/${id}`,
    DELETE: (id: string) => `/legal-holds/${id}`,
  },
  WITNESSES: {
    LIST: "/witnesses",
    DETAIL: (id: string) => `/witnesses/${id}`,
    CREATE: "/witnesses",
    UPDATE: (id: string) => `/witnesses/${id}`,
    DELETE: (id: string) => `/witnesses/${id}`,
  },
  ESI_SOURCES: {
    LIST: "/esi-sources",
    DETAIL: (id: string) => `/esi-sources/${id}`,
    CREATE: "/esi-sources",
    UPDATE: (id: string) => `/esi-sources/${id}`,
    DELETE: (id: string) => `/esi-sources/${id}`,
  },
  PRIVILEGE_LOG: {
    LIST: "/privilege-log",
    DETAIL: (id: string) => `/privilege-log/${id}`,
    CREATE: "/privilege-log",
    UPDATE: (id: string) => `/privilege-log/${id}`,
    DELETE: (id: string) => `/privilege-log/${id}`,
  },
  EXAMINATIONS: {
    LIST: "/examinations",
    DETAIL: (id: string) => `/examinations/${id}`,
    CREATE: "/examinations",
    UPDATE: (id: string) => `/examinations/${id}`,
    DELETE: (id: string) => `/examinations/${id}`,
  },
  INTERROGATORIES: {
    LIST: "/interrogatories",
    DETAIL: (id: string) => `/interrogatories/${id}`,
    CREATE: "/interrogatories",
    UPDATE: (id: string) => `/interrogatories/${id}`,
    DELETE: (id: string) => `/interrogatories/${id}`,
  },
  ADMISSIONS: {
    LIST: "/admissions",
    DETAIL: (id: string) => `/admissions/${id}`,
    CREATE: "/admissions",
    UPDATE: (id: string) => `/admissions/${id}`,
    DELETE: (id: string) => `/admissions/${id}`,
  },
  PRODUCTION_REQUESTS: {
    LIST: "/production-requests",
    DETAIL: (id: string) => `/production-requests/${id}`,
    CREATE: "/production-requests",
    UPDATE: (id: string) => `/production-requests/${id}`,
    DELETE: (id: string) => `/production-requests/${id}`,
  },
  SUBPOENAS: {
    LIST: "/subpoenas",
    DETAIL: (id: string) => `/subpoenas/${id}`,
    CREATE: "/subpoenas",
    UPDATE: (id: string) => `/subpoenas/${id}`,
    DELETE: (id: string) => `/subpoenas/${id}`,
  },

  // ==================== Billing & Finance ====================
  BILLING: {
    ROOT: "/billing",
    METRICS: "/billing/analytics/metrics",
    ANALYTICS: "/billing/analytics",
    PROFITABILITY: "/billing/analytics/profitability",
    REALIZATION: "/billing/analytics/realization",
    WIP: "/billing/analytics/wip",
    FORECAST: "/billing/analytics/forecast",
    TIMEKEEPER_PERFORMANCE: "/billing/analytics/timekeeper-performance",
    MATTER_PROFITABILITY: "/billing/analytics/matter-profitability",
    CLIENT_PROFITABILITY: "/billing/analytics/client-profitability",
  },
  TIME_ENTRIES: {
    LIST: "/billing/time-entries",
    DETAIL: (id: string) => `/billing/time-entries/${id}`,
    CREATE: "/billing/time-entries",
    UPDATE: (id: string) => `/billing/time-entries/${id}`,
    DELETE: (id: string) => `/billing/time-entries/${id}`,
  },
  EXPENSES: {
    LIST: "/billing/expenses",
    DETAIL: (id: string) => `/billing/expenses/${id}`,
    CREATE: "/billing/expenses",
    UPDATE: (id: string) => `/billing/expenses/${id}`,
    DELETE: (id: string) => `/billing/expenses/${id}`,
  },
  INVOICES: {
    LIST: "/billing/invoices",
    DETAIL: (id: string) => `/billing/invoices/${id}`,
    CREATE: "/billing/invoices",
    UPDATE: (id: string) => `/billing/invoices/${id}`,
    DELETE: (id: string) => `/billing/invoices/${id}`,
    SEND: (id: string) => `/billing/invoices/${id}/send`,
  },
  RATE_TABLES: {
    LIST: "/billing/rates",
    DETAIL: (id: string) => `/billing/rates/${id}`,
    RATES: (id: string) => `/billing/rates/${id}/rates`,
    HISTORY: (id: string) => `/billing/rates/${id}/history`,
    CREATE: "/billing/rates",
    UPDATE: (id: string) => `/billing/rates/${id}`,
    DELETE: (id: string) => `/billing/rates/${id}`,
  },
  FEE_AGREEMENTS: {
    LIST: "/billing/fee-agreements",
    DETAIL: (id: string) => `/billing/fee-agreements/${id}`,
    CREATE: "/billing/fee-agreements",
    UPDATE: (id: string) => `/billing/fee-agreements/${id}`,
    DELETE: (id: string) => `/billing/fee-agreements/${id}`,
  },
  TRUST_ACCOUNTS: {
    LIST: "/billing/trust-accounts",
    DETAIL: (id: string) => `/billing/trust-accounts/${id}`,
    CREATE: "/billing/trust-accounts",
    UPDATE: (id: string) => `/billing/trust-accounts/${id}`,
    DELETE: (id: string) => `/billing/trust-accounts/${id}`,
  },
  RETAINERS: {
    LIST: "/billing/retainers",
    DETAIL: (id: string) => `/billing/retainers/${id}`,
    CREATE: "/billing/retainers",
    UPDATE: (id: string) => `/billing/retainers/${id}`,
    DELETE: (id: string) => `/billing/retainers/${id}`,
  },
  TRUST_ACCOUNTING: {
    LIST: "/billing/trust-accounting",
    DETAIL: (id: string) => `/billing/trust-accounting/${id}`,
    TRANSACTIONS: (id: string) =>
      `/billing/trust-accounting/${id}/transactions`,
    RECONCILE: (id: string) => `/billing/trust-accounting/${id}/reconcile`,
  },
  WRITE_OFFS: {
    LIST: "/billing/write-offs",
    DETAIL: (id: string) => `/billing/write-offs/${id}`,
    CREATE: "/billing/write-offs",
    UPDATE: (id: string) => `/billing/write-offs/${id}`,
    APPROVE: (id: string) => `/billing/write-offs/${id}/approve`,
  },
  PAYMENT_PLANS: {
    LIST: "/billing/payment-plans",
    DETAIL: (id: string) => `/billing/payment-plans/${id}`,
    CREATE: "/billing/payment-plans",
    UPDATE: (id: string) => `/billing/payment-plans/${id}`,
    DELETE: (id: string) => `/billing/payment-plans/${id}`,
    SCHEDULE: (id: string) => `/billing/payment-plans/${id}/schedule`,
    TRANSACTIONS: (id: string) => `/billing/payment-plans/${id}/transactions`,
  },
  BUDGET_FORECASTING: {
    LIST: "/billing/budget-forecasting",
    DETAIL: (id: string) => `/billing/budget-forecasting/${id}`,
    SUMMARY: "/billing/budget-forecasting/summary",
    ANALYTICS: "/billing/budget-forecasting/analytics",
  },
  CONFLICT_WAIVERS: {
    LIST: "/compliance/conflict-waivers",
    DETAIL: (id: string) => `/compliance/conflict-waivers/${id}`,
    CREATE: "/compliance/conflict-waivers",
    UPDATE: (id: string) => `/compliance/conflict-waivers/${id}`,
    DELETE: (id: string) => `/compliance/conflict-waivers/${id}`,
  },
  COMPLIANCE_ALERTS: {
    LIST: "/compliance/alerts",
    DETAIL: (id: string) => `/compliance/alerts/${id}`,
    CREATE: "/compliance/alerts",
    UPDATE: (id: string) => `/compliance/alerts/${id}`,
    RESOLVE: (id: string) => `/compliance/alerts/${id}/resolve`,
  },
  BAR_REQUIREMENTS: {
    LIST: "/compliance/bar-requirements",
    DETAIL: (id: string) => `/compliance/bar-requirements/${id}`,
    UPDATE: (id: string) => `/compliance/bar-requirements/${id}`,
    CLE_TRACKING: (id: string) => `/compliance/bar-requirements/${id}/cle`,
  },

  // ==================== Analytics & Reporting ====================
  DASHBOARD: {
    METRICS: "/dashboard/metrics",
    ACTIVITY: "/dashboard/activity",
    OVERVIEW: "/dashboard",
  },
  ANALYTICS: {
    ROOT: "/analytics",
    DASHBOARD: "/analytics/dashboard",
    DISCOVERY: "/analytics/discovery",
    BILLING: "/analytics/billing",
    CASES: "/analytics/cases",
    JUDGE_STATS: "/analytics/judge-stats",
    OUTCOME_PREDICTIONS: "/analytics/outcome-predictions",
  },
  REPORTS: {
    LIST: "/reports",
    GENERATE: "/reports/generate",
    DETAIL: (id: string) => `/reports/${id}`,
  },

  // ==================== Communication & Collaboration ====================
  COMMUNICATIONS: {
    ROOT: "/communications",
  },
  MESSAGING: {
    LIST: "/messaging",
    SEND: "/messaging/send",
    THREAD: (id: string) => `/messaging/thread/${id}`,
  },
  MESSENGER: {
    ROOT: "/messenger",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: "/notifications/read-all",
    MARK_READ: (id: string) => `/notifications/${id}/mark-read`,
  },
  ANNOUNCEMENTS: {
    LIST: "/announcements",
    DETAIL: (id: string) => `/announcements/${id}`,
    CREATE: "/announcements",
    UPDATE: (id: string) => `/announcements/${id}`,
    DELETE: (id: string) => `/announcements/${id}`,
  },
  CORRESPONDENCE: {
    LIST: "/correspondence",
    DETAIL: (id: string) => `/correspondence/${id}`,
    CREATE: "/correspondence",
  },
  WAR_ROOM: {
    ROOT: "/war-room",
    DETAIL: (id: string) => `/war-room/${id}`,
  },
  CLIENT_PORTAL: {
    LIST: "/client-portal",
    DETAIL: (id: string) => `/client-portal/${id}`,
    UPDATE_ACCESS: (id: string) => `/client-portal/${id}/access`,
    SHARED_DOCUMENTS: (id: string) => `/client-portal/${id}/documents`,
  },
  COURT_DATES: {
    LIST: "/court-dates",
    DETAIL: (id: string) => `/court-dates/${id}`,
    CREATE: "/court-dates",
    UPDATE: (id: string) => `/court-dates/${id}`,
    DELETE: (id: string) => `/court-dates/${id}`,
    CALENDAR: "/court-dates/calendar",
  },
  DOCUMENT_APPROVALS: {
    LIST: "/document-approvals",
    DETAIL: (id: string) => `/document-approvals/${id}`,
    CREATE: "/document-approvals",
    UPDATE: (id: string) => `/document-approvals/${id}`,
    APPROVE: (id: string) => `/document-approvals/${id}/approve`,
    REJECT: (id: string) => `/document-approvals/${id}/reject`,
  },

  // ==================== Compliance & Security ====================
  COMPLIANCE: {
    ROOT: "/compliance",
    REPORTS: "/compliance/reports",
    CONFLICTS: "/compliance/conflicts",
    ETHICAL_WALLS: "/compliance/ethical-walls",
  },
  CONFLICT_CHECKS: {
    LIST: "/compliance/conflicts",
    RUN: "/compliance/conflicts/run",
    DETAIL: (id: string) => `/compliance/conflicts/${id}`,
  },
  ETHICAL_WALLS: {
    LIST: "/compliance/ethical-walls",
    DETAIL: (id: string) => `/compliance/ethical-walls/${id}`,
    CREATE: "/compliance/ethical-walls",
  },
  AUDIT_LOGS: {
    LIST: "/audit-logs",
    SEARCH: "/audit-logs/search",
  },
  PERMISSIONS: {
    LIST: "/security/permissions",
    CHECK: "/security/permissions/check",
  },
  RLS_POLICIES: {
    LIST: "/security/rls-policies",
    DETAIL: (id: string) => `/security/rls-policies/${id}`,
  },

  // ==================== Clients & Parties ====================
  CLIENTS: {
    LIST: "/clients",
    DETAIL: (id: string) => `/clients/${id}`,
    CREATE: "/clients",
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
  },
  PARTIES: {
    LIST: "/parties",
    DETAIL: (id: string) => `/parties/${id}`,
    CREATE: "/parties",
    UPDATE: (id: string) => `/parties/${id}`,
    DELETE: (id: string) => `/parties/${id}`,
  },
  LEGAL_ENTITIES: {
    LIST: "/legal-entities",
    DETAIL: (id: string) => `/legal-entities/${id}`,
    CREATE: "/legal-entities",
  },

  // ==================== Research & Citations ====================
  CITATIONS: {
    LIST: "/citations",
    VALIDATE: "/citations/validate",
    BLUEBOOK: "/bluebook",
  },
  KNOWLEDGE: {
    SEARCH: "/knowledge/search",
    ARTICLES: "/knowledge/articles",
  },
  SEARCH: {
    GLOBAL: "/search",
    CASES: "/search/cases",
    DOCUMENTS: "/search/documents",
  },

  // ==================== Drafting & Templates ====================
  DRAFTING: {
    TEMPLATES: "/drafting/templates",
    GENERATE: "/drafting/generate",
    DETAIL: (id: string) => `/drafting/templates/${id}`,
  },

  // ==================== Workflow & Tasks ====================
  WORKFLOW: {
    TEMPLATES: "/workflow/templates",
    INSTANCES: "/workflow/instances",
  },
  TASKS: {
    LIST: "/tasks",
    DETAIL: (id: string) => `/tasks/${id}`,
    CREATE: "/tasks",
    UPDATE: (id: string) => `/tasks/${id}`,
    COMPLETE: (id: string) => `/tasks/${id}/complete`,
  },
  PROJECTS: {
    LIST: "/projects",
    DETAIL: (id: string) => `/projects/${id}`,
  },

  // ==================== Calendar & Events ====================
  CALENDAR: {
    EVENTS: "/calendar",
    CREATE: "/calendar",
  },

  // ==================== HR & Organization ====================
  HR: {
    ROOT: "/hr",
    EMPLOYEES: "/hr/employees",
  },
  ORGANIZATIONS: {
    LIST: "/organizations",
    DETAIL: (id: string) => `/organizations/${id}`,
  },
  JURISDICTIONS: {
    LIST: "/jurisdictions",
    DETAIL: (id: string) => `/jurisdictions/${id}`,
  },

  // ==================== Firm Operations ====================
  VENDORS: {
    LIST: "/vendors",
    DETAIL: (id: string) => `/vendors/${id}`,
    CREATE: "/vendors",
    UPDATE: (id: string) => `/vendors/${id}`,
    DELETE: (id: string) => `/vendors/${id}`,
    CONTRACTS: (id: string) => `/vendors/${id}/contracts`,
    INVOICES: (id: string) => `/vendors/${id}/invoices`,
    PERFORMANCE: (id: string) => `/vendors/${id}/performance`,
  },
  EXPERT_WITNESSES: {
    LIST: "/expert-witnesses",
    DETAIL: (id: string) => `/expert-witnesses/${id}`,
    CREATE: "/expert-witnesses",
    UPDATE: (id: string) => `/expert-witnesses/${id}`,
    DELETE: (id: string) => `/expert-witnesses/${id}`,
    CV: (id: string) => `/expert-witnesses/${id}/cv`,
    TESTIMONY: (id: string) => `/expert-witnesses/${id}/testimony`,
    REPORTS: (id: string) => `/expert-witnesses/${id}/reports`,
  },
  PROCESS_SERVERS: {
    LIST: "/process-servers",
    DETAIL: (id: string) => `/process-servers/${id}`,
    CREATE: "/process-servers",
    UPDATE: (id: string) => `/process-servers/${id}`,
    DELETE: (id: string) => `/process-servers/${id}`,
    HISTORY: (id: string) => `/process-servers/${id}/history`,
    PROOF: (id: string) => `/process-servers/${id}/proof`,
  },
  STATUTE_TRACKER: {
    LIST: "/statute-tracker",
    DETAIL: (id: string) => `/statute-tracker/${id}`,
    CREATE: "/statute-tracker",
    UPDATE: (id: string) => `/statute-tracker/${id}`,
    DELETE: (id: string) => `/statute-tracker/${id}`,
  },
  DEADLINES: {
    LIST: "/deadlines",
    DETAIL: (id: string) => `/deadlines/${id}`,
    CREATE: "/deadlines",
    UPDATE: (id: string) => `/deadlines/${id}`,
    DELETE: (id: string) => `/deadlines/${id}`,
  },
  APPEALS: {
    LIST: "/appeals",
    DETAIL: (id: string) => `/appeals/${id}`,
    CREATE: "/appeals",
    UPDATE: (id: string) => `/appeals/${id}`,
    DELETE: (id: string) => `/appeals/${id}`,
  },
  MEDIATION: {
    LIST: "/mediation",
    DETAIL: (id: string) => `/mediation/${id}`,
    CREATE: "/mediation",
    UPDATE: (id: string) => `/mediation/${id}`,
    DELETE: (id: string) => `/mediation/${id}`,
  },
  ARBITRATION: {
    LIST: "/arbitration",
    DETAIL: (id: string) => `/arbitration/${id}`,
    CREATE: "/arbitration",
    UPDATE: (id: string) => `/arbitration/${id}`,
    DELETE: (id: string) => `/arbitration/${id}`,
  },
  JUDGMENTS: {
    LIST: "/judgments",
    DETAIL: (id: string) => `/judgments/${id}`,
    CREATE: "/judgments",
    UPDATE: (id: string) => `/judgments/${id}`,
    DELETE: (id: string) => `/judgments/${id}`,
  },
  CONFLICTS: {
    LIST: "/conflicts",
    DETAIL: (id: string) => `/conflicts/${id}`,
    CREATE: "/conflicts",
    UPDATE: (id: string) => `/conflicts/${id}`,
    DELETE: (id: string) => `/conflicts/${id}`,
  },
  INTAKE_FORMS: {
    LIST: "/intake-forms",
    DETAIL: (id: string) => `/intake-forms/${id}`,
    CREATE: "/intake-forms",
    UPDATE: (id: string) => `/intake-forms/${id}`,
    DELETE: (id: string) => `/intake-forms/${id}`,
  },

  // ==================== Processing & OCR ====================
  OCR: {
    PROCESS: "/ocr/process",
    STATUS: (jobId: string) => `/ocr/status/${jobId}`,
  },
  PROCESSING_JOBS: {
    LIST: "/processing-jobs",
    DETAIL: (id: string) => `/processing-jobs/${id}`,
    STATUS: (id: string) => `/processing-jobs/${id}/status`,
  },

  // ==================== System & Admin ====================
  HEALTH: {
    CHECK: "/health",
    READINESS: "/health/readiness",
    LIVENESS: "/health/liveness",
  },
  METRICS: {
    SYSTEM: "/metrics",
    MEMORY: "/api/metrics/memory",
  },
  MONITORING: {
    ROOT: "/monitoring",
    MEMORY: "/api/monitoring/memory",
  },
  BACKUPS: {
    LIST: "/backups",
    CREATE: "/backups/create",
    RESTORE: (id: string) => `/backups/${id}/restore`,
  },
  ADMIN: {
    ROOT: "/admin",
    API_KEYS: "/admin/api-keys",
    BLACKLIST: "/admin/blacklist",
  },

  // ==================== Resource Management ====================
  CONFERENCE_ROOMS: {
    LIST: "/conference-rooms",
    DETAIL: (id: string) => `/conference-rooms/${id}`,
    CREATE: "/conference-rooms",
    UPDATE: (id: string) => `/conference-rooms/${id}`,
    DELETE: (id: string) => `/conference-rooms/${id}`,
    BOOKINGS: (id: string) => `/conference-rooms/${id}/bookings`,
    CALENDAR: (id: string) => `/conference-rooms/${id}/calendar`,
  },
  EQUIPMENT: {
    LIST: "/equipment",
    DETAIL: (id: string) => `/equipment/${id}`,
    CREATE: "/equipment",
    UPDATE: (id: string) => `/equipment/${id}`,
    DELETE: (id: string) => `/equipment/${id}`,
    CHECKOUT: (id: string) => `/equipment/${id}/checkout`,
    HISTORY: (id: string) => `/equipment/${id}/history`,
    MAINTENANCE: (id: string) => `/equipment/${id}/maintenance`,
  },

  // ==================== Integrations ====================
  INTEGRATIONS: {
    ROOT: "/integrations",
    LIST: "/integrations",
    DETAIL: (id: string) => `/integrations/${id}`,
    SYNC: (id: string) => `/integrations/${id}/sync`,
    PACER: "/integrations/pacer",
    DATA_SOURCES: "/integrations/data-sources",
  },
  WEBHOOKS: {
    LIST: "/webhooks",
    CREATE: "/webhooks",
  },

  // ==================== System Administration ====================
  SYSTEM_SETTINGS: {
    GET: "/system-settings",
    UPDATE: "/system-settings",
  },
  BACKUP_RESTORE: {
    LIST: "/backup-restore",
    CREATE: "/backup-restore",
    RESTORE: (id: string) => `/backup-restore/${id}/restore`,
    DOWNLOAD: (id: string) => `/backup-restore/${id}/download`,
  },
  TIMESHEETS: {
    LIST: "/timesheets",
    DETAIL: (id: string) => `/timesheets/${id}`,
    ENTRIES: (id: string) => `/timesheets/${id}/entries`,
    CREATE: "/timesheets",
    UPDATE: (id: string) => `/timesheets/${id}`,
    SUBMIT: (id: string) => `/timesheets/${id}/submit`,
    APPROVE: (id: string) => `/timesheets/${id}/approve`,
  },
  TRUST_LEDGER: {
    TRANSACTIONS: "/trust-ledger/transactions",
    SUMMARY: "/trust-ledger/summary",
    RECONCILE: "/trust-ledger/reconcile",
    DEPOSIT: "/trust-ledger/deposit",
    WITHDRAWAL: "/trust-ledger/withdrawal",
  },
  COLLECTIONS_QUEUE: {
    LIST: "/collections-queue",
    DETAIL: (id: string) => `/collections-queue/${id}`,
    CONTACT: (id: string) => `/collections-queue/${id}/contact`,
    PAYMENT_PLAN: (id: string) => `/collections-queue/${id}/payment-plan`,
  },
  CONFLICT_ALERTS: {
    LIST: "/conflict-alerts",
    DETAIL: (id: string) => `/conflict-alerts/${id}`,
    RESOLVE: (id: string) => `/conflict-alerts/${id}/resolve`,
    WAIVER: (id: string) => `/conflict-alerts/${id}/waiver`,
  },
  STATUTE_ALERTS: {
    LIST: "/statute-alerts",
    DETAIL: (id: string) => `/statute-alerts/${id}`,
    COMPLETE: (id: string) => `/statute-alerts/${id}/complete`,
    EXTEND: (id: string) => `/statute-alerts/${id}/extend`,
  },

  // ==================== AI Operations ====================
  AI_OPS: {
    ROOT: "/ai-ops",
  },
  AI_DATAOPS: {
    ROOT: "/ai-dataops",
  },

  // ==================== Trial Management ====================
  TRIAL: {
    ROOT: "/trial",
    PREPARATION: "/trial/preparation",
  },
  JURY_SELECTION: {
    LIST: "/jury-selection",
    DETAIL: (id: string) => `/jury-selection/${id}`,
    CREATE: "/jury-selection",
    UPDATE: (id: string) => `/jury-selection/${id}`,
    DELETE: (id: string) => `/jury-selection/${id}`,
    JURORS: (id: string) => `/jury-selection/${id}/jurors`,
  },
  TRIAL_EXHIBITS: {
    LIST: "/exhibits",
    DETAIL: (id: string) => `/exhibits/${id}`,
    CREATE: "/exhibits",
    UPDATE: (id: string) => `/exhibits/${id}`,
    DELETE: (id: string) => `/exhibits/${id}`,
    ADMIT: (id: string) => `/exhibits/${id}/admit`,
    OBJECTIONS: (id: string) => `/exhibits/${id}/objections`,
  },
  COURT_REPORTERS: {
    LIST: "/court-reporters",
    DETAIL: (id: string) => `/court-reporters/${id}`,
    CREATE: "/court-reporters",
    UPDATE: (id: string) => `/court-reporters/${id}`,
    DELETE: (id: string) => `/court-reporters/${id}`,
    ASSIGNMENTS: (id: string) => `/court-reporters/${id}/assignments`,
    TRANSCRIPTS: (id: string) => `/court-reporters/${id}/transcripts`,
  },
  SETTLEMENTS: {
    LIST: "/settlements",
    DETAIL: (id: string) => `/settlements/${id}`,
    CREATE: "/settlements",
    UPDATE: (id: string) => `/settlements/${id}`,
    DELETE: (id: string) => `/settlements/${id}`,
    ACCEPT: (id: string) => `/settlements/${id}/accept`,
    REJECT: (id: string) => `/settlements/${id}/reject`,
  },
  RISKS: {
    LIST: "/risks",
    ASSESS: "/risks/assess",
  },

  // ==================== Data Management ====================
  SCHEMA: {
    ROOT: "/schema",
    TABLES: "/schema/tables",
  },
  SYNC: {
    STATUS: "/sync/status",
    TRIGGER: "/sync/trigger",
  },
  VERSIONING: {
    LIST: "/versioning",
  },
  PIPELINES: {
    LIST: "/pipelines",
    RUN: (id: string) => `/pipelines/${id}/run`,
  },
  QUERY_WORKBENCH: {
    EXECUTE: "/query-workbench/execute",
  },
} as const;

/**
 * Server-side fetch wrapper with proper error handling
 * Use this in Server Components and API routes
 *
 * @example
 * // In a Server Component:
 * const cases = await apiFetch<Case[]>(API_ENDPOINTS.CASES.LIST);
 * const case = await apiFetch<Case>(API_ENDPOINTS.CASES.DETAIL('123'));
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token from cookies (Next.js 16: cookies() is async)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      // Add cache control for Next.js 16
      next: {
        revalidate: options?.next?.revalidate ?? 0, // Default: always fresh
        tags: options?.next?.tags,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
}

/**
 * Client-side fetch wrapper for use in Client Components
 * Automatically includes auth headers from localStorage
 *
 * @example
 * // In a Client Component with 'use client':
 * import { clientFetch } from '@/lib/api-config';
 * const data = await clientFetch<T>(API_ENDPOINTS.CASES.LIST);
 */
export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token from localStorage (only works in client)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Client fetch error:", error);
    throw error;
  }
}
