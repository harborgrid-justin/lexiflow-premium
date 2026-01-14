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
 * ENTERPRISE FRONTEND API ARCHITECTURE:
 * - lib/frontend-api/ - NEW enterprise-grade API layer following architectural standard
 *   - Result<T> return types (no exceptions)
 *   - Domain errors (not HTTP codes)
 *   - Input validation at boundary
 *   - Data normalization layer
 *   - Pure functions (no React/UI dependencies)
 *   - Stable contracts between UI and backend
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
 * Usage - Frontend API (ENTERPRISE STANDARD):
 *   import { casesApi } from '@/lib/frontend-api/cases';
 *   const result = await casesApi.getAll();
 *   if (!result.ok) throw result.error.toResponse();
 *   return result.data; // Normalized, typed data
 *
 * Usage - Domain-based imports (LEGACY):
 *   import { api } from '@/api';
 *   const cases = await api.cases.getAll();
 *
 * Usage - Direct domain imports:
 *   import * as authApi from '@/lib/frontend-api';
 *   import * as litigationApi from '@/lib/frontend-api';
 */

// ==================== ENTERPRISE FRONTEND API ====================
// Export new enterprise-grade frontend API infrastructure
// See: lib/frontend-api/README.md for architecture documentation

export {
  AuthError,
  BusinessLogicError,
  camelToSnake,
  CancelledError,
  client,
  combineResults,
  ConflictError,
  createClient,
  // Domain errors
  DomainError,
  type ErrorType as ErrorTypes,
  failure,
  ForbiddenError,
  isFailure,
  isSuccess,
  mapResult,
  NetworkError,
  normalizeArray,
  normalizeBoolean,
  normalizeCurrency,
  // Normalization
  normalizeDate,
  normalizeEnum,
  normalizeId,
  normalizeNumber,
  normalizePaginatedResponse,
  normalizeString,
  NotFoundError,
  RateLimitError,
  schemas,
  ServerError,
  snakeToCamel,
  success,
  TimeoutError,
  transformKeys,
  UnknownError,
  unwrap,
  validate,
  ValidationError,
  validators,
  // HTTP client
  type ClientConfig,
  type ErrorType,
  type Failure,
  type FieldError,
  type FieldValidator,
  type IDomainError,
  type PaginatedResult,
  type RequestOptions,
  // Core type system
  type Result,
  type Schema,
  type Success,
  // Validation
  type Validator,
} from "@/lib/frontend-api";

// Export domain-specific frontend APIs
export { adminApi as frontendAdminApi } from "@/lib/frontend-api/admin";
export { analyticsApi as frontendAnalyticsApi } from "@/lib/frontend-api/analytics";
export { authApi as frontendAuthApi } from "@/lib/frontend-api/auth";
export { billingApi as frontendBillingApi } from "@/lib/frontend-api/billing";
export { casesApi } from "@/lib/frontend-api/cases";
export { communicationsApi as frontendCommunicationsApi } from "@/lib/frontend-api/communications";
export { complianceApi as frontendComplianceApi } from "@/lib/frontend-api/compliance";
export { discoveryApi as frontendDiscoveryApi } from "@/lib/frontend-api/discovery";
export {
  docketApi,
  docketApi as frontendDocketApi,
} from "@/lib/frontend-api/docket";
export {
  documentsApi,
  documentsApi as frontendDocumentsApi,
} from "@/lib/frontend-api/documents";
export { hrApi as frontendHrApi } from "@/lib/frontend-api/hr";
export { integrationsApi as frontendIntegrationsApi } from "@/lib/frontend-api/integrations";
export { intelligenceApi as frontendIntelligenceApi } from "@/lib/frontend-api/intelligence";
export { trialApi as frontendTrialApi } from "@/lib/frontend-api/trial";
export { workflowApi as frontendWorkflowApi } from "@/lib/frontend-api/workflow";

// Export types from frontend APIs
export type {
  AuthResponse,
  CaseFilters,
  CaseStats,
  CreateCaseInput,
  DashboardMetrics,
  LoginInput,
  UpdateCaseInput,
} from "@/lib/frontend-api";

// ==================== LEGACY API SERVICES ====================

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
export { discoveryApi } from "./domains/discovery.api";
export { integrationsApi } from "./domains/integrations.api";
export { litigationApi } from "./domains/litigation.api";
export { trialApi } from "./domains/trial.api";
export { workflowApi } from "./domains/workflow.api";
// Note: domains/data-platform.api exports dataPlatformApi (conflicts with data-platform/index.ts)
// export { dataPlatformApi } from './domains/data-platform.api';
export {
  draftingApi,
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
// Use direct imports when needed: import { dataPlatformApi } from '@/lib/frontend-api';
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
import * as dataPlatformDomain from "./domains/data-platform.api";
import * as discoveryDomain from "./domains/discovery.api";
import * as draftingDomain from "./domains/drafting.api";
import * as hrDomain from "./domains/hr.api";
import * as integrationsDomain from "./domains/integrations.api";
import { LegalEntitiesApiService } from "./domains/legal-entities.api";
import * as litigationDomain from "./domains/litigation.api";
import * as trialDomain from "./domains/trial.api";
import * as workflowDomain from "./domains/workflow.api";

export const api = {
  auth: authDomain.authApi.auth,
  users: authDomain.authApi.users,
  apiKeys: authDomain.authApi.apiKeys,
  permissions: authDomain.authApi.permissions,
  ethicalWalls: authDomain.authApi.ethicalWalls,
  tokenBlacklist: authDomain.authApi.tokenBlacklist,
  analytics: analyticsDomain.analyticsApi,
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
  adminAnalytics: adminDomain.adminApi.analytics,
  auditLogs: adminDomain.adminApi.auditLogs,
  versioning: adminDomain.adminApi.versioning,
  sync: adminDomain.adminApi.sync,
  backups: adminDomain.adminApi.backups,
  serviceJobs: adminDomain.adminApi.serviceJobs,
  metrics: adminDomain.adminApi.metrics,
  dataSources: dataPlatformDomain.dataPlatformApi.dataSources,
  rlsPolicies: dataPlatformDomain.dataPlatformApi.rlsPolicies,
  schemaManagement: dataPlatformDomain.dataPlatformApi.schemaManagement,
  queryWorkbench: dataPlatformDomain.dataPlatformApi.queryWorkbench,
  hr: hrDomain.hrApi.hr,
  legalEntities: new LegalEntitiesApiService(),
  drafting: draftingDomain.draftingApi,
} as const;

export default api;
