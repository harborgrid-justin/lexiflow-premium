/**
 * Environment Configuration
 *
 * Enterprise-grade environment configuration for LexiFlow.
 * Provides type-safe access to environment variables and runtime configuration.
 */

/**
 * Environment types supported by the application
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Data source configuration
 * Production systems exclusively use the PostgreSQL backend API
 */
export type DataSource = 'backend';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  readonly environment: Environment;
  readonly dataSource: DataSource;
  readonly apiBaseUrl: string;
  readonly apiTimeout: number;
  readonly features: {
    readonly useBackendApi: true;
    readonly enableAnalytics: boolean;
    readonly enableErrorReporting: boolean;
    readonly enableDebugMode: boolean;
  };
  readonly security: {
    readonly enableCSP: boolean;
    readonly enableHTTPSOnly: boolean;
  };
}

/**
 * Parse environment from env vars
 */
const getEnvironment = (): Environment => {
  const env = import.meta.env.VITE_ENV || import.meta.env.MODE || 'development';
  const validEnvs: Environment[] = ['development', 'staging', 'production', 'test'];
  return validEnvs.includes(env as Environment) ? (env as Environment) : 'development';
};

/**
 * Parse boolean environment variable
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

/**
 * Parse number environment variable
 */
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Central environment configuration
 * Immutable and validated configuration object
 */
export const ENV_CONFIG: EnvironmentConfig = {
  environment: getEnvironment(),
  dataSource: 'backend',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  apiTimeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
  features: {
    useBackendApi: true,
    enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, false),
    enableErrorReporting: parseBoolean(import.meta.env.VITE_ENABLE_ERROR_REPORTING, true),
    enableDebugMode: parseBoolean(import.meta.env.VITE_ENABLE_DEBUG_MODE, false),
  },
  security: {
    enableCSP: parseBoolean(import.meta.env.VITE_ENABLE_CSP, true),
    enableHTTPSOnly: parseBoolean(import.meta.env.VITE_ENABLE_HTTPS_ONLY, false),
  },
} as const;

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => {
  return ENV_CONFIG.environment === 'production';
};

/**
 * Check if running in development environment
 */
export const isDevelopment = (): boolean => {
  return ENV_CONFIG.environment === 'development';
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  return ENV_CONFIG.features.enableDebugMode || isDevelopment();
};

/**
 * Validate environment configuration on startup
 * Throws error if critical configuration is missing
 */
export const validateEnvironment = (): void => {
  if (!ENV_CONFIG.apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is required but not configured');
  }

  if (isProduction() && isDevelopment()) {
    console.warn('Environment mismatch detected: both production and development flags are set');
  }

  if (isDebugMode() && isProduction()) {
    console.warn('Debug mode is enabled in production environment - this should be disabled');
  }
};
