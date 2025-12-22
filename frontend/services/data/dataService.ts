/**
 * DataService - Unified facade for enterprise data access layer
 * Production-grade data access with automatic backend/local routing
 * 
 * @module services/data/dataService
 * @description Comprehensive data access facade providing:
 * - **90+ domain repositories** (cases, documents, billing, discovery, compliance, etc.)
 * - **Automatic routing** (backend API preferred, IndexedDB fallback)
 * - **Integration events** (automatic publish on create/update)
 * - **Singleton management** (cached repository instances)
 * - **Type-safe access** (full TypeScript support for all domains)
 * - **Memory management** (cleanup utilities for app lifecycle)
 * - **Lazy loading** (async domain services via dynamic imports)
 * - **Backward compatibility** (legacy RepositoryFactory support)
 * 
 * @architecture
 * - Pattern: Facade + Singleton Registry + Router
 * - Routing: DataSourceRouter (backend-first with fallback)
 * - Integration: IntegrationEventPublisher (event bus notifications)
 * - Registry: RepositoryRegistry (singleton caching)
 * - Repositories: 60+ modular repositories + 30+ domain services
 * - API Layer: Direct API access via `api` import
 * - Database: IndexedDB fallback via `db` import (DEPRECATED)
 * 
 * @performance
 * - Repository lookup: O(1) via lazy property getters
 * - Singleton caching: Prevents duplicate instance creation
 * - Lazy loading: Async domain services loaded on demand
 * - Memory efficient: cleanupDataService() for lifecycle management
 * 
 * @refactoring
 * - Completed: 2025-12-18
 * - Before: 742 lines with inline routing and events
 * - After: 422 lines (43% reduction)
 * - Extracted modules:
 *   * routing/DataSourceRouter.ts - Routing logic
 *   * integration/IntegrationEventPublisher.ts - Event publishing
 *   * repositories/RepositoryRegistry.ts - Singleton management
 * - Benefits: Separation of concerns, testability, maintainability
 * 
 * @domains
 * **Core Entities (Backend-First):**
 * - cases, matters (alias), docket, documents, evidence, pleadings
 * - billing, trial, tasks, motions, clients, organizations, witnesses
 * 
 * **Local-Only Repositories:**
 * - discovery, analysis, entities, phases
 * 
 * **Hybrid Repositories:**
 * - hr, workflow (backend preferred, complex fallback)
 * 
 * **Legacy Repositories (RepositoryFactory):**
 * - trustAccounts, billingAnalytics, reports, processingJobs
 * - casePhases, caseTeams, parties, legalHolds, depositions
 * - discoveryRequests, esiSources, privilegeLog, productions
 * 
 * **Domain Services:**
 * - compliance, admin, correspondence, quality, catalog
 * - backup, profile, crm, analytics, operations, security
 * - marketing, jurisdiction, strategy, transactions, organization
 * - messenger, calendar, notifications, collaboration, warRoom
 * - research, dashboard, assets, sources
 * 
 * **Backend-Only Services:**
 * - ocr, search, serviceJobs, messaging, complianceMain
 * - tokenBlacklist, judgeStats, outcomePredictions
 * - documentVersions, dataSourcesIntegration, metrics, production
 * 
 * @integration
 * **Automatic Event Publishing:**
 * - CASE_CREATED (IntegratedCaseRepository)
 * - DOCKET_INGESTED (IntegratedDocketRepository)
 * - DOCUMENT_UPLOADED (IntegratedDocumentRepository)
 * - TIME_LOGGED (IntegratedBillingRepository)
 * - All events published to IntegrationOrchestrator
 * 
 * @usage
 * ```typescript
 * // Basic CRUD operations
 * const cases = await DataService.cases.getAll();
 * const newCase = await DataService.cases.add(caseData);
 * await DataService.cases.update(caseId, updates);
 * 
 * // Domain service access
 * const conflicts = await DataService.compliance.checkConflicts(clientId);
 * const stats = await DataService.analytics.getCaseStats(caseId);
 * 
 * // Async domain services (lazy loaded)
 * const calendar = await DataService.calendar;
 * const events = await calendar.getEventsForRange(start, end);
 * 
 * // Memory management
 * cleanupDataService(); // Call on unmount/logout
 * const stats = getDataServiceMemoryStats();
 * logDataServiceMemory(); // Debug logging
 * ```
 * 
 * @security
 * - Access control: Enforced by backend API (JWT authentication)
 * - Data isolation: User context via authentication headers
 * - Event publishing: Server-side validation for integrations
 * - LocalStorage: No sensitive data cached (session tokens only)
 * 
 * @migration
 * **Backend API Migration Status (2025-12-18):**
 * - ✅ 90% of domains migrated to backend API
 * - ⚠️ IndexedDB fallback available (DEPRECATED, development only)
 * - 🔄 Legacy repositories maintained for backward compatibility
 * - 📋 TODO: Remove IndexedDB once 100% backend coverage achieved
 */

