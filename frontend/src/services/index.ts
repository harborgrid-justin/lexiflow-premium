// services/index.ts - Main barrel export (simplified and organized)

// ==================== CORE INFRASTRUCTURE ====================
export * from './core/Repository';
export * from './core/microORM';
export * from './core/RepositoryFactory';
export * from './core/errors';  // Domain error classes

// ==================== INFRASTRUCTURE ADAPTERS ====================
export * from './infrastructure/adapters/StorageAdapter';
export * from './infrastructure/adapters/WindowAdapter';

// ==================== DATA LAYER ====================
export * from './data/dataService';
export * from './data/db';
export * from './data/dbSeeder';
export * from './data/syncEngine';

// Export individual repositories
export * from './data/repositories/AnalysisRepository';
export * from './data/repositories/BillingRepository';
export * from './data/repositories/CitationRepository';
export * from './data/repositories/ClauseRepository';
export * from './data/repositories/ClientRepository';
export * from './data/repositories/DiscoveryRepository';
export * from './data/repositories/DocumentRepository';
export * from './data/repositories/EntityRepository';
export * from './data/repositories/EvidenceRepository';
export * from './data/repositories/ExhibitRepository';
export * from './data/repositories/ExpenseRepository';
export * from './data/repositories/HRRepository';
export * from './data/repositories/MatterRepository';
export * from './data/repositories/MotionRepository';
export * from './data/repositories/OrganizationRepository';
export * from './data/repositories/PleadingRepository';
export * from './data/repositories/ProjectRepository';
export * from './data/repositories/RiskRepository';
export * from './data/repositories/RuleRepository';
export * from './data/repositories/TaskRepository';
export * from './data/repositories/TemplateRepository';
export * from './data/repositories/TrialRepository';
export * from './data/repositories/UserRepository';
export * from './data/repositories/WitnessRepository';
export * from './data/repositories/WorkflowRepository';

// ==================== DOMAIN SERVICES ====================
export * from './domain/AdminDomain';
export * from './domain/AnalyticsDomain';
export * from './domain/BackupDomain';
// export * from './domain/BillingDomain';  // Removed - BillingRepository duplicate with ./data/repositories/BillingRepository, BILLING_QUERY_KEYS duplicate with ./api/billing-api
export * from './domain/CaseDomain';
export * from './domain/CommunicationDomain';
export * from './domain/ComplianceDomain';
export * from './domain/CRMDomain';
export * from './domain/DataCatalogDomain';
export * from './domain/DataQualityDomain';
export { type DocketEntryWithVersion, DocketRepository } from './domain/DocketDomain';  // Explicit export to avoid VersionConflictError duplicate with PleadingRepository
export * from './domain/JurisdictionDomain';
export * from './domain/KnowledgeDomain';
export * from './domain/MarketingDomain';
export * from './domain/OperationsDomain';
export * from './domain/ProfileDomain';
export * from './domain/SecurityDomain';

// ==================== BACKEND API SERVICES ====================
// Consolidated backend API services (BACKEND-FIRST as of 2025-12-18)
export * from './infrastructure/apiClient';
// NOTE: Commented out full API barrel export to avoid QUERY_KEYS duplicates, Notification type conflicts, Filter type conflicts, and CalendarEvent conflicts
// Individual API services can be imported directly from '@/api' when needed
// export * from '@/api';
export { api } from '@/api';  // Export the consolidated api object
export {
  isBackendApiEnabled,
  isIndexedDBMode,
  getDataMode,
  forceBackendMode,
  enableLegacyIndexedDB,
  isProduction,
  getBackendUrl,
  logApiConfig
} from './integration/apiConfig';

// ==================== INTEGRATION & ORCHESTRATION ====================
export * from './integration/integrationOrchestrator';
export * from './integration/backendDiscovery';

// ==================== INFRASTRUCTURE SERVICES ====================
export * from './infrastructure/blobManager';
export * from './infrastructure/chainService';
export * from './infrastructure/commandHistory';
export * from './infrastructure/cryptoService';
export * from './infrastructure/dateCalculationService';
export * from './infrastructure/holographicRouting';
export * from './infrastructure/moduleRegistry';
export * from './infrastructure/notificationService';
export * from './infrastructure/queryClient';
export * from './infrastructure/queryKeys';
export * from './infrastructure/schemaGenerator';
export * from './infrastructure/aiValidationService';
export * from './infrastructure/collaborationService';

// ==================== SEARCH SERVICES ====================
export * from './search/searchService';
export * from './search/searchWorker';
export { GraphValidationService } from './search/graphValidationService';  // Explicit export to avoid ValidationError conflict with bluebook types

// ==================== WORKERS ====================
export * from './workers/cryptoWorker';
export * from './workers/workerPool';

// ==================== FEATURE SERVICES ====================
// Analysis
export * from './features/analysis/analysisEngine';

// Calendar
export * from './features/calendar/calendarConflictService';

// Discovery
export * from './features/discovery/discoveryService';
export * from './features/discovery/fallbackDocketParser';

// Documents
export * from './features/documents/documentService';
export * from './features/documents/xmlDocketParser';

// Legal
export * from './features/legal/ruleService';
export * from './features/legal/deadlineEngine';

// Research
export * from './features/research/geminiService';

// Bluebook (keep organized exports)
export * from './features/bluebook';

// ==================== AI SERVICES ====================
export * from './ai/prompts';
export * from './ai/schemas';

// ==================== VALIDATION ====================
// Validation schemas are not re-exported here to avoid barrel file bloat
// Import directly from './validation/*Schemas' when needed
