// =============================================================================
// FEATURE FLAGS CONFIGURATION
// =============================================================================
// Feature toggles for enabling/disabling functionality

export const FEATURE_HOLOGRAPHIC_ROUTING = true;
export const FEATURE_OFFLINE_MODE = true;
export const FEATURE_REALTIME_COLLABORATION = true;
export const FEATURE_ADVANCED_SEARCH = true;
export const FEATURE_DOCUMENT_COMPARISON = true;
export const FEATURE_CASE_TIMELINE = true;
export const FEATURE_CONFLICT_CHECKING = true;
export const FEATURE_TIME_TRACKING = true;
export const FEATURE_TRUST_ACCOUNTING = true;
export const FEATURE_CALENDAR_INTEGRATION = true;
export const FEATURE_EMAIL_INTEGRATION = false;
export const FEATURE_MOBILE_APP = false;
export const FEATURE_CLIENT_PORTAL = true;
export const FEATURE_LEGAL_RESEARCH = true;
export const FEATURE_AI_ASSISTANCE = true;
export const FEATURE_WORKFLOW_AUTOMATION = true;
export const FEATURE_CUSTOM_FIELDS = true;
export const FEATURE_BULK_OPERATIONS = true;
export const FEATURE_EXPORT_IMPORT = true;
export const FEATURE_BACKUP_RESTORE = true;

// Development & Debugging
import { getAppEnv } from '../app.config';

export const getDebugEnabled = () => getAppEnv() === 'development';
export const DEBUG_ENABLED = getAppEnv() === 'development';
export const DEBUG_SHOW_QUERY_CACHE = true;
export const DEBUG_API_SIMULATION_DELAY_MS = 1000; // Simulated API delay for demos
export const DEBUG_SHOW_RENDER_COUNT = true;
export const DEBUG_SHOW_PERFORMANCE = false;
export const DEBUG_LOG_API_CALLS = false;
export const DEBUG_LOG_STATE_CHANGES = false;
export const ENABLE_REACT_DEVTOOLS = getAppEnv() === 'development';

// Export as object
export const FEATURES_CONFIG = {
  holographicRouting: FEATURE_HOLOGRAPHIC_ROUTING,
  offlineMode: FEATURE_OFFLINE_MODE,
  realtimeCollaboration: FEATURE_REALTIME_COLLABORATION,
  advancedSearch: FEATURE_ADVANCED_SEARCH,
  documentComparison: FEATURE_DOCUMENT_COMPARISON,
  caseTimeline: FEATURE_CASE_TIMELINE,
  conflictChecking: FEATURE_CONFLICT_CHECKING,
  timeTracking: FEATURE_TIME_TRACKING,
  trustAccounting: FEATURE_TRUST_ACCOUNTING,
  calendarIntegration: FEATURE_CALENDAR_INTEGRATION,
  emailIntegration: FEATURE_EMAIL_INTEGRATION,
  mobileApp: FEATURE_MOBILE_APP,
  clientPortal: FEATURE_CLIENT_PORTAL,
  legalResearch: FEATURE_LEGAL_RESEARCH,
  aiAssistance: FEATURE_AI_ASSISTANCE,
  workflowAutomation: FEATURE_WORKFLOW_AUTOMATION,
  customFields: FEATURE_CUSTOM_FIELDS,
  bulkOperations: FEATURE_BULK_OPERATIONS,
  exportImport: FEATURE_EXPORT_IMPORT,
  backupRestore: FEATURE_BACKUP_RESTORE,
} as const;

export const DEBUG_CONFIG = {
  enabled: DEBUG_ENABLED,
  showQueryCache: DEBUG_SHOW_QUERY_CACHE,
  apiSimulationDelayMs: DEBUG_API_SIMULATION_DELAY_MS,
  showRenderCount: DEBUG_SHOW_RENDER_COUNT,
  showPerformance: DEBUG_SHOW_PERFORMANCE,
  logApiCalls: DEBUG_LOG_API_CALLS,
  logStateChanges: DEBUG_LOG_STATE_CHANGES,
  enableReactDevtools: ENABLE_REACT_DEVTOOLS,
} as const;