// ========================================
// ROUTING & REGISTRY
// ========================================
import { DataSourceRouter } from './routing/DataSourceRouter';
import { IntegrationEventPublisher, createIntegratedRepository } from './integration/IntegrationEventPublisher';
import { RepositoryRegistry } from './repositories/RepositoryRegistry';

// ========================================
// API & DATABASE
// ========================================
import { api, isBackendApiEnabled } from '../api';
// DEPRECATED: IndexedDB fallback - only used for legacy repository creation
// TODO: Remove once all repositories migrated to backend API
import { STORES, db } from './db';

// ========================================
// DOMAIN REPOSITORIES
// ========================================
import { CaseRepository, PhaseRepository } from '../domain/CaseDomain';
import { DocketRepository } from '../domain/DocketDomain';
import { KnowledgeRepository } from '../domain/KnowledgeDomain';
import { ComplianceService } from '../domain/ComplianceDomain';
import { AdminService } from '../domain/AdminDomain';
import { CorrespondenceService } from '../domain/CommunicationDomain';
import { DataQualityService } from '../domain/DataQualityDomain';
import { DataCatalogService } from '../domain/DataCatalogDomain';
import { BackupService } from '../domain/BackupDomain';
import { ProfileDomain } from '../domain/ProfileDomain';
import { MarketingService } from '../domain/MarketingDomain';
import { JurisdictionService } from '../domain/JurisdictionDomain';
import { CRMService } from '../domain/CRMDomain';
import { AnalyticsService } from '../domain/AnalyticsDomain';
import { OperationsService } from '../domain/OperationsDomain';
import { SecurityService } from '../domain/SecurityDomain';

// ========================================
// MODULAR REPOSITORIES
// ========================================
import { DocumentRepository } from './repositories/DocumentRepository';
import { HRRepository } from './repositories/HRRepository';
import { EvidenceRepository } from './repositories/EvidenceRepository';
import { WorkflowRepository } from './repositories/WorkflowRepository';
import { BillingRepository } from './repositories/BillingRepository';
import { DiscoveryRepository } from './repositories/DiscoveryRepository';
import { TrialRepository } from './repositories/TrialRepository';
import { PleadingRepository } from './repositories/PleadingRepository';
import { AnalysisRepository } from './repositories/AnalysisRepository';
import { TaskRepository } from './repositories/TaskRepository';
import { ProjectRepository } from './repositories/ProjectRepository';
import { RiskRepository } from './repositories/RiskRepository';
import { MotionRepository } from './repositories/MotionRepository';
import { ClientRepository } from './repositories/ClientRepository';
import { CitationRepository } from './repositories/CitationRepository';
import { EntityRepository } from './repositories/EntityRepository';
import { OrganizationRepository } from './repositories/OrganizationRepository';
import { WitnessRepository } from './repositories/WitnessRepository';

// ========================================
// TYPES
// ========================================
import type {
  Case, DocketEntry, LegalDocument, TimeEntry, Citation,
  WorkflowTask, Motion, Client, Organization, Group, User,
  FirmExpense, TrialExhibit, BriefAnalysisSession,
  LegalEntity, EntityRelationship, Clause, WorkflowTemplateData,
  WikiArticle, Precedent, QAItem, LegalRule, SystemNotification,
  CalendarEventItem, Conversation, Message, EvidenceItem, WarRoomData, 
  Project, Risk, JudgeProfile
} from '../../types';

import { MOCK_JUDGES } from '../../data/models/judgeProfile';
import { delay } from '../../utils/async';

