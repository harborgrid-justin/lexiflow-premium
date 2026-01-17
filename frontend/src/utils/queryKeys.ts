/**
 * Standardized Query Key Factory
 *
 * Provides type-safe, consistent query keys for React Query.
 * Prevents typos and ensures proper cache invalidation.
 *
 * Usage:
 * ```tsx
 * // In components:
 * useQuery(queryKeys.cases.all(), () => DataService.cases.getAll());
 * useQuery(queryKeys.cases.detail(caseId), () => DataService.cases.getById(caseId));
 *
 * // In mutations:
 * queryClient.invalidate(queryKeys.cases.all());
 * queryClient.invalidate(queryKeys.cases.detail(caseId));
 * ```
 *
 * Note: Migrated from STORES constants to plain strings for backend API compatibility.
 */

export const queryKeys = {
  // Cases
  cases: {
    all: () => ["cases", "all"] as const,
    lists: () => ["cases", "list"] as const,
    list: (filters: string) => ["cases", "list", filters] as const,
    detail: (id: string) => ["cases", "detail", id] as const,
    byStatus: (status: string) => ["cases", "byStatus", status] as const,
    byCaseId: (caseId: string) => ["cases", "byCaseId", caseId] as const,
    matters: {
      all: () => ["matters", "all"] as const,
      lists: () => ["matters", "list"] as const,
      detail: (id: string) => ["matters", "detail", id] as const,
    },
  },

  // Documents
  documents: {
    all: () => ["documents", "all"] as const,
    lists: () => ["documents", "list"] as const,
    list: (filters: string) => ["documents", "list", filters] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
    byCaseId: (caseId: string) => ["documents", "byCaseId", caseId] as const,
    templates: () => ["documents", "templates"] as const,
    annotations: (documentId: string) =>
      ["documents", "annotations", documentId] as const,
  },

  // Docket Entries
  docket: {
    all: () => ["docket", "all"] as const,
    lists: () => ["docket", "list"] as const,
    detail: (id: string) => ["docket", "detail", id] as const,
    byCaseId: (caseId: string) => ["docket", "byCaseId", caseId] as const,
  },

  // Evidence
  evidence: {
    all: () => ["evidence", "all"] as const,
    lists: () => ["evidence", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["evidence", "list", filters] as const,
    detail: (id: string) => ["evidence", "detail", id] as const,
    byCaseId: (caseId: string) => ["evidence", "byCaseId", caseId] as const,
    byCustodian: (custodian: string) =>
      ["evidence", "byCustodian", custodian] as const,
    custody: (id: string) => ["evidence", "detail", id, "custody"] as const,
    forensics: (id: string) => ["evidence", "detail", id, "forensics"] as const,
    verification: (id: string) =>
      ["evidence", "detail", id, "verification"] as const,
    byAdmissibility: (status: string) =>
      ["evidence", "admissibility", status] as const,
  },

  // Pleadings
  pleadings: {
    all: () => ["pleadings", "all"] as const,
    lists: () => ["pleadings", "list"] as const,
    detail: (id: string) => ["pleadings", "detail", id] as const,
    byCaseId: (caseId: string) => ["pleadings", "byCaseId", caseId] as const,
  },

  // Tasks
  tasks: {
    all: () => ["tasks", "all"] as const,
    lists: () => ["tasks", "list"] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
    byCaseId: (caseId: string) => ["tasks", "byCaseId", caseId] as const,
    byStatus: (status: string) => ["tasks", "byStatus", status] as const,
  },

  // Time Entries
  timeEntries: {
    all: () => ["time-entries", "all"] as const,
    lists: () => ["time-entries", "list"] as const,
    detail: (id: string) => ["time-entries", "detail", id] as const,
    byCaseId: (caseId: string) => ["time-entries", "byCaseId", caseId] as const,
  },

  // Invoices
  invoices: {
    all: () => ["invoices", "all"] as const,
    lists: () => ["invoices", "list"] as const,
    detail: (id: string) => ["invoices", "detail", id] as const,
    byStatus: (status: string) => ["invoices", "byStatus", status] as const,
  },

  // HR/Employees
  employees: {
    all: () => ["staff", "all"] as const,
    lists: () => ["staff", "list"] as const,
    detail: (id: string) => ["staff", "detail", id] as const,
  },

  // Clients
  clients: {
    all: () => ["clients", "all"] as const,
    lists: () => ["clients", "list"] as const,
    detail: (id: string) => ["clients", "detail", id] as const,
  },

  // Users
  users: {
    all: () => ["users", "all"] as const,
    lists: () => ["users", "list"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  // Notifications
  notifications: {
    all: () => ["notifications", "all"] as const,
    unread: () => ["notifications", "unread"] as const,
    byUser: (userId: string) => ["notifications", "byUser", userId] as const,
  },

  // Workflows
  workflows: {
    all: () => ["workflows", "all"] as const,
    lists: () => ["workflows", "list"] as const,
    detail: (id: string) => ["workflows", "detail", id] as const,
    engineDetail: (id: string) => ["workflows", "engine", id] as const,
    processes: () => ["workflows", "processes"] as const,
    tasks: () => ["tasks", "tasks"] as const,
    templates: () => ["workflows", "templates"] as const,
  },

  // Dashboard
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
    recentActivity: () => ["dashboard", "recentActivity"] as const,
    overview: () => ["dashboard", "overview"] as const,
  },

  // Discovery
  discovery: {
    all: () => ["discovery", "all"] as const,
    lists: () => ["discovery", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["discovery", "list", filters] as const,
    detail: (id: string) => ["discovery", "detail", id] as const,
    byCaseId: (caseId: string) => ["discovery", "byCaseId", caseId] as const,
    sanctions: () => ["discovery", "sanctions"] as const,

    // ESI
    esi: {
      all: () => ["discovery-esi", "all"] as const,
      list: (filters?: Record<string, unknown>) =>
        ["discovery-esi", "list", filters] as const,
      detail: (id: string) => ["discovery-esi", id] as const,
      byCase: (caseId: string) => ["discovery-esi", "byCase", caseId] as const,
      byStatus: (status: string) =>
        ["discovery-esi", "byStatus", status] as const,
    },

    // Productions
    productions: {
      all: () => ["discovery-productions", "all"] as const,
      list: (filters?: Record<string, unknown>) =>
        ["discovery-productions", "list", filters] as const,
      detail: (id: string) => ["discovery-productions", id] as const,
      config: () => ["discovery-productions", "config"] as const,
      byCase: (caseId: string) =>
        ["discovery-productions", "byCase", caseId] as const,
    },

    // Privilege Log
    privilege: {
      all: () => ["privilege-log", "all"] as const,
      list: (filters?: Record<string, unknown>) =>
        ["privilege-log", "list", filters] as const,
      detail: (id: string) => ["privilege-log", id] as const,
      byCase: (caseId: string) => ["privilege-log", "byCase", caseId] as const,
      byPrivilegeType: (type: string) =>
        ["privilege-log", "byType", type] as const,
    },

    // Legal Holds
    holds: {
      all: () => ["legal-holds", "all"] as const,
      list: (filters?: Record<string, unknown>) =>
        ["legal-holds", "list", filters] as const,
      detail: (id: string) => ["legal-holds", id] as const,
      byCase: (caseId: string) => ["legal-holds", "byCase", caseId] as const,
      byStatus: (status: string) =>
        ["legal-holds", "byStatus", status] as const,
      byCustodian: (custodian: string) =>
        ["legal-holds", "byCustodian", custodian] as const,
    },
  },

  // Exhibits
  exhibits: {
    all: () => ["exhibits", "all"] as const,
    detail: (id: string) => ["exhibits", "detail", id] as const,
    byCaseId: (caseId: string) => ["exhibits", "byCaseId", caseId] as const,
  },

  // Motions
  motions: {
    all: () => ["motions", "all"] as const,
    detail: (id: string) => ["motions", "detail", id] as const,
    byCaseId: (caseId: string) => ["motions", "byCaseId", caseId] as const,
  },

  // Projects
  projects: {
    all: () => ["projects", "all"] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    byCaseId: (caseId: string) => ["projects", "byCaseId", caseId] as const,
  },

  // Risks
  risks: {
    all: () => ["risks", "all"] as const,
    detail: (id: string) => ["risks", "detail", id] as const,
    byCaseId: (caseId: string) => ["risks", "byCaseId", caseId] as const,
  },

  // Calendar
  calendar: {
    events: () => ["calendar-events", "events"] as const,
    event: (id: string) => ["calendar-events", "event", id] as const,
  },

  // Logs
  logs: {
    all: () => ["logs", "all"] as const,
    byEntity: (entityType: string, entityId: string) =>
      ["logs", "byEntity", entityType, entityId] as const,
  },

  // Admin
  admin: {
    permissions: () => ["admin", "permissions"] as const,
    rlsPolicies: () => ["admin", "rls_policies"] as const,
    anomalies: () => ["admin", "anomalies"] as const,
  },

  // Backup
  backup: {
    snapshots: () => ["backup", "snapshots"] as const,
    all: () => ["backup"] as const,
  },

  // Quality
  quality: {
    dedupe: () => ["quality", "dedupe"] as const,
    anomalies: () => ["admin", "anomalies"] as const,
  },

  // CRM
  crm: {
    leads: () => ["crm", "leads"] as const,
    lead: (id: string) => ["crm", "lead", id] as const,
    opportunities: () => ["crm", "opportunities"] as const,
    relationships: () => ["crm", "relationships"] as const,
  },

  // Case Strategy
  caseStrategy: {
    detail: (caseId: string) => ["case-strategy", caseId] as const,
  },

  // Billing
  billing: {
    all: () => ["billing", "all"] as const,
    lists: () => ["billing", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["billing", "list", filters] as const,

    invoices: () => ["billing", "invoices"] as const,
    invoiceList: (filters?: Record<string, unknown>) =>
      ["billing", "invoices", "list", filters] as const,
    invoice: (id: string) => ["billing", "invoices", id] as const,
    invoicesByCase: (caseId: string) =>
      ["billing", "invoices", "byCase", caseId] as const,
    invoicesByStatus: (status: string) =>
      ["billing", "invoices", "byStatus", status] as const,

    timeEntries: () => ["billing", "timeEntries"] as const,
    feeAgreements: () => ["billing", "feeAgreements"] as const,
    rateTables: () => ["billing", "rateTables"] as const,

    // WIP
    wip: () => ["billing", "wip"] as const,
    wipByCase: (caseId: string) =>
      ["billing", "wip", "byCase", caseId] as const,
    wipByUser: (userId: string) =>
      ["billing", "wip", "byUser", userId] as const,
    wipStats: () => ["billing", "wip", "stats"] as const,

    // Expenses
    expenses: () => ["billing", "expenses"] as const,
    expenseList: (filters?: Record<string, unknown>) =>
      ["billing", "expenses", "list", filters] as const,
    expensesByCase: (caseId: string) =>
      ["billing", "expenses", "byCase", caseId] as const,

    // Trust
    trust: () => ["billing", "trust"] as const,
    trustAccounts: () => ["billing", "trust", "accounts"] as const,
    trustTransactions: (accountId: string) =>
      ["billing", "trust", "transactions", accountId] as const,
    trustByClient: (clientId: string) =>
      ["billing", "trust", "byClient", clientId] as const,

    // Financial Reporting
    realization: () => ["billing", "realization"] as const,
    realizationData: (period: string) =>
      ["billing", "realization", period] as const,
    topClients: (period: string) => ["billing", "topClients", period] as const,
    collections: () => ["billing", "collections"] as const,
    collectionRate: (period: string) =>
      ["billing", "collections", period] as const,
  },

  // Jurisdictions
  jurisdictions: {
    state: () => ["jurisdictions", "state"] as const,
    federal: () => ["jurisdictions", "federal"] as const,
    rules: () => ["rules", "all"] as const,
  },

  // Rules (for legal rules and procedures)
  rules: {
    all: () => ["rules", "all"] as const,
    detail: (id: string) => ["rules", "detail", id] as const,
    byJurisdiction: (jurisdictionId: string) =>
      ["rules", "byJurisdiction", jurisdictionId] as const,
  },

  // Knowledge
  knowledge: {
    wiki: () => ["wiki", "all"] as const,
    qa: () => ["qa", "all"] as const,
    qaAnalytics: () => ["qa", "analytics"] as const,
    precedents: () => ["precedents", "all"] as const,
    cleTracking: () => ["cle-tracking", "all"] as const,
  },

  // Practice Management
  practice: {
    okrs: () => ["okrs", "all"] as const,
    vendorContracts: () => ["vendor-contracts", "all"] as const,
    rfps: () => ["rfps", "all"] as const,
    vendorDirectory: () => ["vendor-directory", "all"] as const,
    maintenanceTickets: () => ["maintenance-tickets", "all"] as const,
    facilities: () => ["facilities", "all"] as const,
    malwareSignatures: () => ["malware-signatures", "all"] as const,
  },

  // Staff
  staff: {
    all: () => ["staff", "all"] as const,
    detail: (id: string) => ["staff", "detail", id] as const,
  },

  // Sanctions
  sanctions: {
    all: () => ["sanctions", "all"] as const,
    byCase: (caseId: string) => ["sanctions", "case", caseId] as const,
  },

  // Clauses
  clauses: {
    all: () => ["clauses", "all"] as const,
    detail: (id: string) => ["clauses", "detail", id] as const,
  },

  // Citations
  citations: {
    all: () => ["citations", "all"] as const,
  },

  // Pleading Templates
  pleadingTemplates: {
    all: () => ["pleading-templates", "all"] as const,
  },

  // Processes
  processes: {
    all: () => ["processes", "all"] as const,
  },

  // Advisors/Experts
  advisors: {
    experts: () => ["advisors", "experts"] as const,
  },

  // Research
  research: {
    history: () => ["research", "history"] as const,
    saved: () => ["research", "saved"] as const,
  },

  // Expenses
  expenses: {
    all: () => ["expenses", "all"] as const,
    lists: () => ["expenses", "list"] as const,
    detail: (id: string) => ["expenses", "detail", id] as const,
    byCaseId: (caseId: string) => ["expenses", "byCaseId", caseId] as const,
    unbilled: (caseId: string) => ["expenses", "unbilled", caseId] as const,
  },

  // Trust Accounts
  trust: {
    all: () => ["trust", "all"] as const,
    accounts: () => ["trust", "accounts"] as const,
    transactions: (accountId: string) =>
      ["trust", "transactions", accountId] as const,
  },

  // Compliance
  compliance: {
    all: () => ["compliance", "all"] as const,
    conflicts: () => ["compliance", "conflicts"] as const,
    ethicalWalls: () => ["compliance", "ethicalWalls"] as const,
    policies: () => ["compliance", "policies"] as const,
    auditLogs: () => ["compliance", "auditLogs"] as const,
  },

  // Judge Profiles
  adminExtended: {
    permissions: () => ["admin", "permissions"] as const,
    rlsPolicies: () => ["admin", "rls_policies"] as const,
    anomalies: () => ["admin", "anomalies"] as const,
    judgeProfiles: () => ["admin", "judgeProfiles"] as const,
  },

  // Discovery custodians
  discoveryExtended: {
    all: () => ["requests", "all"] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
    byCaseId: (caseId: string) => ["requests", "byCaseId", caseId] as const,
    custodians: () => ["discovery", "custodians"] as const,
  },

  // Workflows extended
  workflowsExtended: {
    all: () => ["workflows", "all"] as const,
    lists: () => ["workflows", "list"] as const,
    detail: (id: string) => ["workflows", "detail", id] as const,
    processes: () => ["workflows", "processes"] as const,
    tasks: () => ["tasks", "tasks"] as const,
    automations: () => ["workflows", "automations"] as const,
    settings: () => ["workflows", "settings"] as const,
    approvals: () => ["workflows", "approvals"] as const,
    analytics: () => ["workflows", "analytics"] as const,
  },

  // Playbooks
  playbooks: {
    all: () => ["playbooks", "all"] as const,
    detail: (id: string) => ["playbooks", "detail", id] as const,
    byType: (type: string) => ["playbooks", "byType", type] as const,
  },

  // Organizations
  organizations: {
    all: () => ["organizations", "all"] as const,
    detail: (id: string) => ["organizations", "detail", id] as const,
  },

  // Groups
  groups: {
    all: () => ["groups", "all"] as const,
    detail: (id: string) => ["groups", "detail", id] as const,
    byOrganization: (orgId: string) =>
      ["groups", "byOrganization", orgId] as const,
  },

  // Legal Entities
  entities: {
    all: () => ["entities", "all"] as const,
    lists: () => ["entities", "list"] as const,
    detail: (id: string) => ["entities", "detail", id] as const,
    byType: (entityType: string) => ["entities", "byType", entityType] as const,
    relationships: (id: string) => ["entities", "relationships", id] as const,
    stats: () => ["entities", "stats"] as const,
  },

  // War Room
  warRoom: {
    all: () => ["warRoom", "all"] as const,
    detail: (caseId: string) => ["warRoom", "detail", caseId] as const,
    advisors: (caseId: string) => ["warRoom", "advisors", caseId] as const,
    experts: (caseId: string) => ["warRoom", "experts", caseId] as const,
    opposition: (caseId: string) => ["warRoom", "opposition", caseId] as const,
    data: (id: string) => ["warRoom", "data", id] as const,
  },

  // Beneficial Ownership (UBO)
  ubo: {
    all: () => ["ubo", "all"] as const,
    byEntity: (entityId: string) => ["ubo", "byEntity", entityId] as const,
    register: () => ["ubo", "register"] as const,
    stats: () => ["ubo", "stats"] as const,
  },

  // Jurisdictions & Legal Rules
  jurisdiction: {
    all: () => ["jurisdictions", "all"] as const,
    detail: (id: string) => ["jurisdictions", "detail", id] as const,
    rules: () => ["jurisdictions", "rules"] as const,
    rulesByJurisdiction: (jurisdictionId: string) =>
      ["jurisdictions", jurisdictionId, "rules"] as const,
    localRules: () => ["jurisdictions", "local-rules"] as const,
  },

  // Bluebook Citations
  bluebook: {
    all: () => ["bluebook", "all"] as const,
    history: (documentId?: string) =>
      documentId
        ? (["bluebook", "history", documentId] as const)
        : (["bluebook", "history"] as const),
    templates: (type?: string) =>
      type
        ? (["bluebook", "templates", type] as const)
        : (["bluebook", "templates"] as const),
    parse: (citation: string) => ["bluebook", "parse", citation] as const,
    validate: (citation: string) => ["bluebook", "validate", citation] as const,
  },

  // Witnesses
  witnesses: {
    all: () => ["witnesses", "all"] as const,
    byCase: (caseId: string) => ["witnesses", "case", caseId] as const,
  },

  // Assets
  assets: {
    all: () => ["assets", "all"] as const,
    detail: (id: string) => ["assets", "detail", id] as const,
  },

  // Depositions
  depositions: {
    all: () => ["depositions", "all"] as const,
    detail: (id: string) => ["depositions", "detail", id] as const,
    byCase: (caseId: string) => ["depositions", "case", caseId] as const,
  },

  // Messages
  messages: {
    all: () => ["messages", "all"] as const,
    unreadCount: (caseId: string) => ["messages", caseId, "count"] as const,
  },

  // Webhooks
  webhooks: {
    all: () => ["webhooks", "all"] as const,
  },

  // Version Control
  versionControl: {
    history: () => ["versionControl", "history"] as const,
    branches: () => ["versionControl", "branches"] as const,
    tags: () => ["versionControl", "tags"] as const,
  },

  // Realtime
  realtime: {
    streams: () => ["realtime", "streams"] as const,
  },

  // DB
  db: {
    info: () => ["db", "info"] as const,
  },

  // Event Bus
  eventBus: {
    events: () => ["eventBus", "events"] as const,
  },

  // System
  system: {
    config: () => ["system", "config"] as const,
  },

  // Correspondence
  correspondence: {
    all: () => ["communications", "all"] as const,
    lists: () => ["communications", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["communications", "list", filters] as const,
    detail: (id: string) => ["communications", "detail", id] as const,
    drafts: () => ["communications", "drafts"] as const,
    byCase: (caseId: string) => ["communications", "byCase", caseId] as const,
    byUser: (userId: string) => ["communications", "byUser", userId] as const,
  },

  // Service Jobs
  serviceJobs: {
    all: () => ["service-jobs", "all"] as const,
    lists: () => ["service-jobs", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["service-jobs", "list", filters] as const,
    detail: (id: string) => ["service-jobs", "detail", id] as const,
    byCase: (caseId: string) => ["service-jobs", "byCase", caseId] as const,
    byStatus: (status: string) => ["service-jobs", "byStatus", status] as const,
    pending: () => ["service-jobs", "pending"] as const,
  },
} as const;

/**
 * Type-safe helper to create custom query keys
 */
export const createQueryKey = <T extends readonly unknown[]>(
  ...parts: T
): readonly [...T] => parts;
