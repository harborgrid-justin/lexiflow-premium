/**
 * Environment Type Definitions
 * Provides type safety for import.meta.env
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;

  // Authentication
  readonly VITE_AUTH_PROVIDER: "jwt" | "oidc" | "oauth2";
  readonly VITE_AUTH_TOKEN_KEY: string;
  readonly VITE_AUTH_REFRESH_TOKEN_KEY: string;

  // Feature Flags
  readonly VITE_FEATURE_BILLING: string;
  readonly VITE_FEATURE_REPORTING: string;
  readonly VITE_FEATURE_ADMIN: string;

  // Observability
  readonly VITE_ENABLE_LOGGING: string;
  readonly VITE_ENABLE_TRACING: string;
  readonly VITE_ENABLE_ANALYTICS: string;

  // Theme
  readonly VITE_DEFAULT_THEME: "light" | "dark" | "system";
  readonly VITE_THEME_STORAGE_KEY: string;

  // i18n
  readonly VITE_DEFAULT_LOCALE: string;
  readonly VITE_SUPPORTED_LOCALES: string;

  // Security
  readonly VITE_ENABLE_CSP: string;
  readonly VITE_CSP_REPORT_URI: string;

  // Development
  readonly VITE_DEV_TOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
