/**
 * Consolidated API Services Barrel Export
 *
 * This file provides a single point of import for all backend API services.
 * All API service classes and instances are re-exported from their respective
 * domain files for better organization.
 *
 * Usage:
 * ```typescript
 * import { apiServices, CasesApiService } from './services/apiServices';
 *
 * // Use singleton instances
 * const cases = await apiServices.cases.getAll();
 *
 * // Or create custom instances
 * const customCasesApi = new CasesApiService();
 * ```
 */

// ============================================================================
// CORE API SERVICES (from apiServices.ts)
// ============================================================================
export {
  ApiKeysApiService,
  AuthApiService,
  BillingApiService,
  CasesApiService,
  CustodiansApiService,
  DocketApiService,
  DocumentsApiService,
  EvidenceApiService,
  ExaminationsApiService,
  FeeAgreementsApiService,
  NotificationsApiService,
  RateTablesApiService,
  UsersApiService,
  WebhooksApiService,
  apiServices as coreApiServices,
} from '../apiServices';

// ============================================================================
// EXTENDED API SERVICES (from apiServicesExtended.ts)
// ============================================================================
export {
  TrustAccountsApiService,
  TrustAccount,
  TrustAccountTransaction,
  BillingAnalyticsApiService,
  BillingDashboardData,
  ReportsApiService,
  Report,
  ReportSchedule,
  ProcessingJobsApiService,
  ProcessingJob,
  CasePhasesApiService,
  CasePhase as ApiCasePhase,
  CaseTeamsApiService,
  TeamMember,
  PartiesApiService,
  Party as ApiParty,
  PleadingsApiService,
  Pleading,
  extendedApiServices,
} from '../apiServicesExtended';

// ============================================================================
// DISCOVERY API SERVICES (from apiServicesDiscovery.ts)
// ============================================================================
export {
  LegalHoldsApiService,
  LegalHold,
  DepositionsApiService,
  Deposition,
  DiscoveryRequestsApiService,
  DiscoveryRequest,
  ESISourcesApiService,
  ESISource,
  PrivilegeLogApiService,
  PrivilegeLogEntry,
  ProductionsApiService,
  Production,
  CustodianInterviewsApiService,
  CustodianInterview,
  discoveryApiServices,
} from '../apiServicesDiscovery';

// ============================================================================
// COMPLIANCE API SERVICES (from apiServicesCompliance.ts)
// ============================================================================
export {
  ConflictChecksApiService,
  ConflictCheck,
  EthicalWallsApiService,
  EthicalWall,
  AuditLogsApiService,
  AuditLog,
  PermissionsApiService,
  Permission,
  RLSPoliciesApiService,
  RLSPolicy as ApiRLSPolicy,
  ComplianceReportsApiService,
  ComplianceReport,
  complianceApiServices,
} from '../apiServicesCompliance';

// ============================================================================
// ADDITIONAL API SERVICES (from apiServicesAdditional.ts)
// ============================================================================
export {
  ProjectsApiService,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  CommunicationsApiService,
  Communication,
  TimeEntriesApiService,
  CreateTimeEntryDto,
  UpdateTimeEntryDto,
  InvoicesApiService,
  Invoice as ApiInvoice,
  InvoiceLineItem,
  ExpensesApiService,
  Expense,
  additionalApiServices,
} from '../apiServicesAdditional';

// ============================================================================
// FINAL API SERVICES (from apiServicesFinal.ts)
// ============================================================================
export {
  TasksApiService,
  TaskDto,
  RisksApiService,
  Risk as ApiRisk,
  ClientsApiService,
  Client as ApiClient,
  CitationsApiService,
  Citation as ApiCitation,
  TrialExhibitsApiService,
  TrialExhibit as ApiTrialExhibit,
  CalendarApiService,
  CalendarEvent,
  ConversationsApiService,
  Conversation as ApiConversation,
  Message as ApiMessage,
  WarRoomApiService,
  WarRoomData as ApiWarRoomData,
  KnowledgeBaseApiService,
  WikiArticle as ApiWikiArticle,
  Precedent,
  QAItem,
  WorkflowTemplatesApiService,
  WorkflowTemplate,
  HRApiService,
  Employee,
  finalApiServices,
} from '../apiServicesFinal';

// ============================================================================
// AGGREGATED API SERVICES
// ============================================================================

/**
 * Aggregated object containing all API service singleton instances.
 * This provides a convenient way to access all backend APIs from a single import.
 *
 * Organization:
 * - Core services: Basic entities (cases, documents, evidence, etc.)
 * - Extended services: Advanced features (trust accounts, analytics, reports, etc.)
 * - Discovery services: eDiscovery and legal hold management
 * - Compliance services: Conflict checks, ethical walls, audit logs, etc.
 * - Additional services: Projects, communications, time tracking, invoices, expenses
 * - Final services: Tasks, risks, clients, citations, trial exhibits, calendar, etc.
 *
 * @example
 * ```typescript
 * import { allApiServices } from './services/apiServices';
 *
 * // Access any service
 * const cases = await allApiServices.cases.getAll();
 * const trustAccounts = await allApiServices.trustAccounts.getAll();
 * const legalHolds = await allApiServices.legalHolds.getAll();
 * ```
 */
