// =============================================================================
// LEXIFLOW FRONTEND MASTER CONFIGURATION (BACKWARD COMPATIBILITY)
// =============================================================================
// This file maintains backward compatibility with existing imports.
// All settings have been refactored into domain-specific modules.
//
// New code should import from specific config modules:
// - config/app.config.ts - Application metadata and theming
// - config/database/indexeddb.config.ts - IndexedDB settings
// - config/database/cache.config.ts - Cache strategies
// - config/network/api.config.ts - API connection settings
// - config/network/websocket.config.ts - WebSocket configuration
// - config/network/sync.config.ts - Sync engine settings
// - config/features/search.config.ts - Search functionality
// - config/features/upload.config.ts - File upload rules
// - config/features/pagination.ts - Pagination defaults
// - config/features/ui.config.ts - UI/UX preferences
// - config/features/forms.config.ts - Form validation rules
// - config/features/legal.config.ts - Legal-specific features
// - config/features/features.config.ts - Feature flags
// - config/security/security.config.ts - Security policies

// DEPRECATED: Wildcard re-exports commented out to prevent circular dependencies.
// Import directly from specific config files instead:
// import { FORM_AUTO_SAVE_DELAY_MS } from '@/config/features/forms.config';
// import { NOTIFICATION_AUTO_DISMISS_MS } from '@/config/features/ui.config';

// export * from './app.config';
// export * from './database/indexeddb.config';
// export * from './database/cache.config';
// export * from './network/api.config';
// export * from './network/websocket.config';
// export * from './network/sync.config';
// export * from './features/search.config';
// export * from './features/upload.config';
// export * from './features/pagination';
// export * from './features/ui.config';
// export * from './features/forms.config';
// export * from './features/legal.config';
// export * from './features/features.config';
// export * from './security/security.config';

// Import config objects for consolidated export
import { APP_CONFIG } from "./app.config";
import { CACHE_CONFIG } from "./database/cache.config";
import { INDEXEDDB_CONFIG } from "./database/indexeddb.config";
import { FEATURES_CONFIG } from "./features/features.config";
import { API_CONFIG } from "./network/api.config";
import { SYNC_CONFIG } from "./network/sync.config";

// =============================================================================
// EXPORT CONSOLIDATED CONFIGURATION OBJECT (LEGACY COMPATIBILITY)
// =============================================================================
export const CONFIG = {
  app: APP_CONFIG,
  db: INDEXEDDB_CONFIG,
  cache: CACHE_CONFIG,
  api: API_CONFIG,
  sync: SYNC_CONFIG,
  features: FEATURES_CONFIG,
} as const;

export default CONFIG;
