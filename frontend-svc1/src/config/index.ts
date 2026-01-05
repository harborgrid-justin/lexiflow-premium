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
 */

// Core configuration objects - safe named exports
export { CONFIG } from './master.config';
export { PATHS, type AppPath } from './paths.config';
export { NAVIGATION_ITEMS, type NavItemConfig } from './nav.config';

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
  RESEARCH_TAB_CONFIG
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
