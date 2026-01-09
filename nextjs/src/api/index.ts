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
  enableLegacyIndexedDB,
  forceBackendMode,
  getBackendUrl,
  getDataMode,
  isBackendApiEnabled,
  isIndexedDBMode,
  isProduction,
  logApiConfig,
} from "@/config/network/api.config";

// ==================== DOMAIN EXPORTS ====================
// Re-export domain API services for direct access
export { adminApi } from "./domains/admin.api";
export { analyticsApi } from "./domains/analytics.api";
export { authApi } from "./domains/auth.api";
export { billingApi } from "./domains/billing.api";
export { communicationsApi } from "./domains/communications.api";
export { complianceApi } from "./domains/compliance.api";
export { crmApi } from "./domains/crm.api";
export { discoveryApi } from "./domains/discovery.api";
export { integrationsApi } from "./domains/integrations.api";
export { litigationApi } from "./domains/litigation.api";
export { trialApi } from "./domains/trial.api";
export { workflowApi } from "./domains/workflow.api";
// Note: domains/data-platform.api exports dataPlatformApi (conflicts with data-platform/index.ts)
// export { dataPlatformApi } from './domains/data-platform.api';
export {
  DraftingApiService,
  type ClauseReference,
  type CreateTemplateDto,
  type DraftingStats,
  type DraftingTemplate,
  type GeneratedDocument,
  type GenerateDocumentDto,
  type TemplateVariable,
  type UpdateGeneratedDocumentDto,
  type UpdateTemplateDto,
} from "./domains/drafting.api";
export { hrApi } from "./domains/hr.api";
export {
  LegalEntitiesApiService,
  type EntityRelationship,
  type LegalEntityApi,
} from "./domains/legal-entities.api";

// ==================== ORGANIZED FOLDER EXPORTS ====================
// Export from organized domain folders
export * from "./auth";
export * from "./billing";
export * from "./communications";
// REMOVED: export * from "./compliance"; // Circular dependency - use complianceApi from domains instead
export * from "./discovery";
export * from "./integrations";
export * from "./intelligence";
export * from "./litigation";
export * from "./trial";
export * from "./workflow";

// Export admin services (excluding classes that data-platform also exports)
export {
  AuditLogsApiService,
  DocumentsApiService,
  DocumentVersionsApiService,
  HealthApiService,
  MetricsApiService,
  OCRApiService,
  ProcessingJobsApiService,
  ServiceJobsApiService,
} from "./admin";
// Re-export all admin types
export type {
  AuditLog,
  OCRJob,
  OCRRequest,
  ProcessingJob,
  ServiceJob,
  SystemMetrics,
} from "./admin";

// Export data-platform (commented to avoid duplicates - services already exported from admin)
// Use direct imports when needed: import { dataPlatformApi } from '@/api/domains/data-platform.api';
// export * from './data-platform';
export * from "./hr";

// Export type definitions
// COMMENTED OUT: Circular dependency with @/types causing Vite module resolution failures
// Mock data should be imported directly from '@/api/types/[filename]' when needed for testing
// export * from './types';

// Import domain APIs for consolidated export
import * as adminDomain from "./domains/admin.api";
import * as analyticsDomain from "./domains/analytics.api";
import * as authDomain from "./domains/auth.api";
import * as billingDomain from "./domains/billing.api";
import * as communicationsDomain from "./domains/communications.api";
import * as complianceDomain from "./domains/compliance.api";
import * as crmDomain from "./domains/crm.api";
import * as dataPlatformDomain from "./domains/data-platform.api";
import * as discoveryDomain from "./domains/discovery.api";
import * as draftingDomain from "./domains/drafting.api";
import * as hrDomain from "./domains/hr.api";
import * as integrationsDomain from "./domains/integrations.api";
import { LegalEntitiesApiService } from "./domains/legal-entities.api";
import * as litigationDomain from "./domains/litigation.api";
import * as trialDomain from "./domains/trial.api";
import * as workflowDomain from "./domains/workflow.api";

// Import operations services
import { CLEApiService } from "./operations/cle-api";
import { FacilitiesApiService } from "./operations/facilities-api";
import { MarketingApiService } from "./operations/marketing-api";
import { ProcurementApiService } from "./operations/procurement-api";
import { SettingsApiService } from "./operations/settings-api";

