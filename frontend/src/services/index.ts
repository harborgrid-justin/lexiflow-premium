// services/index.ts - Main barrel export (simplified and organized)
//
// ⚠️ CIRCULAR DEPENDENCY FIX: This file now uses more selective exports to prevent
// circular dependencies. DO NOT export integration handlers or domain services that
// depend on DataService from this barrel.
//
// 📦 RECOMMENDED: Import from focused sub-modules instead:
//
//   import { DataService } from '@/services/data/dataService';       // Data layer
//   import { api, isBackendApiEnabled } from '@/services/integration/apiConfig';  // Backend integration
//   import { UserRepository } from '@/services/data/repositories/UserRepository';  // Specific repositories
//   import { cryptoService } from '@/services/infrastructure/cryptoService';       // Utility services
//   import { GeminiService } from '@/services/features/research/geminiService';    // Feature services
//
// This file remains for backward compatibility. New code should use direct imports.
// ============================================================================

// ==================== CORE INFRASTRUCTURE ====================
export * from "./core/errors"; // Domain error classes
// DO NOT export microORM - it causes circular dependencies with db.ts
// Import directly: import { microORM } from '@/services/core/microORM';
// DO NOT export Repository - it imports microORM which causes circular dependencies
// Import directly: import { Repository } from '@/services/core/Repository';
// DO NOT export RepositoryFactory - it imports Repository which imports microORM
// Import directly: import { createRepository } from '@/services/core/RepositoryFactory';

// ==================== INFRASTRUCTURE ADAPTERS ====================
export * from "./infrastructure/adapters/StorageAdapter";
export * from "./infrastructure/adapters/WindowAdapter";

// ==================== DATA LAYER ====================
// DO NOT export dataService here - it causes circular dependencies
// Import directly: import { DataService } from '@/services/data/dataService';
// DO NOT export db here - it causes circular dependencies with microORM and dbSeeder
// Import directly: import { db } from '@/services/data/db';
// export * from "./data/db";
// export * from "./data/dbSeeder";
export * from "./data/syncEngine";

// DO NOT export repositories - they cause circular dependencies with db.ts
// Import directly: import { UserRepository } from '@/services/data/repositories/UserRepository';
// All repositories are available via DataService which should be used instead

// ==================== DOMAIN SERVICES ====================
// DO NOT export domain services that depend on DataService or IntegrationOrchestrator
// These cause circular dependencies - import directly instead:
// import { CaseDomain } from '@/services/domain/CaseDomain';
// import { AdminDomain } from '@/services/domain/AdminDomain';
// import { KnowledgeDomain } from '@/services/domain/KnowledgeDomain';
// import { DataCatalogDomain } from '@/services/domain/DataCatalogDomain';
// import { DataQualityDomain } from '@/services/domain/DataQualityDomain';
// import { ProfileDomain } from '@/services/domain/ProfileDomain';
// import { SecurityDomain } from '@/services/domain/SecurityDomain';
//
// Safe exports (no dependencies on db.ts, DataService or IntegrationOrchestrator):
export * from "./domain/AnalyticsDomain";
export * from "./domain/BackupDomain";
export * from "./domain/JurisdictionDomain";
export * from "./domain/MarketingDomain";
export * from "./domain/OperationsDomain";

// ==================== BACKEND API SERVICES ====================
// Consolidated backend API services (BACKEND-FIRST as of 2025-12-18)
export * from "./infrastructure/apiClient";
// NOTE: Commented out full API barrel export to avoid QUERY_KEYS duplicates, Notification type conflicts, Filter type conflicts, and CalendarEvent conflicts
// Individual API services can be imported directly from '@/api' when needed
// export * from '@/api';
export { api } from "@/api"; // Export the consolidated api object
export {
  enableLegacyIndexedDB,
  forceBackendMode,
  getBackendUrl,
  getDataMode,
  isBackendApiEnabled,
  isIndexedDBMode,
  isProduction,
  logApiConfig,
} from "./integration/apiConfig";

// ==================== INTEGRATION & ORCHESTRATION ====================
// DO NOT export integrationOrchestrator or handlers here - they cause circular dependencies
// Import directly: import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
export * from "./integration/backendDiscovery";

// ==================== INFRASTRUCTURE SERVICES ====================
export * from "./infrastructure/aiValidationService";
export * from "./infrastructure/blobManager";
export * from "./infrastructure/chainService";
export * from "./infrastructure/collaborationService";
export * from "./infrastructure/commandHistory";
export * from "./infrastructure/cryptoService";
export * from "./infrastructure/dateCalculationService";
export * from "./infrastructure/holographicRouting";
export * from "./infrastructure/moduleRegistry";
// DO NOT export notificationService - causes circular dependencies
// Import directly: import { NotificationService } from '@/services/infrastructure/notificationService';
export * from "./infrastructure/queryClient";
export * from "./infrastructure/queryKeys";
export * from "./infrastructure/schemaGenerator";

// ==================== SEARCH SERVICES ====================
export { GraphValidationService } from "./search/graphValidationService"; // Explicit export to avoid ValidationError conflict with bluebook types
// DO NOT export searchService - causes circular dependencies
// Import directly: import { searchService } from '@/services/search/searchService';
export * from "./search/searchWorker";

// ==================== WORKERS ====================
export * from "./workers/cryptoWorker";
export * from "./workers/workerPool";

// ==================== FEATURE SERVICES ====================
// Analysis
export * from "./features/analysis/analysisEngine";

// Calendar
export * from "./features/calendar/calendarConflictService";

// Discovery
// DO NOT export - causes circular dependency with db.ts
// Import directly: import { discoveryService } from '@/services/features/discovery/discoveryService';

// Documents
// DO NOT export - causes circular dependency with db.ts
// Import directly: import { DocumentService } from '@/services/features/documents/documentService';
export * from "./features/documents/xmlDocketParser";

// Legal
// DO NOT export - causes circular dependency
// Import directly: import { ruleService } from '@/services/features/legal/ruleService';
// Heavy service - import directly when needed: import { DeadlineEngine } from '@/services/features-services';
// export * from './features/legal/deadlineEngine';

// Research
// Heavy service with Gemini SDK - import directly when needed: import { GeminiService } from '@/services/features-services';
export * from "./features/research/geminiService";

// Bluebook (keep organized exports)
export * from "./features/bluebook";

// ==================== AI SERVICES ====================
export * from "./ai/prompts";
export * from "./ai/schemas";

// ==================== VALIDATION ====================
// Validation schemas are not re-exported here to avoid barrel file bloat
// Import directly from './validation/*Schemas' when needed
