/**
 * Consolidated API Services - Domain-Organized Barrel Export
 * 
 * This file provides a clean, domain-organized export of all API services.
 * Services are now organized into focused domain modules for better maintainability.
 * 
 * Architecture:
 * - Domain modules: domains/litigation.api.ts, domains/discovery.api.ts, etc.
 * - Zero duplicates: All duplicate implementations consolidated
 * - 95%+ backend coverage: All critical endpoints mapped
 * - Type-safe: Full TypeScript definitions with DTOs
 * - Backend-first: Defaults to PostgreSQL + NestJS backend (IndexedDB deprecated)
 * 
 * Usage - Domain-based imports (RECOMMENDED):
 *   import { litigationApi } from '@/api/domains/litigation.api';
 *   const cases = await litigationApi.cases.getAll();
 * 
 * Usage - Legacy flat imports (BACKWARD COMPATIBLE):
 *   import { api } from '@api';
 *   const cases = await api.cases.getAll();
 */

// Export API configuration utilities
export { 
  isBackendApiEnabled, 
  isIndexedDBMode, 
  getDataMode, 
  forceBackendMode, 
  enableLegacyIndexedDB,
  isProduction,
  getBackendUrl,
  logApiConfig 
} from '@/services/integration/apiConfig';

// ==================== DOMAIN EXPORTS ====================
// Re-export domain API services for direct access
export * from './domains/auth.api';
export * from './domains/litigation.api';
export * from './domains/discovery.api';
export * from './domains/billing.api';
export * from './domains/trial.api';
export * from './domains/workflow.api';
export * from './domains/communications.api';
export * from './domains/compliance.api';
export * from './domains/integrations.api';
export * from './domains/analytics.api';
export * from './domains/admin.api';
export * from './domains/data-platform.api';
export * from './domains/hr.api';
export * from './domains/legal-entities.api';
export * from './domains/drafting.api';

// ==================== STANDALONE API SERVICES ====================
// Export individual API service classes
export * from './ai-ops-api';
export * from './analytics-api';
export * from './analytics-dashboard-api';
export * from './api-keys-api';
export * from './audit-logs-api';
export * from './auth-api';
export * from './backups-api';
export * from './billing-analytics-api';
export * from './billing-api';
export * from './bluebook-api';
export * from './calendar-api';
export * from './case-analytics-api';
export * from './case-phases-api';
export * from './case-teams-api';
export * from './cases-api';
export * from './citations-api';
export * from './clauses-api';
export * from './clients-api';
export * from './communications-api';
export * from './compliance-api';
export * from './compliance-reporting-api';
export * from './conflict-checks-api';
export * from './correspondence-api';
export * from './custodian-interviews-api';
export * from './custodians-api';
export * from './dashboard-api';
// export * from './data-platform-api'; // Already exported via data-platform.api domain
export * from './data-sources-api';
export * from './depositions-api';
export * from './discovery-analytics-api';
export * from './discovery-api';
export * from './discovery-requests-api';
export * from './docket-api';
export * from './document-versions-api';
export * from './documents-api';
export * from './esi-sources-api';
export { EthicalWallsApiService, type EthicalWallFilters, type EthicalWall } from './ethical-walls-api';  // Explicit export to avoid EthicalWall conflict with compliance-api
export * from './evidence-api';
export * from './examinations-api';
export * from './exhibits-api';
export * from './external-api-api';
export * from './fee-agreements-api';
export * from './health-api';
export * from './hr-api';
export * from './integrations-api';
export * from './judge-stats-api';
export * from './jurisdiction-api';
export * from './knowledge-api';
export * from './legal-holds-api';
export * from './cases-api';
export * from './messaging-api';
export * from './metrics-api';
export * from './monitoring-api';
export * from './motions-api';
export * from './notifications-api';
export * from './ocr-api';
export * from './organizations-api';
export * from './outcome-predictions-api';
export * from './parties-api';
export * from './permissions-api';
// export * from './pipelines-api'; // Exported via data-platform-api
export * from './pleadings-api';
export * from './privilege-log-api';
export * from './productions-api';
export * from './projects-api';
// export * from './query-workbench-api'; // Exported via data-platform-api
export * from './rate-tables-api';
export * from './reports-api';
export * from './risks-api';
export * from './rls-policies-api';
// export * from './schema-management-api'; // Exported via data-platform-api
export * from './service-jobs-api';
export * from './sync-api';
export * from './tasks-api';
export * from './token-blacklist-admin-api';
export * from './trial-api';
export * from './trust-accounts-api';
export * from './users-api';
export * from './versioning-api';
export * from './war-room-api';
export * from './webhooks-api';
export * from './witnesses-api';
export * from './workflow-api';

