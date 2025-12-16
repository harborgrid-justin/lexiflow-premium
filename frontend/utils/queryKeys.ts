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
 */

import { STORES } from '../services/db';

export const queryKeys = {
  // Cases
  cases: {
    all: () => [STORES.CASES, 'all'] as const,
    lists: () => [STORES.CASES, 'list'] as const,
    list: (filters: string) => [STORES.CASES, 'list', filters] as const,
    detail: (id: string) => [STORES.CASES, 'detail', id] as const,
    byStatus: (status: string) => [STORES.CASES, 'byStatus', status] as const,
    byCaseId: (caseId: string) => [STORES.CASES, 'byCaseId', caseId] as const,
  },

  // Documents
  documents: {
    all: () => [STORES.DOCUMENTS, 'all'] as const,
    lists: () => [STORES.DOCUMENTS, 'list'] as const,
    list: (filters: string) => [STORES.DOCUMENTS, 'list', filters] as const,
    detail: (id: string) => [STORES.DOCUMENTS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.DOCUMENTS, 'byCaseId', caseId] as const,
  },

  // Docket Entries
  docket: {
    all: () => [STORES.DOCKET, 'all'] as const,
    lists: () => [STORES.DOCKET, 'list'] as const,
    detail: (id: string) => [STORES.DOCKET, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.DOCKET, 'byCaseId', caseId] as const,
  },

  // Evidence
  evidence: {
    all: () => [STORES.EVIDENCE, 'all'] as const,
    lists: () => [STORES.EVIDENCE, 'list'] as const,
    detail: (id: string) => [STORES.EVIDENCE, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.EVIDENCE, 'byCaseId', caseId] as const,
  },

  // Pleadings
  pleadings: {
    all: () => [STORES.PLEADINGS, 'all'] as const,
    lists: () => [STORES.PLEADINGS, 'list'] as const,
    detail: (id: string) => [STORES.PLEADINGS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.PLEADINGS, 'byCaseId', caseId] as const,
  },

  // Tasks
  tasks: {
    all: () => [STORES.TASKS, 'all'] as const,
    lists: () => [STORES.TASKS, 'list'] as const,
    detail: (id: string) => [STORES.TASKS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.TASKS, 'byCaseId', caseId] as const,
    byStatus: (status: string) => [STORES.TASKS, 'byStatus', status] as const,
  },

  // Time Entries
  timeEntries: {
    all: () => [STORES.TIME_ENTRIES, 'all'] as const,
    lists: () => [STORES.TIME_ENTRIES, 'list'] as const,
    detail: (id: string) => [STORES.TIME_ENTRIES, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.TIME_ENTRIES, 'byCaseId', caseId] as const,
  },

  // Invoices
  invoices: {
    all: () => [STORES.INVOICES, 'all'] as const,
    lists: () => [STORES.INVOICES, 'list'] as const,
    detail: (id: string) => [STORES.INVOICES, 'detail', id] as const,
    byStatus: (status: string) => [STORES.INVOICES, 'byStatus', status] as const,
  },

  // HR/Employees
  employees: {
    all: () => [STORES.STAFF, 'all'] as const,
    lists: () => [STORES.STAFF, 'list'] as const,
    detail: (id: string) => [STORES.STAFF, 'detail', id] as const,
  },

  // Clients
  clients: {
    all: () => [STORES.CLIENTS, 'all'] as const,
    lists: () => [STORES.CLIENTS, 'list'] as const,
    detail: (id: string) => [STORES.CLIENTS, 'detail', id] as const,
  },

  // Users
  users: {
    all: () => [STORES.USERS, 'all'] as const,
    lists: () => [STORES.USERS, 'list'] as const,
    detail: (id: string) => [STORES.USERS, 'detail', id] as const,
  },

  // Notifications
  notifications: {
    all: () => [STORES.NOTIFICATIONS, 'all'] as const,
    unread: () => [STORES.NOTIFICATIONS, 'unread'] as const,
    byUser: (userId: string) => [STORES.NOTIFICATIONS, 'byUser', userId] as const,
  },

  // Workflows
  workflows: {
    all: () => [STORES.WORKFLOWS, 'all'] as const,
    lists: () => [STORES.WORKFLOWS, 'list'] as const,
    detail: (id: string) => [STORES.WORKFLOWS, 'detail', id] as const,
    processes: () => [STORES.WORKFLOWS, 'processes'] as const,
    tasks: () => [STORES.TASKS, 'tasks'] as const,
  },

  // Dashboard
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
    recentActivity: () => ['dashboard', 'recentActivity'] as const,
    overview: () => ['dashboard', 'overview'] as const,
  },

  // Discovery
  discovery: {
    all: () => [STORES.REQUESTS, 'all'] as const,
    detail: (id: string) => [STORES.REQUESTS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.REQUESTS, 'byCaseId', caseId] as const,
  },

  // Exhibits
  exhibits: {
    all: () => [STORES.EXHIBITS, 'all'] as const,
    detail: (id: string) => [STORES.EXHIBITS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.EXHIBITS, 'byCaseId', caseId] as const,
  },

  // Motions
  motions: {
    all: () => [STORES.MOTIONS, 'all'] as const,
    detail: (id: string) => [STORES.MOTIONS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.MOTIONS, 'byCaseId', caseId] as const,
  },

  // Projects
  projects: {
    all: () => [STORES.PROJECTS, 'all'] as const,
    detail: (id: string) => [STORES.PROJECTS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.PROJECTS, 'byCaseId', caseId] as const,
  },

  // Risks
  risks: {
    all: () => [STORES.RISKS, 'all'] as const,
    detail: (id: string) => [STORES.RISKS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.RISKS, 'byCaseId', caseId] as const,
  },

  // War Room
  warRoom: {
    data: (caseId: string) => ['warRoom', caseId] as const,
  },

  // Calendar
  calendar: {
    events: () => [STORES.CALENDAR_EVENTS, 'events'] as const,
    event: (id: string) => [STORES.CALENDAR_EVENTS, 'event', id] as const,
  },

  // Logs
  logs: {
    all: () => [STORES.LOGS, 'all'] as const,
    byEntity: (entityType: string, entityId: string) => [STORES.LOGS, 'byEntity', entityType, entityId] as const,
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
  },

  // Jurisdictions
  jurisdictions: {
    state: () => [STORES.JURISDICTIONS, 'state'] as const,
    federal: () => [STORES.JURISDICTIONS, 'federal'] as const,
    rules: () => [STORES.RULES, 'all'] as const,
  },

  // Knowledge
  knowledge: {
    wiki: () => [STORES.WIKI, 'all'] as const,
    qa: () => [STORES.QA, 'all'] as const,
    qaAnalytics: () => [STORES.QA, 'analytics'] as const,
    precedents: () => [STORES.PRECEDENTS, 'all'] as const,
    cleTracking: () => [STORES.CLE_TRACKING, 'all'] as const,
  },

  // Practice Management
  practice: {
    okrs: () => [STORES.OKRS, 'all'] as const,
    vendorContracts: () => [STORES.VENDOR_CONTRACTS, 'all'] as const,
    rfps: () => [STORES.RFPS, 'all'] as const,
    vendorDirectory: () => [STORES.VENDOR_DIRECTORY, 'all'] as const,
    maintenanceTickets: () => [STORES.MAINTENANCE_TICKETS, 'all'] as const,
    facilities: () => [STORES.FACILITIES, 'all'] as const,
    malwareSignatures: () => [STORES.MALWARE_SIGNATURES, 'all'] as const,
  },

  // Staff
  staff: {
    all: () => [STORES.STAFF, 'all'] as const,
    detail: (id: string) => [STORES.STAFF, 'detail', id] as const,
  },

  // Sanctions
  sanctions: {
    all: () => [STORES.SANCTIONS, 'all'] as const,
  },

  // Clauses
  clauses: {
    all: () => [STORES.CLAUSES, 'all'] as const,
    detail: (id: string) => [STORES.CLAUSES, 'detail', id] as const,
  },

  // Citations
  citations: {
    all: () => [STORES.CITATIONS, 'all'] as const,
  },

  // Pleading Templates
  pleadingTemplates: {
    all: () => [STORES.PLEADING_TEMPLATES, 'all'] as const,
  },

  // Processes
  processes: {
    all: () => [STORES.PROCESSES, 'all'] as const,
  },

  // Advisors/Experts
  advisors: {
    experts: () => [STORES.ADVISORS, 'experts'] as const,
  },

  // Research
  research: {
    history: () => ['research', 'history'] as const,
  },

  // Judge Profiles
  admin: {
    permissions: () => ['admin', 'permissions'] as const,
    rlsPolicies: () => ['admin', 'rls_policies'] as const,
    anomalies: () => ['admin', 'anomalies'] as const,
    judgeProfiles: () => ['admin', 'judgeProfiles'] as const,
  },

  // Discovery custodians
  discovery: {
    all: () => [STORES.REQUESTS, 'all'] as const,
    detail: (id: string) => [STORES.REQUESTS, 'detail', id] as const,
    byCaseId: (caseId: string) => [STORES.REQUESTS, 'byCaseId', caseId] as const,
    custodians: () => ['discovery', 'custodians'] as const,
  },

  // Workflows extended
  workflows: {
    all: () => [STORES.WORKFLOWS, 'all'] as const,
    lists: () => [STORES.WORKFLOWS, 'list'] as const,
    detail: (id: string) => [STORES.WORKFLOWS, 'detail', id] as const,
    processes: () => [STORES.WORKFLOWS, 'processes'] as const,
    tasks: () => [STORES.TASKS, 'tasks'] as const,
    automations: () => ['workflows', 'automations'] as const,
    settings: () => ['workflows', 'settings'] as const,
    approvals: () => ['workflows', 'approvals'] as const,
    analytics: () => ['workflows', 'analytics'] as const,
  },
} as const;

/**
 * Type-safe helper to create custom query keys
 */
export const createQueryKey = <T extends readonly unknown[]>(...parts: T): readonly [...T] => parts;
