/**
 * Environment Configuration
 *
 * Centralized configuration management from environment variables.
 * Uses VITE_ prefix for client-side variables.
 *
 * @module platform/config/env
 */

/**
 * Environment variables interface
 */
export interface EnvConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // Authentication
  authCookieName: string;
  authRedirectUri: string;

  // Feature Flags
  enableSSR: boolean;
  enableEdgeRuntime: boolean;
  enableStreaming: boolean;

  // Observability
  enableTracing: boolean;
  enableAnalytics: boolean;
  logLevel: "debug" | "info" | "warn" | "error";

  // Theme
  defaultTheme: "light" | "dark";

  // i18n
  defaultLocale: string;
  supportedLocales: string[];

  // Runtime
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue: string = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }

  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }

  return defaultValue;
}

/**
 * Parse boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value === "true" || value === "1";
}

/**
 * Parse number environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Load environment configuration
 */
export function loadEnvConfig(): EnvConfig {
  const mode = getEnv("MODE", "development");

  return {
    // API Configuration
    apiBaseUrl: getEnv("VITE_API_BASE_URL", "http://localhost:3000"),
    apiTimeout: getNumberEnv("VITE_API_TIMEOUT", 30000),

    // Authentication
    authCookieName: getEnv("VITE_AUTH_COOKIE_NAME", "lexiflow_session"),
    authRedirectUri: getEnv("VITE_AUTH_REDIRECT_URI", "/auth/callback"),

    // Feature Flags
    enableSSR: getBooleanEnv("VITE_ENABLE_SSR", true),
    enableEdgeRuntime: getBooleanEnv("VITE_ENABLE_EDGE_RUNTIME", false),
    enableStreaming: getBooleanEnv("VITE_ENABLE_STREAMING", true),

    // Observability
    enableTracing: getBooleanEnv("VITE_ENABLE_TRACING", false),
    enableAnalytics: getBooleanEnv("VITE_ENABLE_ANALYTICS", false),
    logLevel: getEnv("VITE_LOG_LEVEL", "info") as EnvConfig["logLevel"],

    // Theme
    defaultTheme: getEnv(
      "VITE_DEFAULT_THEME",
      "light"
    ) as EnvConfig["defaultTheme"],

    // i18n
    defaultLocale: getEnv("VITE_DEFAULT_LOCALE", "en"),
    supportedLocales: getEnv("VITE_SUPPORTED_LOCALES", "en,es,fr").split(","),

    // Runtime
    isProduction: mode === "production",
    isDevelopment: mode === "development",
    isTest: mode === "test",
  };
}

/**
 * Validate required environment variables
 */
export function validateEnvConfig(config: EnvConfig): void {
  const errors: string[] = [];

  if (!config.apiBaseUrl) {
    errors.push("VITE_API_BASE_URL is required");
  }

  if (config.apiTimeout < 0) {
    errors.push("VITE_API_TIMEOUT must be positive");
  }

  if (!["debug", "info", "warn", "error"].includes(config.logLevel)) {
    errors.push("VITE_LOG_LEVEL must be one of: debug, info, warn, error");
  }

  if (!["light", "dark"].includes(config.defaultTheme)) {
    errors.push("VITE_DEFAULT_THEME must be either light or dark");
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration errors:\n${errors.join("\n")}`);
  }
}

/**
 * Global configuration instance
 */
export const env: EnvConfig = loadEnvConfig();

// Validate on load (will throw in development)
if (env.isDevelopment) {
  try {
    validateEnvConfig(env);
  } catch (error) {
    console.error("Environment configuration validation failed:", error);
  }
}
