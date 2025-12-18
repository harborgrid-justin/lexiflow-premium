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
 *   import { litigationApi } from '@/services/api/domains/litigation.api';
 *   const cases = await litigationApi.cases.getAll();
 * 
 * Usage - Legacy flat imports (BACKWARD COMPATIBLE):
 *   import { api } from '@/services/api';
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
} from '../integration/apiConfig';

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
} as const;

export default api;
