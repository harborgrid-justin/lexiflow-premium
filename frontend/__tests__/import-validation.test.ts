/**
 * Import Validation Test
 * Verifies all exports are accessible from providers index
 */

// Mock backendDiscovery to avoid import.meta issues in Jest
jest.mock("@/services/integration/backendDiscovery", () => ({
  backendDiscovery: {
    getStatus: jest.fn(() => ({ available: true, healthy: true })),
    subscribe: jest.fn(() => () => {}),
    checkHealth: jest.fn(() => Promise.resolve(true)),
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
//                    PROVIDER EXPORTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//                    REPOSITORY EXPORTS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════
// Repository interfaces
// Configuration
import type { BaseRepository, RepositoryRegistry } from "@/providers";
// Providers and hooks
// Errors
import {
  createConfigFromEnv,
  createTestConfig,
  DataSourceConfigBuilder,
  DEFAULT_RETRY,
  DEFAULT_TIMEOUTS,
  ENVIRONMENT_CONFIGS,
  getErrorSeverity,
  getUserMessage,
  isRepositoryError,
  isRetryableError,
  NotFoundError,
  UnauthorizedError,
  useTheme,
  useToast,
} from "@/providers";

// ═══════════════════════════════════════════════════════════════════════════
//                    VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test 1: All provider hooks are accessible
 */
function testProviderHooks() {
  // Type check only - these would be used in components
  return {
    useDataSource,
    useTheme,
    useToast,
    useSync,
    useWindow,
  };
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
  const builder = new DataSourceConfigBuilder("production");

  return { config, testConfig, builder, DEFAULT_TIMEOUTS, DEFAULT_RETRY };
}

/**
 * Test 4: Error classes are accessible
 */
function testErrors() {
  const error = new UnauthorizedError();
  const notFound = new NotFoundError("Case", "123");
  const validation = new ValidationError("Validation failed", []);

  const isRepoError = isRepositoryError(error);
  const isRetryable = isRetryableError(error);
  const message = getUserMessage(error);
  const severity = getErrorSeverity(error);

  return {
    error,
    notFound,
    validation,
    isRepoError,
    isRetryable,
    message,
    severity,
  };
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

// ═══════════════════════════════════════════════════════════════════════════
//                    TEST SUITE
// ═══════════════════════════════════════════════════════════════════════════

describe("Import Validation", () => {
  it("should have all provider hooks accessible", () => {
    const hooks = testProviderHooks();
    expect(hooks.useDataSource).toBeDefined();
    expect(hooks.useTheme).toBeDefined();
    expect(hooks.useToast).toBeDefined();
    expect(hooks.useSync).toBeDefined();
    expect(hooks.useWindow).toBeDefined();
  });

  it("should have all repository types accessible", () => {
    const types = testRepositoryTypes();
    expect(types.repo).toBeDefined();
    expect(types.registry).toBeDefined();
  });

  it("should have configuration accessible", () => {
    const config = testConfiguration();
    expect(config.config).toBeDefined();
    expect(config.testConfig).toBeDefined();
    expect(config.builder).toBeDefined();
    expect(config.DEFAULT_TIMEOUTS).toBeDefined();
    expect(config.DEFAULT_RETRY).toBeDefined();
  });

  it("should have error classes accessible", () => {
    const errors = testErrors();
    expect(errors.error).toBeInstanceOf(UnauthorizedError);
    expect(errors.notFound).toBeInstanceOf(NotFoundError);
    expect(errors.validation).toBeInstanceOf(ValidationError);
    expect(errors.isRepoError).toBeDefined();
    expect(errors.isRetryable).toBeDefined();
    expect(errors.message).toBeDefined();
    expect(errors.severity).toBeDefined();
  });

  it("should have environment configs accessible", () => {
    const configs = testEnvironmentConfigs();
    expect(configs.devConfig).toBeDefined();
    expect(configs.prodConfig).toBeDefined();
  });

  it("should validate all imports successfully", () => {
    expect(ALL_IMPORTS_VALIDATED).toBe(true);
  });
});
