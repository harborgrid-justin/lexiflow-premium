/**
 * Module Loading Order Constants
 * Defines the order in which modules should be loaded to respect dependencies
 *
 * Priority levels:
 * - 0-9: Core infrastructure (Config, Database, etc.)
 * - 10-19: Security and authentication
 * - 20-29: Authorization and compliance
 * - 30-39: Monitoring and performance
 * - 40-49: API security and rate limiting
 * - 50-99: Business logic modules
 * - 100+: Optional/addon modules
 */

export enum ModulePriority {
  // Core Infrastructure (Priority 0-9)
  CONFIGURATION = 0,
  DATABASE = 1,
  COMMON = 2,
  ERRORS = 3,

  // Security & Authentication (Priority 10-19)
  SECURITY = 10,
  AUTH = 11,
  USERS = 12,
  JWT = 13,

  // Authorization & Compliance (Priority 20-29)
  AUTHORIZATION = 20,
  COMPLIANCE = 21,
  API_KEYS = 22,

  // Monitoring & Performance (Priority 30-39)
  MONITORING = 30,
  HEALTH = 31,
  PERFORMANCE = 32,
  TELEMETRY = 33,

  // API Security & Protection (Priority 40-49)
  API_SECURITY = 40,
  RATE_LIMITING = 41,

  // Queue & Events (Priority 50-59)
  QUEUES = 50,
  EVENTS = 51,
  REALTIME = 52,

  // Business Logic Modules (Priority 60-99)
  BUSINESS_LOGIC = 60,

  // Optional/Addon Modules (Priority 100+)
  OPTIONAL = 100,
}

/**
 * Module dependency graph
 * Maps each module to its dependencies
 */
export const MODULE_DEPENDENCIES = {
  // Core modules have no dependencies
  Configuration: [],
  Database: ['Configuration'],
  Common: ['Configuration'],
  Errors: ['Configuration', 'Common'],

  // Security depends on core
  Security: ['Configuration', 'Common', 'Database'],
  Auth: ['Configuration', 'Database', 'Security', 'Users'],
  Users: ['Configuration', 'Database', 'Security'],

  // Authorization depends on auth
  Authorization: ['Auth', 'Users', 'Database'],
  Compliance: ['Auth', 'Users', 'Database', 'Authorization'],
  ApiKeys: ['Auth', 'Users', 'Database'],

  // Monitoring can depend on almost everything
  Monitoring: ['Configuration', 'Database', 'Auth'],
  Health: ['Configuration', 'Database'],
  Performance: ['Configuration', 'Database'],
  Telemetry: ['Configuration'],

  // API Security
  ApiSecurity: ['Auth', 'ApiKeys', 'RateLimiting'],

  // Queues and events
  Queues: ['Configuration', 'Database'],
  Events: ['Configuration'],
  Realtime: ['Auth', 'Events'],

  // Business modules depend on infrastructure
  Cases: ['Auth', 'Users', 'Database', 'FileStorage'],
  Documents: ['Auth', 'Users', 'Database', 'FileStorage'],
  Billing: ['Auth', 'Users', 'Database', 'Cases'],
  // ... other business modules
} as const;

/**
 * Module initialization order based on dependencies
 * Modules are listed in the order they should be initialized
 */
export const MODULE_INITIALIZATION_ORDER = [
  // Phase 1: Core Infrastructure
  'Configuration',
  'Database',
  'Common',
  'Errors',

  // Phase 2: Security & Authentication
  'Security',
  'Users',
  'Auth',

  // Phase 3: Authorization & Compliance
  'Authorization',
  'Compliance',
  'ApiKeys',

  // Phase 4: Monitoring & Performance
  'Monitoring',
  'Health',
  'Performance',
  'Telemetry',

  // Phase 5: API Security & Protection
  'ApiSecurity',

  // Phase 6: Queue & Events
  'Queues',
  'Events',
  'Realtime',

  // Phase 7: Business Logic Modules (alphabetical within priority)
  'Analytics',
  'AnalyticsDashboard',
  'Backups',
  'Billing',
  'Bluebook',
  'Calendar',
  'Cases',
  'CasePhases',
  'CaseTeams',
  'Citations',
  'Clauses',
  'Clients',
  'Communications',
  'Discovery',
  'Docket',
  'Documents',
  'DocumentVersions',
  'Drafting',
  'Evidence',
  'Exhibits',
  'FileStorage',
  'GraphQL',
  'HR',
  'Integrations',
  'Jurisdictions',
  'Knowledge',
  'LegalEntities',
  'Matters',
  'Messenger',
  'Metrics',
  'Motions',
  'Ocr',
  'Organizations',
  'Parties',
  'Pipelines',
  'Pleadings',
  'ProcessingJobs',
  'Production',
  'Projects',
  'QueryWorkbench',
  'Reports',
  'Risks',
  'SchemaManagement',
  'Search',
  'Sync',
  'Tasks',
  'Trial',
  'Versioning',
  'WarRoom',
  'Webhooks',
  'Workflow',
  'AiOps',
  'AiDataops',
] as const;

/**
 * Modules that are critical for application startup
 * Application will not start if any of these fail
 */
export const CRITICAL_MODULES = [
  'Configuration',
  'Database',
  'Common',
  'Security',
  'Auth',
  'Users',
] as const;

/**
 * Modules that can fail without preventing startup
 * These are logged as warnings but don't block the application
 */
export const OPTIONAL_MODULES = [
  'Telemetry',
  'AiOps',
  'AiDataops',
  'Integrations',
  'Webhooks',
] as const;

/**
 * Module shutdown order (reverse of initialization)
 */
export const MODULE_SHUTDOWN_ORDER = [...MODULE_INITIALIZATION_ORDER].reverse();

/**
 * Timeout for each module initialization (milliseconds)
 */
export const MODULE_INIT_TIMEOUT = 30000; // 30 seconds

/**
 * Timeout for each module shutdown (milliseconds)
 */
export const MODULE_SHUTDOWN_TIMEOUT = 15000; // 15 seconds

/**
 * Maximum number of parallel module initializations
 */
export const MAX_PARALLEL_INIT = 3;