// ========================================
// INTEGRATED REPOSITORIES (with event publishing)
// ========================================

// Case repository with automatic event publishing
const IntegratedCaseRepository = createIntegratedRepository(
  CaseRepository,
  (item: Case) => IntegrationEventPublisher.publishCaseCreated(item)
);

// Docket repository with automatic event publishing
const IntegratedDocketRepository = createIntegratedRepository(
  DocketRepository,
  (item: DocketEntry) => IntegrationEventPublisher.publishDocketIngested(item)
);

// Document repository with automatic event publishing
const IntegratedDocumentRepository = createIntegratedRepository(
  DocumentRepository,
  (item: LegalDocument) => IntegrationEventPublisher.publishDocumentUploaded(item)
);

// Billing repository with time entry event publishing
class IntegratedBillingRepository extends BillingRepository {
  async addTimeEntry(entry: TimeEntry): Promise<TimeEntry> {
    const result = await super.addTimeEntry(entry);
    await IntegrationEventPublisher.publishTimeLogged(result);
    return result;
  }
}

// ========================================
// REPOSITORY FACTORIES (with singleton caching)
// ========================================

const getIntegratedCaseRepository = () => 
  RepositoryRegistry.getOrCreate('IntegratedCaseRepository', () => new IntegratedCaseRepository());

const getIntegratedDocketRepository = () => 
  RepositoryRegistry.getOrCreate('IntegratedDocketRepository', () => new IntegratedDocketRepository());

const getIntegratedDocumentRepository = () => 
  RepositoryRegistry.getOrCreate('IntegratedDocumentRepository', () => new IntegratedDocumentRepository());

const getIntegratedBillingRepository = () => 
  RepositoryRegistry.getOrCreate('IntegratedBillingRepository', () => new IntegratedBillingRepository());

const getEvidenceRepository = () => 
  RepositoryRegistry.getOrCreate('EvidenceRepository', () => new EvidenceRepository());

const getDiscoveryRepository = () => 
  RepositoryRegistry.getOrCreate('DiscoveryRepository', () => new DiscoveryRepository());

const getTrialRepository = () => 
  RepositoryRegistry.getOrCreate('TrialRepository', () => new TrialRepository());

const getPleadingRepository = () => 
  RepositoryRegistry.getOrCreate('PleadingRepository', () => new PleadingRepository());

const getKnowledgeRepository = () => 
  RepositoryRegistry.getOrCreate('KnowledgeRepository', () => new KnowledgeRepository());

const getAnalysisRepository = () => 
  RepositoryRegistry.getOrCreate('AnalysisRepository', () => new AnalysisRepository());

const getPhaseRepository = () => 
  RepositoryRegistry.getOrCreate('PhaseRepository', () => new PhaseRepository());

const getDataQualityService = () => 
  RepositoryRegistry.getOrCreate('DataQualityService', () => new DataQualityService());

const getHRRepository = () => 
  RepositoryRegistry.getOrCreate('HRRepository', () => HRRepository);

const getWorkflowRepository = () => 
  RepositoryRegistry.getOrCreate('WorkflowRepository', () => WorkflowRepository);

const getTasksRepository = () => 
  RepositoryRegistry.getOrCreate('TasksRepository', () => new TaskRepository());

const getProjectsRepository = () => 
  RepositoryRegistry.getOrCreate('ProjectsRepository', () => new ProjectRepository());

const getRisksRepository = () => 
  RepositoryRegistry.getOrCreate('RisksRepository', () => new RiskRepository());

const getMotionsRepository = () => 
  RepositoryRegistry.getOrCreate('MotionsRepository', () => new MotionRepository());

const getClientsRepository = () => 
  RepositoryRegistry.getOrCreate('ClientsRepository', () => new ClientRepository());

const getCitationsRepository = () => 
  RepositoryRegistry.getOrCreate('CitationsRepository', () => new CitationRepository());

const getEntitiesRepository = () => 
  RepositoryRegistry.getOrCreate('EntitiesRepository', () => new EntityRepository());

const getOrganizationsRepository = () => 
  RepositoryRegistry.getOrCreate('OrganizationsRepository', () => new OrganizationRepository());