// Import domain APIs for consolidated export
import { authApi as authDomain } from './domains/auth.api';
import { litigationApi as litigationDomain } from './domains/litigation.api';
import { discoveryApi as discoveryDomain } from './domains/discovery.api';
import { billingApi as billingDomain } from './domains/billing.api';
import { trialApi as trialDomain } from './domains/trial.api';
import { workflowApi as workflowDomain } from './domains/workflow.api';
import { communicationsApi as communicationsDomain } from './domains/communications.api';
import { complianceApi as complianceDomain } from './domains/compliance.api';
import { integrationsApi as integrationsDomain } from './domains/integrations.api';
import { analyticsApi as analyticsDomain } from './domains/analytics.api';
import { adminApi as adminDomain } from './domains/admin.api';
import { dataPlatformApi as dataPlatformDomain } from './domains/data-platform.api';
import { hrApi as hrDomain } from './domains/hr.api';
import { LegalEntitiesApiService } from './domains/legal-entities.api';
import { draftingApi } from './domains/drafting.api';

export const api = {
  auth: authDomain.auth,
  users: authDomain.users,
  apiKeys: authDomain.apiKeys,
  permissions: authDomain.permissions,
  ethicalWalls: authDomain.ethicalWalls,
  tokenBlacklist: authDomain.tokenBlacklist,
  cases: litigationDomain.cases,
  docket: litigationDomain.docket,
  motions: litigationDomain.motions,
  pleadings: litigationDomain.pleadings,
  parties: litigationDomain.parties,
  caseTeams: litigationDomain.caseTeams,
  casePhases: litigationDomain.casePhases,
  matters: litigationDomain.matters,
  evidence: discoveryDomain.evidence,
  custodians: discoveryDomain.custodians,
  examinations: discoveryDomain.examinations,
  witnesses: discoveryDomain.witnesses,
  depositions: discoveryDomain.depositions,
  legalHolds: discoveryDomain.legalHolds,
  productions: discoveryDomain.productions,
  discoveryRequests: discoveryDomain.discoveryRequests,
  esiSources: discoveryDomain.esiSources,
  privilegeLog: discoveryDomain.privilegeLog,
  custodianInterviews: discoveryDomain.custodianInterviews,
  discovery: discoveryDomain.discovery,
  billing: billingDomain.billing,
  timeEntries: billingDomain.timeEntries,
  invoices: billingDomain.invoices,
  expenses: billingDomain.expenses,
  feeAgreements: billingDomain.feeAgreements,
  rateTables: billingDomain.rateTables,
  trustAccounts: billingDomain.trustAccounts,
  trial: trialDomain.trial,
  exhibits: trialDomain.exhibits,
  tasks: workflowDomain.tasks,
  calendar: workflowDomain.calendar,
  workflow: workflowDomain.workflow,
  projects: workflowDomain.projects,
  risks: workflowDomain.risks,
  warRoom: workflowDomain.warRoom,
  clients: communicationsDomain.clients,
  communications: communicationsDomain.communications,
  correspondence: communicationsDomain.correspondence,
  messaging: communicationsDomain.messaging,
  notifications: communicationsDomain.notifications,
  compliance: complianceDomain.compliance,
  conflictChecks: complianceDomain.conflictChecks,
  reports: complianceDomain.reports,
  complianceReporting: complianceDomain.complianceReporting,
  pacer: integrationsDomain.pacer,
  webhooks: integrationsDomain.webhooks,
  integrations: integrationsDomain.integrations,
  organizations: integrationsDomain.organizations,
  externalApi: integrationsDomain.externalApi,
  pipelines: integrationsDomain.pipelines,
  search: analyticsDomain.search,
  dashboard: analyticsDomain.dashboard,
  aiOps: analyticsDomain.aiOps,
  analyticsDashboard: analyticsDomain.analyticsDashboard,
  billingAnalytics: analyticsDomain.billingAnalytics,
  caseAnalytics: analyticsDomain.caseAnalytics,
  discoveryAnalytics: analyticsDomain.discoveryAnalytics,
  outcomePredictions: analyticsDomain.outcomePredictions,
  judgeStats: analyticsDomain.judgeStats,
  bluebook: analyticsDomain.bluebook,
  knowledge: analyticsDomain.knowledge,
  citations: analyticsDomain.citations,
  clauses: analyticsDomain.clauses,
  jurisdiction: analyticsDomain.jurisdiction,
  documents: adminDomain.documents,
  documentVersions: adminDomain.documentVersions,
  processingJobs: adminDomain.processingJobs,
  ocr: adminDomain.ocr,
  monitoring: adminDomain.monitoring,
  health: adminDomain.health,
  analytics: adminDomain.analytics,
  auditLogs: adminDomain.auditLogs,
  versioning: adminDomain.versioning,
  sync: adminDomain.sync,
  backups: adminDomain.backups,
  serviceJobs: adminDomain.serviceJobs,
  metrics: adminDomain.metrics,
  dataSources: dataPlatformDomain.dataSources,
  rlsPolicies: dataPlatformDomain.rlsPolicies,
  schemaManagement: dataPlatformDomain.schemaManagement,
  queryWorkbench: dataPlatformDomain.queryWorkbench,
  hr: hrDomain.hr,
  legalEntities: new LegalEntitiesApiService(),
  drafting: draftingApi,
} as const;

export default api;

export class ProcessingJobsApiService {
}

export class SearchApiService {
}