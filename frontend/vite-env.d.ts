/// <reference types="vite/client" />

/**
 * Environment Variables Type Definitions
 *
 * Provides type safety for environment variables accessed via import.meta.env
 * Follows enterprise standards for configuration management
 */

interface ImportMetaEnv {
  // Application Environment
  readonly VITE_ENV?: string;
  readonly MODE: string;

  // API Configuration
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT?: string;

  // AI/ML Service Configuration
  readonly GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;

  // Database Configuration (Legacy - Deprecated)
  readonly VITE_USE_INDEXEDDB?: string;

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_REPORTING?: string;
  readonly VITE_ENABLE_DEBUG_MODE?: string;

  // Build Configuration
  readonly VITE_BUILD_VERSION?: string;
  readonly VITE_BUILD_TIMESTAMP?: string;

  // Security Configuration
  readonly VITE_ENABLE_CSP?: string;
  readonly VITE_ENABLE_HTTPS_ONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