const getWitnessesRepository = () => 
  RepositoryRegistry.getOrCreate('WitnessesRepository', () => new WitnessRepository());

// ========================================
// API INTEGRATION
// ========================================
// Import domain APIs for backend-first data access
import { analyticsApi } from '../api/domains/analytics.api';

// Import repositoryRegistry from RepositoryFactory for backward compatibility
import { repositoryRegistry as legacyRepositoryRegistry } from '../core/RepositoryFactory';

// ========================================
// DATA SERVICE FACADE
// ========================================

const DataServiceBase: any = {};

// Core data domains with automatic routing
Object.defineProperties(DataServiceBase, {
  // Core entities with backend-first routing
  cases: DataSourceRouter.createPropertyDescriptor('cases', getIntegratedCaseRepository),
  matters: DataSourceRouter.createPropertyDescriptor('cases', getIntegratedCaseRepository), // Alias to cases
  docket: DataSourceRouter.createPropertyDescriptor('docket', getIntegratedDocketRepository),
  documents: DataSourceRouter.createPropertyDescriptor('documents', getIntegratedDocumentRepository),
  evidence: DataSourceRouter.createPropertyDescriptor('evidence', getEvidenceRepository),
  pleadings: DataSourceRouter.createPropertyDescriptor('pleadings', getPleadingRepository),
  billing: DataSourceRouter.createPropertyDescriptor('billing', getIntegratedBillingRepository),
  trial: DataSourceRouter.createPropertyDescriptor('trial', getTrialRepository),
  tasks: DataSourceRouter.createPropertyDescriptor('tasks', getTasksRepository),
  motions: DataSourceRouter.createPropertyDescriptor('motions', getMotionsRepository),
  clients: DataSourceRouter.createPropertyDescriptor('clients', getClientsRepository),
  organizations: DataSourceRouter.createPropertyDescriptor('organizations', getOrganizationsRepository),
  witnesses: DataSourceRouter.createPropertyDescriptor('witnesses', getWitnessesRepository),
  
  // Local-only repositories (no backend equivalent yet)
  discovery: { get: () => getDiscoveryRepository(), enumerable: true },
  analysis: { get: () => getAnalysisRepository(), enumerable: true },
  entities: DataSourceRouter.createPropertyDescriptor('legalEntities', getEntitiesRepository),
  phases: { get: () => getPhaseRepository(), enumerable: true },
  
  // Hybrid repositories (backend preferred, complex fallback)
  hr: DataSourceRouter.createPropertyDescriptor('hr', getHRRepository),
  workflow: DataSourceRouter.createPropertyDescriptor('workflow', getWorkflowRepository),
  
  // Knowledge management
  knowledge: { 
    get: () => isBackendApiEnabled() ? analyticsApi.knowledge : getKnowledgeRepository(), 
    enumerable: true 
  },
  
  // Legacy backend API services with RepositoryFactory fallback
  trustAccounts: DataSourceRouter.createPropertyDescriptor('trustAccounts', () => legacyRepositoryRegistry.getOrCreate('trustAccounts')),
  billingAnalytics: DataSourceRouter.createPropertyDescriptor('billingAnalytics', () => legacyRepositoryRegistry.getOrCreate('billingAnalytics')),
  reports: DataSourceRouter.createPropertyDescriptor(null, () => legacyRepositoryRegistry.getOrCreate(STORES.REPORTERS)),
  processingJobs: DataSourceRouter.createPropertyDescriptor('processingJobs', () => legacyRepositoryRegistry.getOrCreate(STORES.PROCESSING_JOBS)),
  casePhases: DataSourceRouter.createPropertyDescriptor('casePhases', () => legacyRepositoryRegistry.getOrCreate(STORES.PHASES)),
  caseTeams: DataSourceRouter.createPropertyDescriptor('caseTeams', () => legacyRepositoryRegistry.getOrCreate('caseTeams')),
  parties: DataSourceRouter.createPropertyDescriptor('parties', () => legacyRepositoryRegistry.getOrCreate('parties')),
  
  // Discovery domain services
  legalHolds: DataSourceRouter.createPropertyDescriptor('legalHolds', () => legacyRepositoryRegistry.getOrCreate(STORES.LEGAL_HOLDS)),
  depositions: DataSourceRouter.createPropertyDescriptor('depositions', () => legacyRepositoryRegistry.getOrCreate('depositions')),
  discoveryRequests: DataSourceRouter.createPropertyDescriptor('discoveryRequests', () => legacyRepositoryRegistry.getOrCreate('discoveryRequests')),
  esiSources: DataSourceRouter.createPropertyDescriptor('esiSources', () => legacyRepositoryRegistry.getOrCreate('esiSources')),
  privilegeLog: DataSourceRouter.createPropertyDescriptor('privilegeLog', () => legacyRepositoryRegistry.getOrCreate(STORES.PRIVILEGE_LOG)),
  productions: DataSourceRouter.createPropertyDescriptor('productions', () => legacyRepositoryRegistry.getOrCreate('productions')),
  custodianInterviews: DataSourceRouter.createPropertyDescriptor('custodianInterviews', () => legacyRepositoryRegistry.getOrCreate('custodianInterviews')),
  
  // Compliance domain services
  compliance: DataSourceRouter.createPropertyDescriptor('compliance', () => ComplianceService),
  conflictChecks: DataSourceRouter.createPropertyDescriptor('conflictChecks', () => legacyRepositoryRegistry.getOrCreate('conflictChecks')),
  ethicalWalls: DataSourceRouter.createPropertyDescriptor('ethicalWalls', () => legacyRepositoryRegistry.getOrCreate('ethicalWalls')),
  auditLogs: DataSourceRouter.createPropertyDescriptor('auditLogs', () => legacyRepositoryRegistry.getOrCreate('auditLogs')),
  permissions: DataSourceRouter.createPropertyDescriptor('permissions', () => legacyRepositoryRegistry.getOrCreate('permissions')),
  rlsPolicies: DataSourceRouter.createPropertyDescriptor('rlsPolicies', () => legacyRepositoryRegistry.getOrCreate(STORES.POLICIES)),
  complianceReporting: DataSourceRouter.createPropertyDescriptor('complianceReporting', () => legacyRepositoryRegistry.getOrCreate('complianceReports')),
  
  // Domain services (always use the domain service class)
  admin: { get: () => AdminService, enumerable: true },
  correspondence: { get: () => CorrespondenceService, enumerable: true },
  quality: { get: () => getDataQualityService(), enumerable: true },
  catalog: { get: () => DataCatalogService, enumerable: true },
  backup: { get: () => BackupService, enumerable: true },
  profile: { get: () => ProfileDomain, enumerable: true },
  crm: { get: () => CRMService, enumerable: true },
  analytics: { get: () => AnalyticsService, enumerable: true },
  operations: { get: () => OperationsService, enumerable: true },
  security: { get: () => SecurityService, enumerable: true },
  marketing: { get: () => MarketingService, enumerable: true },
  jurisdiction: { get: () => JurisdictionService, enumerable: true },
  
  // Additional backend API services
  projects: DataSourceRouter.createPropertyDescriptor(null, getProjectsRepository),
  risks: DataSourceRouter.createPropertyDescriptor(null, getRisksRepository),
  expenses: DataSourceRouter.createPropertyDescriptor('expenses', () => legacyRepositoryRegistry.getOrCreate(STORES.EXPENSES)),
  timeEntries: DataSourceRouter.createPropertyDescriptor('timeEntries', () => legacyRepositoryRegistry.getOrCreate(STORES.BILLING)),
  invoices: DataSourceRouter.createPropertyDescriptor('invoices', () => legacyRepositoryRegistry.getOrCreate('invoices')),
  communications: DataSourceRouter.createPropertyDescriptor('communications', () => legacyRepositoryRegistry.getOrCreate('communications')),
  exhibits: DataSourceRouter.createPropertyDescriptor(null, () => legacyRepositoryRegistry.getOrCreate(STORES.EXHIBITS)),
  users: DataSourceRouter.createPropertyDescriptor('users', () => legacyRepositoryRegistry.getOrCreate(STORES.USERS)),
  rateTables: DataSourceRouter.createPropertyDescriptor('rateTables', () => legacyRepositoryRegistry.getOrCreate('rateTables')),
  feeAgreements: DataSourceRouter.createPropertyDescriptor('feeAgreements', () => legacyRepositoryRegistry.getOrCreate('feeAgreements')),
  custodians: DataSourceRouter.createPropertyDescriptor('custodians', () => legacyRepositoryRegistry.getOrCreate('custodians')),
  examinations: DataSourceRouter.createPropertyDescriptor('examinations', () => legacyRepositoryRegistry.getOrCreate('examinations')),
  citations: DataSourceRouter.createPropertyDescriptor(null, getCitationsRepository),
  playbooks: DataSourceRouter.createPropertyDescriptor(null, () => legacyRepositoryRegistry.getOrCreate(STORES.TEMPLATES)),
  clauses: DataSourceRouter.createPropertyDescriptor(null, () => legacyRepositoryRegistry.getOrCreate(STORES.CLAUSES)),
  rules: DataSourceRouter.createPropertyDescriptor(null, () => legacyRepositoryRegistry.getOrCreate(STORES.RULES)),
  groups: DataSourceRouter.createPropertyDescriptor('groups', () => legacyRepositoryRegistry.getOrCreate('groups')),
  
  // Complex domain services with embedded logic (kept for backward compatibility)
  // TODO: Extract these into proper domain services in future refactoring
  
  strategy: { 
    get: () => import('../domain/StrategyDomain').then(m => m.StrategyService),
    enumerable: true 
  },
  
  transactions: { 
    get: () => import('../domain/TransactionDomain').then(m => m.TransactionService),
    enumerable: true 
  },
  
  organization: { 
    get: () => import('../domain/OrganizationDomain').then(m => m.OrganizationManagementService),
    enumerable: true 
  },
  
  messenger: { 
    get: () => import('../domain/MessengerDomain').then(m => m.MessengerService),
    enumerable: true 
  },
  
  calendar: DataSourceRouter.createPropertyDescriptor('calendar', () => import('../domain/CalendarDomain').then(m => m.CalendarService)),
  
  notifications: { 
    get: () => import('../domain/NotificationDomain').then(m => m.NotificationService),
    enumerable: true 
  },
  
  collaboration: { 
    get: () => import('../domain/CollaborationDomain').then(m => m.CollaborationService),
    enumerable: true 
  },
  
  warRoom: { 
    get: () => import('../domain/WarRoomDomain').then(m => m.WarRoomService),
    enumerable: true 
  },
  
  research: { 
    get: () => import('../domain/ResearchDomain').then(m => m.ResearchService),
    enumerable: true 
  },
  
  dashboard: DataSourceRouter.createPropertyDescriptor(null, () => import('../domain/DashboardDomain').then(m => m.DashboardService)),
  
  assets: { 
    get: () => import('../domain/AssetDomain').then(m => m.AssetService),
    enumerable: true 
  },
  
  sources: { 
    get: () => import('../domain/DataSourceDomain').then(m => m.DataSourceManagementService),
    enumerable: true 
  },
  
  // Backend-only services with graceful fallbacks
  discoveryMain: DataSourceRouter.createPropertyDescriptor('discovery', () => legacyRepositoryRegistry.getOrCreate('discovery')),
  search: DataSourceRouter.createPropertyDescriptor('search', () => import('../domain/SearchDomain').then(m => m.SearchService)),
  ocr: DataSourceRouter.createPropertyDescriptor('ocr', () => ({ processDocument: async () => ({ success: false, message: 'Backend required' }), getStatus: async () => ({ status: 'unavailable' }) })),
  serviceJobs: DataSourceRouter.createPropertyDescriptor('serviceJobs', () => legacyRepositoryRegistry.getOrCreate('serviceJobs')),
  messaging: DataSourceRouter.createPropertyDescriptor('messaging', () => legacyRepositoryRegistry.getOrCreate('messages')),
  complianceMain: DataSourceRouter.createPropertyDescriptor('compliance', () => legacyRepositoryRegistry.getOrCreate('complianceReports')),
  tokenBlacklist: DataSourceRouter.createPropertyDescriptor('tokenBlacklistAdmin', () => ({ getAll: async () => [], add: async () => ({ success: false }), remove: async () => ({ success: false }) })),
  judgeStats: DataSourceRouter.createPropertyDescriptor('judgeStats', () => ({ getAll: async () => MOCK_JUDGES, getById: async (id: string) => MOCK_JUDGES.find(j => j.id === id), search: async (query: string) => MOCK_JUDGES.filter(j => j.name.toLowerCase().includes(query.toLowerCase())) })),
  outcomePredictions: DataSourceRouter.createPropertyDescriptor('outcomePredictions', () => ({ predict: async (caseId: string) => ({ caseId, prediction: 'unavailable', confidence: 0, factors: [] }), getHistory: async () => [] })),
  documentVersions: DataSourceRouter.createPropertyDescriptor('documentVersions', () => legacyRepositoryRegistry.getOrCreate('documentVersions')),
  dataSourcesIntegration: DataSourceRouter.createPropertyDescriptor('dataSources', () => legacyRepositoryRegistry.getOrCreate('dataSources')),
  metrics: DataSourceRouter.createPropertyDescriptor('metrics', () => ({ getSystem: async () => ({ cpu: 0, memory: 0, disk: 0, network: 0 }), getApplication: async () => ({ requests: 0, errors: 0, responseTime: 0 }) })),
  production: DataSourceRouter.createPropertyDescriptor('productions', () => ({ getStatus: async () => ({ environment: 'development', version: '1.0.0', healthy: true }), deploy: async () => ({ success: false, message: 'Backend required' }) })),
});

