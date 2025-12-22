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
    all: () => ['cases', 'all'] as const,
    lists: () => ['cases', 'list'] as const,
    list: (filters: string) => ['cases', 'list', filters] as const,
    detail: (id: string) => ['cases', 'detail', id] as const,
    byStatus: (status: string) => ['cases', 'byStatus', status] as const,
    byCaseId: (caseId: string) => ['cases', 'byCaseId', caseId] as const,
  },

  // Documents
  documents: {
    all: () => ['documents', 'all'] as const,
    lists: () => ['documents', 'list'] as const,
    list: (filters: string) => ['documents', 'list', filters] as const,
    detail: (id: string) => ['documents', 'detail', id] as const,
    byCaseId: (caseId: string) => ['documents', 'byCaseId', caseId] as const,
  },

  // Docket Entries
  docket: {
    all: () => ['docket', 'all'] as const,
    lists: () => ['docket', 'list'] as const,
    detail: (id: string) => ['docket', 'detail', id] as const,
    byCaseId: (caseId: string) => ['docket', 'byCaseId', caseId] as const,
  },

  // Evidence
  evidence: {
    all: () => ['evidence', 'all'] as const,
    lists: () => ['evidence', 'list'] as const,
    detail: (id: string) => ['evidence', 'detail', id] as const,
    byCaseId: (caseId: string) => ['evidence', 'byCaseId', caseId] as const,
  },

  // Pleadings
  pleadings: {
    all: () => ['pleadings', 'all'] as const,
    lists: () => ['pleadings', 'list'] as const,
    detail: (id: string) => ['pleadings', 'detail', id] as const,
    byCaseId: (caseId: string) => ['pleadings', 'byCaseId', caseId] as const,
  },

  // Tasks
  tasks: {
    all: () => ['tasks', 'all'] as const,
    lists: () => ['tasks', 'list'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    byCaseId: (caseId: string) => ['tasks', 'byCaseId', caseId] as const,
    byStatus: (status: string) => ['tasks', 'byStatus', status] as const,
  },

  // Time Entries
  timeEntries: {
    all: () => ['time-entries', 'all'] as const,
    lists: () => ['time-entries', 'list'] as const,
    detail: (id: string) => ['time-entries', 'detail', id] as const,
    byCaseId: (caseId: string) => ['time-entries', 'byCaseId', caseId] as const,
  },

  // Invoices
  invoices: {
    all: () => ['invoices', 'all'] as const,
    lists: () => ['invoices', 'list'] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    byStatus: (status: string) => ['invoices', 'byStatus', status] as const,
  },

  // HR/Employees
  employees: {
    all: () => ['staff', 'all'] as const,
    lists: () => ['staff', 'list'] as const,
    detail: (id: string) => ['staff', 'detail', id] as const,
  },

  // Clients
  clients: {
    all: () => ['clients', 'all'] as const,
    lists: () => ['clients', 'list'] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },

  // Users
  users: {
    all: () => ['users', 'all'] as const,
    lists: () => ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications', 'all'] as const,
    unread: () => ['notifications', 'unread'] as const,
    byUser: (userId: string) => ['notifications', 'byUser', userId] as const,
  },

  // Workflows
  workflows: {
    all: () => ['workflows', 'all'] as const,
    lists: () => ['workflows', 'list'] as const,
    detail: (id: string) => ['workflows', 'detail', id] as const,
    processes: () => ['workflows', 'processes'] as const,
    tasks: () => ['tasks', 'tasks'] as const,
    templates: () => ['workflows', 'templates'] as const,
  },

  // Dashboard
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
    recentActivity: () => ['dashboard', 'recentActivity'] as const,
    overview: () => ['dashboard', 'overview'] as const,
  },

  // Discovery
  discovery: {
    all: () => ['requests', 'all'] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
    byCaseId: (caseId: string) => ['requests', 'byCaseId', caseId] as const,
    sanctions: () => ['discovery', 'sanctions'] as const,
  },

  // Exhibits
  exhibits: {
    all: () => ['exhibits', 'all'] as const,
    detail: (id: string) => ['exhibits', 'detail', id] as const,
    byCaseId: (caseId: string) => ['exhibits', 'byCaseId', caseId] as const,
  },

  // Motions
  motions: {
    all: () => ['motions', 'all'] as const,
    detail: (id: string) => ['motions', 'detail', id] as const,
    byCaseId: (caseId: string) => ['motions', 'byCaseId', caseId] as const,
  },

  // Projects
  projects: {
    all: () => ['projects', 'all'] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    byCaseId: (caseId: string) => ['projects', 'byCaseId', caseId] as const,
  },

  // Risks
  risks: {
    all: () => ['risks', 'all'] as const,
    detail: (id: string) => ['risks', 'detail', id] as const,
    byCaseId: (caseId: string) => ['risks', 'byCaseId', caseId] as const,
  },

  // War Room
  warRoom: {
    data: (caseId: string) => ['warRoom', caseId] as const,
    advisors: (caseId: string) => ['warRoom', 'advisors', caseId] as const,
    opposition: (caseId: string) => ['warRoom', 'opposition', caseId] as const,
  },

  // Calendar
  calendar: {
    events: () => ['calendar-events', 'events'] as const,
    event: (id: string) => ['calendar-events', 'event', id] as const,
  },

  // Logs
  logs: {
    all: () => ['logs', 'all'] as const,
    byEntity: (entityType: string, entityId: string) => ['logs', 'byEntity', entityType, entityId] as const,
  },

  // Admin
  admin: {
    permissions: () => ['admin', 'permissions'] as const,
    rlsPolicies: () => ['admin', 'rls_policies'] as const,
    anomalies: () => ['admin', 'anomalies'] as const,
  },

  // Backup
  backup: {
    snapshots: () => ['backup', 'snapshots'] as const,
    all: () => ['backup'] as const,
  },

  // Quality
  quality: {
    dedupe: () => ['quality', 'dedupe'] as const,
    anomalies: () => ['admin', 'anomalies'] as const,
  },

  // CRM
  crm: {
    leads: () => ['crm', 'leads'] as const,
    lead: (id: string) => ['crm', 'lead', id] as const,
  },

  // Case Strategy
  caseStrategy: {
    detail: (caseId: string) => ['case-strategy', caseId] as const,
  },

  // Billing
  billing: {
    invoices: () => ['billing', 'invoices'] as const,
    timeEntries: () => ['billing', 'timeEntries'] as const,
    feeAgreements: () => ['billing', 'feeAgreements'] as const,
  },

  // Jurisdictions
  jurisdictions: {
    state: () => ['jurisdictions', 'state'] as const,
    federal: () => ['jurisdictions', 'federal'] as const,
    rules: () => ['rules', 'all'] as const,
  },

  // Knowledge
  knowledge: {
    wiki: () => ['wiki', 'all'] as const,
    qa: () => ['qa', 'all'] as const,
    qaAnalytics: () => ['qa', 'analytics'] as const,
    precedents: () => ['precedents', 'all'] as const,
    cleTracking: () => ['cle-tracking', 'all'] as const,
  },

  // Practice Management
  practice: {
    okrs: () => ['okrs', 'all'] as const,
    vendorContracts: () => ['vendor-contracts', 'all'] as const,
    rfps: () => ['rfps', 'all'] as const,
    vendorDirectory: () => ['vendor-directory', 'all'] as const,
    maintenanceTickets: () => ['maintenance-tickets', 'all'] as const,
    facilities: () => ['facilities', 'all'] as const,
    malwareSignatures: () => ['malware-signatures', 'all'] as const,
  },

  // Staff
  staff: {
    all: () => ['staff', 'all'] as const,
    detail: (id: string) => ['staff', 'detail', id] as const,
  },

  // Sanctions
  sanctions: {
    all: () => ['sanctions', 'all'] as const,
  },

  // Clauses
  clauses: {
    all: () => ['clauses', 'all'] as const,
    detail: (id: string) => ['clauses', 'detail', id] as const,
  },

  // Citations
  citations: {
    all: () => ['citations', 'all'] as const,
  },

  // Pleading Templates
  pleadingTemplates: {
    all: () => ['pleading-templates', 'all'] as const,
  },

  // Processes
  processes: {
    all: () => ['processes', 'all'] as const,
  },

  // Advisors/Experts
  advisors: {
    experts: () => ['advisors', 'experts'] as const,
  },

  // Research
  research: {
    history: () => ['research', 'history'] as const,
    saved: () => ['research', 'saved'] as const,
  },

  // Expenses
  expenses: {
    all: () => ['expenses', 'all'] as const,
    lists: () => ['expenses', 'list'] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
    byCaseId: (caseId: string) => ['expenses', 'byCaseId', caseId] as const,
    unbilled: (caseId: string) => ['expenses', 'unbilled', caseId] as const,
  },

  // Trust Accounts
  trust: {
    all: () => ['trust', 'all'] as const,
    accounts: () => ['trust', 'accounts'] as const,
    transactions: (accountId: string) => ['trust', 'transactions', accountId] as const,
  },

  // Compliance
  compliance: {
    all: () => ['compliance', 'all'] as const,
    conflicts: () => ['compliance', 'conflicts'] as const,
    ethicalWalls: () => ['compliance', 'ethicalWalls'] as const,
    policies: () => ['compliance', 'policies'] as const,
    auditLogs: () => ['compliance', 'auditLogs'] as const,
  },

  // Judge Profiles
  adminExtended: {
    permissions: () => ['admin', 'permissions'] as const,
    rlsPolicies: () => ['admin', 'rls_policies'] as const,
    anomalies: () => ['admin', 'anomalies'] as const,
    judgeProfiles: () => ['admin', 'judgeProfiles'] as const,
  },

  // Discovery custodians
  discoveryExtended: {
    all: () => ['requests', 'all'] as const,
    detail: (id: string) => ['requests', 'detail', id] as const,
    byCaseId: (caseId: string) => ['requests', 'byCaseId', caseId] as const,
    custodians: () => ['discovery', 'custodians'] as const,
  },

  // Workflows extended
  workflowsExtended: {
    all: () => ['workflows', 'all'] as const,
    lists: () => ['workflows', 'list'] as const,
    detail: (id: string) => ['workflows', 'detail', id] as const,
    processes: () => ['workflows', 'processes'] as const,
    tasks: () => ['tasks', 'tasks'] as const,
    automations: () => ['workflows', 'automations'] as const,
    settings: () => ['workflows', 'settings'] as const,
    approvals: () => ['workflows', 'approvals'] as const,
    analytics: () => ['workflows', 'analytics'] as const,
  },

  // Playbooks
  playbooks: {
    all: () => ['playbooks', 'all'] as const,
    detail: (id: string) => ['playbooks', 'detail', id] as const,
    byType: (type: string) => ['playbooks', 'byType', type] as const,
  },

  // Organizations
  organizations: {
    all: () => ['organizations', 'all'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
  },

  // Groups
  groups: {
    all: () => ['groups', 'all'] as const,
    detail: (id: string) => ['groups', 'detail', id] as const,
    byOrganization: (orgId: string) => ['groups', 'byOrganization', orgId] as const,
  },

  // Legal Entities
  entities: {
    all: () => ['entities', 'all'] as const,
    lists: () => ['entities', 'list'] as const,
    detail: (id: string) => ['entities', 'detail', id] as const,
    byType: (entityType: string) => ['entities', 'byType', entityType] as const,
    relationships: (id: string) => ['entities', 'relationships', id] as const,
    stats: () => ['entities', 'stats'] as const,
  },

  // Beneficial Ownership (UBO)
  ubo: {
    all: () => ['ubo', 'all'] as const,
    byEntity: (entityId: string) => ['ubo', 'byEntity', entityId] as const,
    register: () => ['ubo', 'register'] as const,
    stats: () => ['ubo', 'stats'] as const,
  },
} as const;

/**
 * Type-safe helper to create custom query keys
 */
export const createQueryKey = <T extends readonly unknown[]>(...parts: T): readonly [...T] => parts;

