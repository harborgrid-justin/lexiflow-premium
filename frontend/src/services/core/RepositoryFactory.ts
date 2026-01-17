/**
 * Repository Factory
 *
 * Creates generic Repository instances for stores that don't need
 * custom business logic. Eliminates the need for anonymous class
 * instantiations throughout the codebase.
 *
 * Usage:
 * ```typescript
 * const trustAccountsRepo = createRepository<TrustAccount>('trustAccounts');
 * const data = await trustAccountsRepo.getAll();
 * ```
 */

import { type BaseEntity } from "@/types";

import { Repository } from "./Repository";

/**
 * Generic Repository implementation without custom methods.
 * Use this for simple CRUD operations on any store.
 */
class GenericRepository<T extends BaseEntity> extends Repository<T> {
  constructor(storeName: string) {
    super(storeName);
  }
}

/**
 * Create a generic repository instance for a given store.
 *
 * @param storeName - Name of the IndexedDB store
 * @returns Repository instance
 *
 * @example
 * ```typescript
 * const repo = createRepository<User>('users');
 * const users = await repo.getAll();
 * await repo.add(newUser);
 * ```
 */
export function createRepository<T extends BaseEntity>(
  storeName: string
): Repository<T> {
  return new GenericRepository<T>(storeName);
}

/**
 * Repository registry for singleton instances.
 * Ensures the same repository instance is used across the application.
 */
class RepositoryRegistry {
  private instances: Map<string, Repository<BaseEntity>> = new Map();

  /**
   * Get or create a repository instance for a given store.
   *
   * @param storeName - Name of the IndexedDB store
   * @returns Repository instance (singleton)
   */
  getOrCreate<T extends BaseEntity>(storeName: string): Repository<T> {
    if (!this.instances.has(storeName)) {
      this.instances.set(storeName, createRepository<BaseEntity>(storeName));
    }
    return this.instances.get(storeName) as unknown as Repository<T>;
  }

  /**
   * Register a custom repository instance.
   *
   * @param storeName - Name of the IndexedDB store
   * @param repository - Custom repository instance
   */
  register<T extends BaseEntity>(
    storeName: string,
    repository: Repository<T>
  ): void {
    this.instances.set(
      storeName,
      repository as unknown as Repository<BaseEntity>
    );
  }

  /**
   * Clear all cached repository instances.
   * Also clears listeners and caches in each repository.
   */
  clear(): void {
    // Clean up each repository before clearing
    for (const repository of this.instances.values()) {
      if (typeof repository.clearAllListeners === "function") {
        repository.clearAllListeners();
      }
    }
    this.instances.clear();
  }

  /**
   * Get all registered store names.
   */
  getStoreNames(): string[] {
    return Array.from(this.instances.keys());
  }

  /**
   * Get memory usage statistics for all registered repositories.
   * @returns Object with repository counts and listener stats
   */
  getMemoryStats(): {
    repositoryCount: number;
    totalListeners: number;
    repositories: Array<{ name: string; listeners: number }>;
  } {
    const repositories: Array<{ name: string; listeners: number }> = [];
    let totalListeners = 0;

    for (const [name, repo] of this.instances.entries()) {
      const listenerCount =
        typeof repo.getListenerCount === "function"
          ? repo.getListenerCount()
          : 0;
      repositories.push({ name, listeners: listenerCount });
      totalListeners += listenerCount;
    }

    return {
      repositoryCount: this.instances.size,
      totalListeners,
      repositories: repositories.sort((a, b) => b.listeners - a.listeners),
    };
  }
}

/**
 * Global repository registry singleton
 */
export const repositoryRegistry = new RepositoryRegistry();

/**
 * Get a repository instance from the registry (creates if needed).
 *
 * @param storeName - Name of the IndexedDB store
 * @returns Repository instance (singleton)
 *
 * @example
 * ```typescript
 * const repo = getRepository<User>('users');
 * ```
 */
export function getRepository<T extends BaseEntity>(
  storeName: string
): Repository<T> {
  return repositoryRegistry.getOrCreate<T>(storeName);
}

/**
 * Create multiple repository instances at once.
 *
 * @param storeNames - Array of store names
 * @returns Map of store names to repository instances
 *
 * @example
 * ```typescript
 * const repos = createRepositories(['users', 'cases', 'documents']);
 * const users = await repos.get('users')?.getAll();
 * ```
 */
export function createRepositories(
  storeNames: string[]
): Map<string, Repository<BaseEntity>> {
  const repositories = new Map<string, Repository<BaseEntity>>();

  for (const storeName of storeNames) {
    repositories.set(storeName, createRepository<BaseEntity>(storeName));
  }

  return repositories;
}

/**
 * Batch repository creator with type safety.
 * Returns an object with typed repository properties.
 *
 * @param config - Object mapping keys to store names
 * @returns Object with repository instances
 *
 * @example
 * ```typescript
 * const repos = createTypedRepositories({
 *   users: 'users',
 *   cases: 'cases',
 *   documents: 'documents'
 * });
 *
 * const users = await repos.users.getAll();
 * ```
 */
export function createTypedRepositories<T extends Record<string, string>>(
  config: T
): { [K in keyof T]: Repository<BaseEntity> } {
  const result = {} as { [K in keyof T]: Repository<BaseEntity> };

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      result[key] = createRepository<BaseEntity>(config[key] as string);
    }
  }

  return result;
}

/**
 * Export GenericRepository class for advanced use cases
 */
export { GenericRepository };