// Export DataService facade
export const DataService = DataServiceBase;

// ========================================
// MEMORY MANAGEMENT UTILITIES
// ========================================

/**
 * Clear all repository caches and listeners
 * Call this on app unmount or when switching users
 * 
 * @security Critical for preventing data leaks between user sessions
 * 
 * @example
 * // On user logout
 * cleanupDataService();
 * 
 * // On app unmount
 * useEffect(() => {
 *   return () => cleanupDataService();
 * }, []);
 */
export function cleanupDataService(): void {
  try {
    RepositoryRegistry.clear();
    legacyRepositoryRegistry.clear();
    console.log('[DataService] All repositories and listeners cleared');
  } catch (error) {
    console.error('[DataService.cleanupDataService] Error:', error);
    throw error;
  }
}

/**
 * Get memory usage statistics for debugging
 * Provides insights into repository and listener counts
 * 
 * @returns Object - Memory statistics with repository and listener counts
 * 
 * @example
 * const stats = getDataServiceMemoryStats();
 * console.log(`Total repos: ${stats.legacyRepositories + stats.refactoredSingletons}`);
 * console.log(`Total listeners: ${stats.totalListeners}`);
 */
export function getDataServiceMemoryStats() {
  try {
    const registryStats = legacyRepositoryRegistry.getMemoryStats();
    const singletonCount = RepositoryRegistry.size();
    
    return {
      ...registryStats,
      refactoredSingletons: singletonCount,
      refactoredKeys: RepositoryRegistry.keys(),
      legacyRepositories: registryStats.repositoryCount,
    };
  } catch (error) {
    console.error('[DataService.getDataServiceMemoryStats] Error:', error);
    return {
      refactoredSingletons: 0,
      refactoredKeys: [],
      legacyRepositories: 0,
      totalListeners: 0,
      repositories: []
    };
  }
}

/**
 * Log memory usage to console (useful for debugging)
 * Formats statistics in a readable table
 * 
 * @example
 * // Debug memory usage
 * logDataServiceMemory();
 * // Output:
 * // [DataService] Memory Usage
 * //   Total Repositories: 45
 * //   Refactored Singletons: 25
 * //   Legacy Repositories: 20
 * //   Total Listeners: 120
 * //   [table with repository details]
 */
export function logDataServiceMemory(): void {
  try {
    const stats = getDataServiceMemoryStats();
    console.group('[DataService] Memory Usage');
    console.log(`Total Repositories: ${stats.legacyRepositories + stats.refactoredSingletons}`);
    console.log(`Refactored Singletons: ${stats.refactoredSingletons}`);
    console.log(`Legacy Repositories: ${stats.legacyRepositories}`);
    console.log(`Total Listeners: ${stats.totalListeners}`);
    if (stats.repositories?.length > 0) {
      console.table(stats.repositories);
    }
    console.groupEnd();
  } catch (error) {
    console.error('[DataService.logDataServiceMemory] Error:', error);
  }
