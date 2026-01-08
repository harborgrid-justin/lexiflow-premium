/**
 * RepositoryRegistry
 *
 * Responsibility: Manage singleton repository lifecycle and prevent duplicate instances
 * Pattern: Registry pattern with factory methods
 *
 * This module ensures that repositories are created once and reused across
 * the application, preventing memory leaks and inconsistent state.
 */

/**
 * Registry for managing singleton repository instances
 */
export class RepositoryRegistry {
  private static instances = new Map<string, unknown>();

  /**
   * Gets or creates a singleton repository instance
   *
   * @param key - Unique identifier for the repository
   * @param factory - Factory function to create the repository
   * @returns The singleton repository instance
   */
  static getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }

  /**
   * Clear all repository instances
   * Use during cleanup to prevent memory leaks
   */
  static clear(): void {
    this.instances.clear();
  }

  /**
   * Checks if a repository instance exists
   */
  static has(key: string): boolean {
    return this.instances.has(key);
  }

  /**
   * Gets an existing repository instance (returns undefined if not found)
   */
  static get<T>(key: string): T | undefined {
    return this.instances.get(key) as T | undefined;
  }

  /**
   * Manually registers a repository instance
   */
  static register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  /**
   * Removes a repository instance from the registry
   * Useful for testing or hot module replacement
   */
  static remove(key: string): boolean {
    return this.instances.delete(key);
  }

  /**
   * Clears all repository instances
   * WARNING: Use only for testing or application shutdown
   */
  static clear(): void {
    this.instances.clear();
  }

  /**
   * Gets all registered repository keys
   */
  static keys(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Gets the count of registered repositories
   */
  static size(): number {
    return this.instances.size;
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