export const api = {
  auth: authDomain.authApi.auth,
  users: authDomain.authApi.users,
  apiKeys: authDomain.authApi.apiKeys,
  permissions: authDomain.authApi.permissions,
  ethicalWalls: authDomain.authApi.ethicalWalls,
  tokenBlacklist: authDomain.authApi.tokenBlacklist,
  cases: litigationDomain.litigationApi.cases,
  docket: litigationDomain.litigationApi.docket,
  motions: litigationDomain.litigationApi.motions,
  pleadings: litigationDomain.litigationApi.pleadings,
  parties: litigationDomain.litigationApi.parties,
  caseTeams: litigationDomain.litigationApi.caseTeams,
  casePhases: litigationDomain.litigationApi.casePhases,
  matters: litigationDomain.litigationApi.matters,
  evidence: discoveryDomain.discoveryApi.evidence,
  custodians: discoveryDomain.discoveryApi.custodians,
  examinations: discoveryDomain.discoveryApi.examinations,
  witnesses: discoveryDomain.discoveryApi.witnesses,
  depositions: discoveryDomain.discoveryApi.depositions,
  legalHolds: discoveryDomain.discoveryApi.legalHolds,
  productions: discoveryDomain.discoveryApi.productions,
  discoveryRequests: discoveryDomain.discoveryApi.discoveryRequests,
  esiSources: discoveryDomain.discoveryApi.esiSources,
  privilegeLog: discoveryDomain.discoveryApi.privilegeLog,
  custodianInterviews: discoveryDomain.discoveryApi.custodianInterviews,
  discovery: discoveryDomain.discoveryApi.discovery,
  billing: billingDomain.billingApi.billing,
  timeEntries: billingDomain.billingApi.timeEntries,
  invoices: billingDomain.billingApi.invoices,
  expenses: billingDomain.billingApi.expenses,
  feeAgreements: billingDomain.billingApi.feeAgreements,
  rateTables: billingDomain.billingApi.rateTables,
  trustAccounts: billingDomain.billingApi.trustAccounts,
  trial: trialDomain.trialApi.trial,
  exhibits: trialDomain.trialApi.exhibits,
  tasks: workflowDomain.workflowApi.tasks,
  calendar: workflowDomain.workflowApi.calendar,
  workflow: workflowDomain.workflowApi.workflow,
  projects: workflowDomain.workflowApi.projects,
  risks: workflowDomain.workflowApi.risks,
  warRoom: workflowDomain.workflowApi.warRoom,
  clients: communicationsDomain.communicationsApi.clients,
  communications: communicationsDomain.communicationsApi.communications,
  correspondence: communicationsDomain.communicationsApi.correspondence,
  messaging: communicationsDomain.communicationsApi.messaging,
  notifications: communicationsDomain.communicationsApi.notifications,
  compliance: complianceDomain.complianceApi.compliance,
  conflictChecks: complianceDomain.complianceApi.conflictChecks,
  reports: complianceDomain.complianceApi.reports,
  complianceReporting: complianceDomain.complianceApi.complianceReporting,
  pacer: integrationsDomain.integrationsApi.pacer,
  webhooks: integrationsDomain.integrationsApi.webhooks,
  integrations: integrationsDomain.integrationsApi.integrations,
  organizations: integrationsDomain.integrationsApi.organizations,
  externalApi: integrationsDomain.integrationsApi.externalApi,
  pipelines: integrationsDomain.integrationsApi.pipelines,
  search: analyticsDomain.analyticsApi.search,
  dashboard: analyticsDomain.analyticsApi.dashboard,
  aiOps: analyticsDomain.analyticsApi.aiOps,
  analyticsDashboard: analyticsDomain.analyticsApi.analyticsDashboard,
  billingAnalytics: analyticsDomain.analyticsApi.billingAnalytics,
  caseAnalytics: analyticsDomain.analyticsApi.caseAnalytics,
  discoveryAnalytics: analyticsDomain.analyticsApi.discoveryAnalytics,
  outcomePredictions: analyticsDomain.analyticsApi.outcomePredictions,
  judgeStats: analyticsDomain.analyticsApi.judgeStats,
  bluebook: analyticsDomain.analyticsApi.bluebook,
  knowledge: analyticsDomain.analyticsApi.knowledge,
  citations: analyticsDomain.analyticsApi.citations,
  clauses: analyticsDomain.analyticsApi.clauses,
  jurisdiction: analyticsDomain.analyticsApi.jurisdiction,
  documents: adminDomain.adminApi.documents,
  documentVersions: adminDomain.adminApi.documentVersions,
  processingJobs: adminDomain.adminApi.processingJobs,
  ocr: adminDomain.adminApi.ocr,
  monitoring: adminDomain.adminApi.monitoring,
  health: adminDomain.adminApi.health,
  analytics: adminDomain.adminApi.analytics,
  auditLogs: adminDomain.adminApi.auditLogs,
  versioning: adminDomain.adminApi.versioning,
  sync: adminDomain.adminApi.sync,
  backups: adminDomain.adminApi.backups,
  serviceJobs: adminDomain.adminApi.serviceJobs,
  metrics: adminDomain.adminApi.metrics,
  systemSettings: adminDomain.adminApi.settings,
  dataSources: dataPlatformDomain.dataPlatformApi.dataSources,
  rlsPolicies: dataPlatformDomain.dataPlatformApi.rlsPolicies,
  schemaManagement: dataPlatformDomain.dataPlatformApi.schemaManagement,
  queryWorkbench: dataPlatformDomain.dataPlatformApi.queryWorkbench,
  hr: hrDomain.hrApi.hr,
  legalEntities: new LegalEntitiesApiService(),
  drafting: draftingDomain.draftingApi,

  // Operations & Practice Management
  cle: new CLEApiService(),
  procurement: new ProcurementApiService(),
  facilities: new FacilitiesApiService(),
  marketing: new MarketingApiService(),
  settings: new SettingsApiService(),
  admin: analyticsDomain.analyticsApi.admin,
  crm: crmDomain.crmApi.crm,
} as const;

export default api;
