// config/index.ts
/**
 * Config Module Barrel Export
 *
 * Central export point for all configuration modules.
 *
 * NOTE: Wildcard exports from master.config removed to prevent circular dependencies.
 * Import specific constants directly from source files:
 * - import { FORM_AUTO_SAVE_DELAY_MS } from '@/config/features/forms.config';
 * - import { APP_NAME } from '@/config/app.config';
 * - import { WINDOW_MAX_INSTANCES } from '@/config/features/contexts.config';
 */

// Core configuration objects - safe named exports
export { CONFIG } from './master.config';
export { PATHS, type AppPath } from './paths.config';
export { NAVIGATION_ITEMS, type NavItemConfig } from './nav.config';

// Port and URL configuration
export { 
  PORTS, 
  URLS, 
  HOSTS, 
  TIMEOUTS,
  getBackendUrl, 
  getApiUrl, 
  getWebSocketUrl 
} from './ports.config';

// Tab configurations - Constants
export {
  ADMIN_TAB_CONFIG,
  ANALYTICS_TAB_CONFIG,
  BILLING_TAB_CONFIG,
  CASE_LIST_TAB_CONFIG,
  COMPLIANCE_TAB_CONFIG,
  CRM_TAB_CONFIG,
  MATTER_MANAGEMENT_TAB_CONFIG,
  DASHBOARD_TAB_CONFIG,
  DATA_PLATFORM_MENU,
  DOCUMENT_MANAGER_TAB_CONFIG,
  EVIDENCE_PARENT_TABS,
  KNOWLEDGE_BASE_TABS,
  PLEADING_BUILDER_TAB_CONFIG,
  RESEARCH_TAB_CONFIG,
  RULES_PLATFORM_TABS,
  USER_PROFILE_TAB_CONFIG,
  LITIGATION_STRATEGY_TAB_CONFIG,
  WAR_ROOM_TAB_CONFIG,
  DISCOVERY_TAB_CONFIG,
  USER_AUTH_PROFILE_TABS
} from './tabs.config';

// Tab configurations - Types
export type {
  CRMView,
  DocView,
  KnowledgeView,
  RulesView,
  BillingView,
  MatterView,
  MenuItem
} from './tabs.config';

// Module registration
export { initializeModules } from './modules';

// Prefetch config
export { PREFETCH_MAP } from './prefetchConfig';
