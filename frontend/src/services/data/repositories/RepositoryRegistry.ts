/**
 * RepositoryRegistry
 *
 * Responsibility: Manage singleton repository lifecycle and prevent duplicate instances
 * Pattern: Registry pattern with factory methods
 *
 * This module ensures that repositories are created once and reused across
 * the application, preventing memory leaks and inconsistent state.
 */

import { GenericRegistry } from "@/services/core/factories/GenericRegistry";

/**
 * Registry for managing singleton repository instances
 * 
 * Now uses GenericRegistry factory to eliminate 60+ duplicate registry lines
 */
const repositoryRegistry = new GenericRegistry<unknown>({
  name: 'Repository',
  lazy: true,
});

/**
 * Legacy compatibility wrapper
 */
export class RepositoryRegistry {
  /**
   * Gets or creates a singleton repository instance
   *
   * @param key - Unique identifier for the repository
   * @param factory - Factory function to create the repository
   * @returns The singleton repository instance
   */
  static getOrCreate<T>(key: string, factory: () => T): T {
    if (!repositoryRegistry.has(key)) {
      repositoryRegistry.register(key, factory);
    }
    return repositoryRegistry.get(key) as T;
  }

  /**
   * Checks if a repository instance exists
   */
  static has(key: string): boolean {
    return repositoryRegistry.has(key);
  }

  /**
   * Gets an existing repository instance (returns undefined if not found)
   */
  static get<T>(key: string): T | undefined {
    return repositoryRegistry.get(key) as T | undefined;
  }

  /**
   * Manually registers a repository instance
   */
  static register<T>(key: string, instance: T): void {
    repositoryRegistry.register(key, instance);
  }

  /**
   * Removes a repository instance from the registry
   * Useful for testing or hot module replacement
   */
  static remove(key: string): boolean {
    return repositoryRegistry.unregister(key);
  }

  /**
   * Clears all repository instances
   * WARNING: Use only for testing or application shutdown
   */
  static clear(): void {
    repositoryRegistry.clear();
  }

  /**
   * Gets all registered repository keys
   */
  static keys(): string[] {
    return repositoryRegistry.keys();
  }

  /**
   * Gets the count of registered repositories
   */
  static size(): number {
    return repositoryRegistry.size;
  }
}

/**
 * Legacy compatibility - maintains getSingleton pattern from original code
 *
 * @deprecated Use RepositoryRegistry.getOrCreate instead
 */
export function getSingleton<T>(key: string, factory: () => T): T {
  return RepositoryRegistry.getOrCreate(key, factory);
}

/**
 * Creates a registry-managed repository factory
 *
 * Example:
 * ```ts
 * const getCaseRepository = createRegistryFactory('CaseRepository', () => new CaseRepository());
 * ```
 */
export function createRegistryFactory<T>(
  key: string,
  factory: () => T
): () => T {
  return () => RepositoryRegistry.getOrCreate(key, factory);
}

/**
 * Batch registration helper for multiple repositories
 *
 * Example:
 * ```ts
 * const repositories = registerRepositories({
 *   cases: () => new CaseRepository(),
 *   docket: () => new DocketRepository(),
 *   documents: () => new DocumentRepository()
 * });
 * ```
 */
export function registerRepositories<
  TMap extends Record<string, unknown>,
>(config: { [K in keyof TMap]: () => TMap[K] }): {
  [K in keyof TMap]: () => TMap[K];
} {
  const factories: unknown = {};
  for (const [key, factory] of Object.entries(config)) {
    (factories as Record<string, unknown>)[key] = createRegistryFactory(
      key,
      factory as () => unknown
    );
  }
  return factories as { [K in keyof TMap]: () => TMap[K] };
}
