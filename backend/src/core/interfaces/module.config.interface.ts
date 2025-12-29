/**
 * Standard Module Configuration Interface
 * Provides a consistent configuration pattern across all modules
 */

/**
 * Feature flag configuration for modules
 */
export interface FeatureFlags {
  /**
   * Whether the module is enabled
   */
  enabled: boolean;

  /**
   * Module-specific feature flags
   */
  features?: Record<string, boolean>;
}

/**
 * Module health check configuration
 */
export interface ModuleHealthConfig {
  /**
   * Whether health checks are enabled for this module
   */
  enabled: boolean;

  /**
   * Health check interval in milliseconds
   */
  interval?: number;

  /**
   * Health check timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Module logging configuration
 */
export interface ModuleLoggingConfig {
  /**
   * Whether logging is enabled for this module
   */
  enabled: boolean;

  /**
   * Log level: 'error' | 'warn' | 'info' | 'debug' | 'verbose'
   */
  level?: string;

  /**
   * Whether to include sensitive data in logs
   */
  includeSensitiveData?: boolean;
}

/**
 * Module metrics configuration
 */
export interface ModuleMetricsConfig {
  /**
   * Whether metrics collection is enabled
   */
  enabled: boolean;

  /**
   * Metrics collection interval in milliseconds
   */
  interval?: number;

  /**
   * Custom metric labels
   */
  labels?: Record<string, string>;
}

/**
 * Standard module configuration interface
 * All modules should implement or extend this interface
 */
export interface ModuleConfig {
  /**
   * Module name
   */
  name: string;

  /**
   * Module version
   */
  version?: string;

  /**
   * Feature flags
   */
  features?: FeatureFlags;

  /**
   * Health check configuration
   */
  health?: ModuleHealthConfig;

  /**
   * Logging configuration
   */
  logging?: ModuleLoggingConfig;

  /**
   * Metrics configuration
   */
  metrics?: ModuleMetricsConfig;

  /**
   * Module dependencies (names of other modules this module depends on)
   */
  dependencies?: string[];

  /**
   * Module initialization priority (lower numbers initialize first)
   */
  priority?: number;

  /**
   * Whether this module is required for application startup
   */
  required?: boolean;

  /**
   * Module-specific configuration
   */
  config?: Record<string, unknown>;
}

/**
 * Module startup result
 */
export interface ModuleStartupResult {
  /**
   * Module name
   */
  module: string;

  /**
   * Whether startup was successful
   */
  success: boolean;

  /**
   * Startup duration in milliseconds
   */
  duration: number;

  /**
   * Error message if startup failed
   */
  error?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Module shutdown result
 */
export interface ModuleShutdownResult {
  /**
   * Module name
   */
  module: string;

  /**
   * Whether shutdown was successful
   */
  success: boolean;

  /**
   * Shutdown duration in milliseconds
   */
  duration: number;

  /**
   * Error message if shutdown failed
   */
  error?: string;

  /**
   * Resources cleaned up
   */
  resourcesCleaned?: string[];
}
