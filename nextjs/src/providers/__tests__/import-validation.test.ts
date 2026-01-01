/**
 * Import Validation Test
 * Verifies all exports are accessible from providers index
 */

// ═══════════════════════════════════════════════════════════════════════════
//                    PROVIDER EXPORTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

// Providers and hooks
import {
  AppProviders,
  useDataSource,
  useTheme,
  useToast,
  useSync,
  useWindow,
} from '../index';

// ═══════════════════════════════════════════════════════════════════════════
//                    REPOSITORY EXPORTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

// Repository interfaces
import type {
  BaseRepository,
  BatchRepository,
  SearchableRepository,
  SearchOptions,
  SearchResult,
  CaseRepository,
  DocumentRepository,
  ComplianceRepository,
  ConflictResult,
  ScanResult,
  RepositoryRegistry,
  RepositoryFactory,
  RepositoryConfig,
  RepositoryLogger,
  RepositoryTracer,
  RepositoryMetrics,
  Span,
  AuthProvider,
  DataOwnership,
} from '../index';

// Configuration
import type {
  DataSourceConfig,
  DataSourceEnvironmentConfig,
  TimeoutConfig,
  RetryConfig,
  ObservabilityConfig,
} from '../index';

import {
  DataSourceConfigBuilder,
  createConfigFromEnv,
  createTestConfig,
  DEFAULT_TIMEOUTS,
  DEFAULT_RETRY,
  DEFAULT_OBSERVABILITY,
  ENVIRONMENT_CONFIGS,
} from '../index';

// Errors
import {
  RepositoryError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  NetworkError,
  TimeoutError,
  ServerError,
  RateLimitError,
  BusinessRuleError,
  ConcurrencyError,
  ErrorFactory,
  isRepositoryError,
  isRetryableError,
  getUserMessage,
  getErrorSeverity,
} from '../index';

import type { ValidationFailure } from '../index';

// ═══════════════════════════════════════════════════════════════════════════
//                    VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test 1: All provider hooks are accessible
 */
function testProviderHooks() {
  // Type check only - these would be used in components
  const hooks = {
    useDataSource,
    useTheme,
    useToast,
    useSync,
    useWindow,
  };
  return hooks;
}

/**
 * Test 2: Repository types are accessible
 */
function testRepositoryTypes() {
  const repo: BaseRepository<unknown> = {} as BaseRepository<unknown>;
  const registry: RepositoryRegistry = {} as RepositoryRegistry;
  return { repo, registry };
}

/**
 * Test 3: Configuration is accessible
 */
function testConfiguration() {
  const config = createConfigFromEnv();
  const testConfig = createTestConfig();
  const builder = new DataSourceConfigBuilder('production');
  
  return { config, testConfig, builder, DEFAULT_TIMEOUTS, DEFAULT_RETRY };
}

/**
 * Test 4: Error classes are accessible
 */
function testErrors() {
  const error = new UnauthorizedError();
  const notFound = new NotFoundError('Case', '123');
  const validation = new ValidationError('Validation failed', []);
  
  const isRepoError = isRepositoryError(error);
  const isRetryable = isRetryableError(error);
  const message = getUserMessage(error);
  const severity = getErrorSeverity(error);
  
  return { error, notFound, validation, isRepoError, isRetryable, message, severity };
}

/**
 * Test 5: Environment configs are accessible
 */
function testEnvironmentConfigs() {
  const devConfig = ENVIRONMENT_CONFIGS.development;
  const prodConfig = ENVIRONMENT_CONFIGS.production;
  return { devConfig, prodConfig };
}

// ═══════════════════════════════════════════════════════════════════════════
//                    EXPORT VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export const ALL_IMPORTS_VALIDATED = true;

console.log('✅ All provider exports are accessible');
console.log('✅ All repository exports are accessible');
console.log('✅ All configuration exports are accessible');
console.log('✅ All error exports are accessible');
console.log('✅ Import/export chain is complete');
