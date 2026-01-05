// =============================================================================
// APPLICATION METADATA CONFIGURATION
// =============================================================================
// Core application metadata that rarely changes

export const APP_NAME = 'LexiFlow';
export const APP_VERSION = '1.0.0';
export const getAppEnv = () => import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
// Note: Don't call getAppEnv() at module load - will be called lazily when needed
export const APP_DESCRIPTION = 'Enterprise Legal OS - Case Management, Discovery & Operations';

// Theme Settings
export const DEFAULT_THEME: 'light' | 'dark' | 'auto' = 'auto';
export const THEME_STORAGE_KEY = 'lexiflow-theme';

// Localization
export const DEFAULT_LOCALE = 'en-US';
export const SUPPORTED_LOCALES = ['en-US', 'es-ES', 'fr-FR'];
export const ENABLE_RTL = false;
export const LOCALE_STORAGE_KEY = 'lexiflow-locale';

// Export as object with lazy getter
export const APP_CONFIG = {
  name: APP_NAME,
  version: APP_VERSION,
  get env() { return getAppEnv(); },
  description: APP_DESCRIPTION,
  theme: {
    default: DEFAULT_THEME,
    storageKey: THEME_STORAGE_KEY,
  },
  localization: {
    defaultLocale: DEFAULT_LOCALE,
    supportedLocales: SUPPORTED_LOCALES,
    enableRtl: ENABLE_RTL,
    storageKey: LOCALE_STORAGE_KEY,
  },
} as const;