export const allApiServices = {
  // Core services
  apiKeys: coreApiServices.apiKeys,
  auth: coreApiServices.auth,
  billing: coreApiServices.billing,
  cases: coreApiServices.cases,
  custodians: coreApiServices.custodians,
  docket: coreApiServices.docket,
  documents: coreApiServices.documents,
  evidence: coreApiServices.evidence,
  examinations: coreApiServices.examinations,
  feeAgreements: coreApiServices.feeAgreements,
  notifications: coreApiServices.notifications,
  rateTables: coreApiServices.rateTables,
  users: coreApiServices.users,
  webhooks: coreApiServices.webhooks,

  // Extended services
  trustAccounts: extendedApiServices.trustAccounts,
  billingAnalytics: extendedApiServices.billingAnalytics,
  reports: extendedApiServices.reports,
  processingJobs: extendedApiServices.processingJobs,
  casePhases: extendedApiServices.casePhases,
  caseTeams: extendedApiServices.caseTeams,
  parties: extendedApiServices.parties,
  pleadings: extendedApiServices.pleadings,

  // Discovery services
  legalHolds: discoveryApiServices.legalHolds,
  depositions: discoveryApiServices.depositions,
  discoveryRequests: discoveryApiServices.discoveryRequests,
  esiSources: discoveryApiServices.esiSources,
  privilegeLog: discoveryApiServices.privilegeLog,
  productions: discoveryApiServices.productions,
  custodianInterviews: discoveryApiServices.custodianInterviews,

  // Compliance services
  conflictChecks: complianceApiServices.conflictChecks,
  ethicalWalls: complianceApiServices.ethicalWalls,
  auditLogs: complianceApiServices.auditLogs,
  permissions: complianceApiServices.permissions,
  rlsPolicies: complianceApiServices.rlsPolicies,
  complianceReports: complianceApiServices.complianceReports,

  // Additional services
  projects: additionalApiServices.projects,
  communications: additionalApiServices.communications,
  timeEntries: additionalApiServices.timeEntries,
  invoices: additionalApiServices.invoices,
  expenses: additionalApiServices.expenses,

  // Final services
  tasks: finalApiServices.tasks,
  risks: finalApiServices.risks,
  clients: finalApiServices.clients,
  citations: finalApiServices.citations,
  trialExhibits: finalApiServices.trial,
  calendar: finalApiServices.calendar,
  conversations: finalApiServices.conversations,
  warRoom: finalApiServices.warRoom,
  knowledgeBase: finalApiServices.knowledgeBase,
  workflowTemplates: finalApiServices.workflowTemplates,
  hr: finalApiServices.hr,

  // Missing/Additional services
  discoveryMain: missingApiServices.discovery,
  search: missingApiServices.search,
  ocr: missingApiServices.ocr,
  serviceJobs: missingApiServices.serviceJobs,
  messaging: missingApiServices.messaging,
  complianceMain: missingApiServices.compliance,
  tokenBlacklist: missingApiServices.tokenBlacklist,
  analytics: missingApiServices.analytics,
  judgeStats: missingApiServices.judgeStats,
  outcomePredictions: missingApiServices.outcomePredictions,
  documentVersions: missingApiServices.documentVersions,
  dataSourcesIntegration: missingApiServices.dataSources,
  metrics: missingApiServices.metrics,
  production: missingApiServices.production,
};

/**
 * Re-export for backwards compatibility
 */
export { allApiServices as apiServices };

/**
 * Type helper for API service categories
 */
export type ApiServiceCategory =
  | 'core'
  | 'extended'
  | 'discovery'
  | 'compliance'
  | 'additional'
  | 'final';

/**
 * Get all service names in a category
 */
export function getServicesByCategory(
  category: ApiServiceCategory
): string[] {
  switch (category) {
    case 'core':
      return [
        'apiKeys',
        'auth',
        'billing',
        'cases',
        'custodians',
        'docket',
        'documents',
        'evidence',
        'examinations',
        'feeAgreements',
        'notifications',
        'rateTables',
        'users',
        'webhooks',
      ];
    case 'extended':
      return [
        'trustAccounts',
        'billingAnalytics',
        'reports',
        'processingJobs',
        'casePhases',
        'caseTeams',
        'parties',
        'pleadings',
      ];
    case 'discovery':
      return [
        'legalHolds',
        'depositions',
        'discoveryRequests',
        'esiSources',
        'privilegeLog',
        'productions',
        'custodianInterviews',
      ];
    case 'compliance':
      return [
        'conflictChecks',
        'ethicalWalls',
        'auditLogs',
        'permissions',
        'rlsPolicies',
        'complianceReports',
      ];
    case 'additional':
      return [
        'projects',
        'communications',
        'timeEntries',
        'invoices',
        'expenses',
      ];
    case 'final':
      return [
        'tasks',
        'risks',
        'clients',
        'citations',
        'trialExhibits',
        'calendar',
        'conversations',
        'warRoom',
        'knowledgeBase',
        'workflowTemplates',
        'hr',
      ];
    default:
      return [];
  }
}
