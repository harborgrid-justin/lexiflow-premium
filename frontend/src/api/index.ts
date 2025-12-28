/**
 * Consolidated API Services - Domain-Organized Barrel Export
 * 
 * This file provides a clean, domain-organized export of all API services.
 * Services are organized into focused domain modules for better maintainability.
 * 
 * Architecture:
 * - Domain modules: auth/, litigation/, discovery/, billing/, trial/, workflow/, etc.
 * - Zero duplicates: All duplicate implementations consolidated
 * - 95%+ backend coverage: All critical endpoints mapped
 * - Type-safe: Full TypeScript definitions with DTOs
 * - Backend-first: Defaults to PostgreSQL + NestJS backend (IndexedDB deprecated)
 * 
 * Folder Structure:
 * - auth/ - Authentication, users, permissions, security
 * - litigation/ - Cases, docket, motions, pleadings, parties
 * - discovery/ - Evidence, custodians, depositions, legal holds, ESI
 * - billing/ - Time entries, invoices, expenses, fee agreements, trust accounts
 * - trial/ - Trial preparation, exhibits, courtroom management
 * - workflow/ - Tasks, calendar, projects, risks, collaborative workspaces
 * - communications/ - Clients, correspondence, messaging, notifications
 * - compliance/ - Compliance monitoring, conflict checks, reporting
 * - integrations/ - PACER, webhooks, external APIs, third-party integrations
 * - analytics/ - Dashboards, AI operations, predictions, legal research
 * - admin/ - Documents, processing, OCR, monitoring, system operations
 * - data-platform/ - Data sources, schema management, query workbench
 * - hr/ - Staff management, HR operations
 * - types/ - Shared type definitions and interfaces
 * 
 * Usage - Domain-based imports (RECOMMENDED):
 *   import { api } from '@/api';
 *   const cases = await api.cases.getAll();
 * 
 * Usage - Direct domain imports:
 *   import * as authApi from '@/api/auth';
 *   import * as litigationApi from '@/api/litigation';
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

// ==================== ORGANIZED FOLDER EXPORTS ====================
// Export from organized domain folders
export * from './auth';
export * from './litigation';
export * from './discovery';
export * from './billing';
export * from './trial';
export * from './workflow';
export * from './communications';
export * from './compliance';
export * from './integrations';
export * from './analytics';
export * from './admin';
export * from './data-platform';
export * from './hr';

// Export type definitions
export * from './types';

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


