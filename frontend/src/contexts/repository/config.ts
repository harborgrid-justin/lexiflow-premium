/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                DATA SOURCE CONFIGURATION                                  ║
 * ║           Environment, Versioning, Timeouts, Observability                ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * @module providers/repository/config
 * @description Type-safe configuration for data sources
 * 
 * PRINCIPLES APPLIED:
 * 7. Support Multiple Environments Explicitly
 * 10. Enforce Timeouts and Retries Centrally
 * 11. Instrument Observability at Provider Level
 * 14. Version API Access Explicitly
 */

import type { 
  RepositoryLogger, 
  RepositoryTracer, 
  RepositoryMetrics,
  AuthProvider 
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
//                         ENVIRONMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern 7: Support multiple environments explicitly
 */
export interface DataSourceEnvironmentConfig {
  /**
   * Current environment
   */
  environment: 'development' | 'staging' | 'production' | 'test';
  
  /**
   * API base URL (NO query params or headers)
   */
  apiBaseUrl: string;
  
  /**
   * API version (Pattern 14)
   */
  apiVersion: 'v1' | 'v2' | 'v3';
  
  /**
   * Feature toggles
   */
  features: {
    enableCaching: boolean;
    enableRetries: boolean;
    enableMetrics: boolean;
    enableTracing: boolean;
  };
}

/**
 * Default configurations per environment
 */
export const ENVIRONMENT_CONFIGS: Record<
  DataSourceEnvironmentConfig['environment'],
  Partial<DataSourceEnvironmentConfig>
> = {
  development: {
    environment: 'development',
    apiVersion: 'v2',
    features: {
      enableCaching: true,
      enableRetries: true,
      enableMetrics: true,
      enableTracing: true,
    },
  },
  staging: {
    environment: 'staging',
    apiVersion: 'v2',
    features: {
      enableCaching: true,
      enableRetries: true,
      enableMetrics: true,
      enableTracing: true,
    },
  },
  production: {
    environment: 'production',
    apiVersion: 'v2',
    features: {
      enableCaching: true,
      enableRetries: true,
      enableMetrics: true,
      enableTracing: true,
    },
  },
  test: {
    environment: 'test',
    apiVersion: 'v2',
    features: {
      enableCaching: false,
      enableRetries: false,
      enableMetrics: false,
      enableTracing: false,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
//                         TIMEOUT & RETRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern 10: Enforce timeouts and retries centrally
 */
export interface TimeoutConfig {
  /**
   * Default timeout for all operations (ms)
   */
  default: number;
  
  /**
   * Operation-specific timeouts
   */
  operations: {
    read: number;
    write: number;
    delete: number;
    search: number;
  };
}

/**
 * Pattern 10: Retry configuration with exponential backoff
 */
export interface RetryConfig {
  /**
   * Maximum retry attempts
   */
  maxAttempts: number;
  
  /**
   * Initial backoff delay (ms)
   */
  initialBackoffMs: number;
  
  /**
   * Maximum backoff delay (ms)
   */
  maxBackoffMs: number;
  
  /**
   * Backoff multiplier
   */
  backoffMultiplier: number;
  
  /**
   * Which error codes should be retried
   */
  retryableErrorCodes: string[];
}

/**
 * Default timeout configuration
 */
export const DEFAULT_TIMEOUTS: TimeoutConfig = {
  default: 30000, // 30 seconds
  operations: {
    read: 15000,   // 15 seconds
    write: 30000,  // 30 seconds
    delete: 15000, // 15 seconds
    search: 20000, // 20 seconds
  },
};

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 10000,
  backoffMultiplier: 2,
  retryableErrorCodes: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'SERVER_ERROR',
    'RATE_LIMIT',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
//                         OBSERVABILITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern 11: Instrument observability at provider level
 */
export interface ObservabilityConfig {
  /**
   * Logger instance (optional)
   */
  logger?: RepositoryLogger;
  
  /**
   * Tracer instance (optional)
   */
  tracer?: RepositoryTracer;
  
  /**
   * Metrics collector (optional)
   */
  metrics?: RepositoryMetrics;
  
  /**
   * Log level
   */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  /**
   * Sample rate for tracing (0-1)
   */
  tracingSampleRate: number;
  
  /**
   * Sample rate for metrics (0-1)
   */
  metricsSampleRate: number;
}

/**
 * Default observability configuration
 */
export const DEFAULT_OBSERVABILITY: ObservabilityConfig = {
  logLevel: 'info',
  tracingSampleRate: 0.1, // 10% sampling
  metricsSampleRate: 1.0, // 100% metrics
};

// ═══════════════════════════════════════════════════════════════════════════
//                         COMPLETE DATA SOURCE CONFIG
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Complete data source configuration
 * This is what the provider uses to create repositories
 */
export interface DataSourceConfig {
  /**
   * Environment configuration (Pattern 7)
   */
  environment: DataSourceEnvironmentConfig;
  
  /**
   * Timeout configuration (Pattern 10)
   */
  timeout: TimeoutConfig;
  
  /**
   * Retry configuration (Pattern 10)
   */
  retry: RetryConfig;
  
  /**
   * Observability configuration (Pattern 11)
   */
  observability: ObservabilityConfig;
  
  /**
   * Authentication provider (Pattern 4)
   * Injected dependency
   */
  authProvider?: AuthProvider;
}

// ═══════════════════════════════════════════════════════════════════════════
//                         CONFIGURATION BUILDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Builder for creating data source configuration
 * Provides sensible defaults with override capability
 */
export class DataSourceConfigBuilder {
  private config: Partial<DataSourceConfig> = {};
  
  constructor(environment: DataSourceEnvironmentConfig['environment'] = 'development') {
    // Start with environment defaults
    const envDefaults = ENVIRONMENT_CONFIGS[environment];
    
    this.config = {
      environment: {
        environment,
        apiBaseUrl: '',
        apiVersion: 'v2',
        features: {
          enableCaching: true,
          enableRetries: true,
          enableMetrics: true,
          enableTracing: true,
        },
        ...envDefaults,
      },
      timeout: DEFAULT_TIMEOUTS,
      retry: DEFAULT_RETRY,
      observability: DEFAULT_OBSERVABILITY,
    };
  }
  
  /**
   * Set API base URL
   */
  withApiBaseUrl(url: string): this {
    if (this.config.environment) {
      this.config.environment.apiBaseUrl = url;
    }
    return this;
  }
  
  /**
   * Set API version (Pattern 14)
   */
  withApiVersion(version: 'v1' | 'v2' | 'v3'): this {
    if (this.config.environment) {
      this.config.environment.apiVersion = version;
    }
    return this;
  }
  
  /**
   * Configure timeouts
   */
  withTimeouts(timeouts: Partial<TimeoutConfig>): this {
    this.config.timeout = { ...DEFAULT_TIMEOUTS, ...timeouts };
    return this;
  }
  
  /**
   * Configure retries
   */
  withRetries(retries: Partial<RetryConfig>): this {
    this.config.retry = { ...DEFAULT_RETRY, ...retries };
    return this;
  }
  
  /**
   * Configure observability
   */
  withObservability(observability: Partial<ObservabilityConfig>): this {
    this.config.observability = { ...DEFAULT_OBSERVABILITY, ...observability };
    return this;
  }
  
  /**
   * Set authentication provider
   */
  withAuthProvider(authProvider: AuthProvider): this {
    this.config.authProvider = authProvider;
    return this;
  }
  
  /**
   * Enable/disable specific features
   */
  withFeature(feature: keyof DataSourceEnvironmentConfig['features'], enabled: boolean): this {
    if (this.config.environment) {
      this.config.environment.features[feature] = enabled;
    }
    return this;
  }
  
  /**
   * Build final configuration
   */
  build(): DataSourceConfig {
    // Validate required fields
    if (!this.config.environment?.apiBaseUrl) {
      throw new Error('API base URL is required');
    }
    
    return this.config as DataSourceConfig;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//                         CONFIGURATION FACTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create configuration from environment variables
 */
export function createConfigFromEnv(): DataSourceConfig {
  const env = (import.meta.env.MODE || 'development') as DataSourceEnvironmentConfig['environment'];
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || URLS.api(HOSTS.LOCAL);
  const apiVersion = (import.meta.env.VITE_API_VERSION || 'v2') as 'v1' | 'v2' | 'v3';
  
  return new DataSourceConfigBuilder(env)
    .withApiBaseUrl(apiBaseUrl)
    .withApiVersion(apiVersion)
    .build();
}

/**
 * Create test configuration
 * Pattern 13: Enable mock and stub injection
 */
export function createTestConfig(overrides?: Partial<DataSourceConfig>): DataSourceConfig {
  const baseConfig = new DataSourceConfigBuilder('test')
    .withApiBaseUrl(URLS.api(HOSTS.LOCAL))
    .withFeature('enableRetries', false)
    .withFeature('enableMetrics', false)
    .withFeature('enableTracing', false)
    .build();
  
  return { ...baseConfig, ...overrides };
}
