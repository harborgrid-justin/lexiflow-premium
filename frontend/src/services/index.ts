// services/index.ts - Main barrel export (simplified and organized)
//
// ⚠️ CIRCULAR DEPENDENCY FIX: This file now uses more selective exports to prevent
// circular dependencies. DO NOT export integration handlers or domain services that
// depend on DataService from this barrel.
//
// 📦 RECOMMENDED: Import from focused sub-modules instead:
//
//   import { DataService } from '@/services/data/dataService';       // Data layer
//   import { api, isBackendApiEnabled } from '@/config/network/api.config';  // Backend integration
//   import { UserRepository } from '@/services/data/repositories/UserRepository';  // Specific repositories
//   import { cryptoService } from '@/services/infrastructure/cryptoService';       // Utility services
//   import { GeminiService } from '@/services/features/research/geminiService';    // Feature services
//
// This file remains for backward compatibility. New code should use direct imports.
// ============================================================================

// ==================== CORE INFRASTRUCTURE ====================
export * from "./core/errors"; // Domain error classes

// ==================== ENTERPRISE SERVICE LAYER ====================
// Following ENTERPRISE REACT SERVICES ARCHITECTURE STANDARD
// Services = Capabilities (browser APIs, side effects)
// Frontend APIs = Knowledge (data, domain truth)

// Service Registry & Lifecycle
export {
  BaseService,
  ServiceError,
  ServiceState,
} from "./core/ServiceLifecycle";
export type { IService, ServiceConfig } from "./core/ServiceLifecycle";
export {
  ServiceRegistry,
  getOrCreateService,
  registerService,
} from "./core/ServiceRegistry";

// Bootstrap
export {
  areServicesHealthy,
  getServiceHealth,
  getServiceUptime,
  initializeServices,
  registerServices,
  shutdownServices,
} from "./bootstrap";

// Service Implementations
export { BrowserClipboardService } from "./clipboard/ClipboardService";
export type { ClipboardService } from "./clipboard/ClipboardService";
export { WebCryptoService } from "./crypto/CryptoService";
export type {
  DecryptionResult,
  EncryptionResult,
  CryptoService as ICryptoService,
} from "./crypto/CryptoService";
export { EnvironmentFeatureFlagService } from "./featureFlags/feature-flag.service";
export type { FeatureFlagService } from "./featureFlags/feature-flag.service";
export { BrowserSessionService } from "./session/session.service";
export type {
  SessionEvent,
  SessionListener,
  SessionService,
} from "./session/session.service";
export { BrowserStorageService } from "./storage/storage.service";
export type { StorageOptions, StorageService } from "./storage/storage.service";
export { ConsoleTelemetryService } from "./telemetry/TelemetryService";
export type {
  TelemetryContext,
  TelemetryEvent,
  TelemetryService,
} from "./telemetry/TelemetryService";

// Notification Service
export { BrowserNotificationService } from "./notification/NotificationService";
export type {
  Notification,
  NotificationAction,
  NotificationPriority,
  NotificationService,
  NotificationType,
} from "./notification/NotificationService";

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
export { SyncEngine, type Mutation } from "./data/syncEngine";

// DO NOT export repositories - they cause circular dependencies with db.ts
// Import directly: import { UserRepository } from '@/services/data/repositories/UserRepository';
// All repositories are available via DataService which should be used instead

// ==================== DOMAIN SERVICES ====================
// DO NOT export domain services that depend on DataService or IntegrationOrchestrator
// These cause circular dependencies - import directly instead:
// import { CaseDomain } from '@/services/domain/case.service';
// import { AdminDomain } from '@/services/domain/admin.service';
// import { KnowledgeDomain } from '@/services/domain/knowledge.service';
// import { DataCatalogDomain } from '@/services/domain/data-catalog.service';
// import { DataQualityDomain } from '@/services/domain/data-quality.service';
// import { ProfileDomain } from '@/services/domain/profile.service';
// import { SecurityDomain } from '@/services/domain/security.service';
//
// Safe exports (no dependencies on db.ts, DataService or IntegrationOrchestrator):
export * from "./domain/AnalyticsDomain";
export * from "./domain/BackupDomain";
export * from "./domain/JurisdictionDomain";
export * from "./domain/MarketingDomain";
export * from "./domain/OperationsDomain";

// ==================== BACKEND API SERVICES ====================
// Consolidated backend API services (BACKEND-FIRST as of 2025-12-18)
export * from "./infrastructure/api-client.service";
// NOTE: Commented out full API barrel export to avoid QUERY_KEYS duplicates, Notification type conflicts, Filter type conflicts, and CalendarEvent conflicts
// Individual API services can be imported directly from '@/lib/frontend-api' when needed
// export * from '@/lib/frontend-api';
export { api } from '@/lib/frontend-api'; // Export the consolidated api object
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

// ==================== INTEGRATION & ORCHESTRATION ====================
// DO NOT export integrationOrchestrator or handlers here - they cause circular dependencies
// Import directly: import { IntegrationOrchestrator } from '@/services/integration/integrationOrchestrator';
export * from "./integration/backend-discovery.service";

// ==================== INFRASTRUCTURE SERVICES ====================
export * from "./infrastructure/ai-validation.service";
export * from "./infrastructure/blob-manager.service";
export * from "./infrastructure/chainService";
export * from "./infrastructure/collaboration.service";
export * from "./infrastructure/command-history.service";
export { CryptoService } from "./infrastructure/crypto.service";
export * from "./infrastructure/dateCalculationService";
export * from "./infrastructure/holographic-routing.service";
export * from "./infrastructure/module-registry.service";
// DO NOT export notificationService - causes circular dependencies
// Import directly: import { NotificationService } from '@/services/infrastructure/notificationService';
export * from "./infrastructure/query-client.service";
export * from "./infrastructure/query-keys.service";
export * from "./infrastructure/schemaGenerator";

// ==================== SEARCH SERVICES ====================
export { GraphValidationService } from "./search/graph-validation.service"; // Explicit export to avoid ValidationError conflict with bluebook types
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
export * from "./features/calendar/calendarConflicts";

// Discovery
// DO NOT export - causes circular dependency with db.ts
// Import directly: import { discoveryService } from '@/services/features/discovery/discovery';

// Documents
// DO NOT export - causes circular dependency with db.ts
// Import directly: import { DocumentService } from '@/services/features/documents/documents';
export * from "./features/documents/xmlDocketParser";

// Legal
// DO NOT export - causes circular dependency
// Import directly: import { ruleService } from '@/services/features/legal/legalRules';
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
