import { SetMetadata } from "@nestjs/common";

/**
 * Cache Metadata Keys
 */
export const CACHEABLE_KEY = "performance:cacheable";
export const CACHE_EVICT_KEY = "performance:cache-evict";
export const CACHE_PUT_KEY = "performance:cache-put";

/**
 * Cacheable Options
 */
export interface CacheableOptions {
  /**
   * Cache key or key generator function
   * @example 'users:all' or (args) => `users:${args[0]}`
   */
  key?: string | ((...args: unknown[]) => string);

  /**
   * Time to live in seconds
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Cache namespace
   * @example 'users', 'products'
   */
  namespace?: string;

  /**
   * Cache tier: memory, redis, or both
   * @default 'both'
   */
  tier?: "memory" | "redis" | "both";

  /**
   * Tags for cache invalidation
   * @example ['users', 'public-data']
   */
  tags?: string[];

  /**
   * Condition to determine if result should be cached
   * @example (result) => result !== null
   */
  condition?: (result: unknown) => boolean;

  /**
   * Generate cache key from method arguments
   * @example (userId, role) => `user:${userId}:${role}`
   */
  keyGenerator?: (...args: unknown[]) => string;
}

/**
 * Cache Evict Options
 */
export interface CacheEvictOptions {
  /**
   * Cache key(s) to evict
   * @example 'users:all' or ['users:all', 'users:count']
   */
  key?: string | string[] | ((...args: unknown[]) => string | string[]);

  /**
   * Cache namespace
   */
  namespace?: string;

  /**
   * Evict all entries in namespace
   * @default false
   */
  allEntries?: boolean;

  /**
   * Tags to invalidate
   * @example ['users', 'admin-data']
   */
  tags?: string[];

  /**
   * Execute eviction before method invocation
   * @default false (evict after method)
   */
  beforeInvocation?: boolean;

  /**
   * Condition to determine if cache should be evicted
   */
  condition?: (result: unknown, ...args: unknown[]) => boolean;
}

/**
 * Cache Put Options
 */
export interface CachePutOptions {
  /**
   * Cache key
   */
  key?: string | ((...args: unknown[]) => string);

  /**
   * Time to live in seconds
   */
  ttl?: number;

  /**
   * Cache namespace
   */
  namespace?: string;

  /**
   * Cache tier
   */
  tier?: "memory" | "redis" | "both";

  /**
   * Tags for cache invalidation
   */
  tags?: string[];

  /**
   * Condition to determine if result should be cached
   */
  condition?: (result: unknown) => boolean;
}

/**
 * @Cacheable Decorator
 *
 * Cache method results automatically. The method will only be executed
 * if the result is not in cache.
 *
 * @param options Cache configuration options
 *
 * @example
 * // Simple caching with key
 * @Cacheable({ key: 'users:all', ttl: 300 })
 * async getAllUsers() { ... }
 *
 * @example
 * // Dynamic key with arguments
 * @Cacheable({
 *   keyGenerator: (userId: string) => `user:${userId}`,
 *   ttl: 600,
 *   tags: ['users']
 * })
 * async getUserById(userId: string) { ... }
 *
 * @example
 * // Conditional caching
 * @Cacheable({
 *   key: 'premium-users',
 *   condition: (result) => result.length > 0,
 *   tier: 'redis'
 * })
 * async getPremiumUsers() { ... }
 */
export function Cacheable(options: CacheableOptions = {}): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    // Store metadata for interceptor
    SetMetadata(CACHEABLE_KEY, options)(target, propertyKey, descriptor);

    // Override method to handle caching logic
    descriptor.value = async function (
      this: CacheableInstance,
      ...args: unknown[]
    ) {
      // Check if cache strategy service is available
      const cacheStrategy = this.cacheStrategy || this.cacheStrategyService;

      if (!cacheStrategy) {
        // Fallback to original method if no cache service
        const result = await (originalMethod as (...a: unknown[]) => Promise<unknown>).apply(this, args);
        return result;
      }

      // Generate cache key
      const cacheKey = generateCacheKey(options, args, propertyKey as string);

      // Get from cache or execute method
      return await cacheStrategy.get(
        cacheKey,
        async () => {
          const result = await (originalMethod as (...a: unknown[]) => Promise<unknown>).apply(this, args);

          // Check condition
          if (options.condition && !options.condition(result)) {
            return result;
          }

          return result;
        },
        {
          ttl: options.ttl || 300,
          namespace: options.namespace,
          tier: options.tier || "both",
          tags: options.tags || [],
        }
      );
    };

    return descriptor;
  };
}

/**
 * @CacheEvict Decorator
 *
 * Evict (invalidate) cache entries when method is executed.
 * Useful for maintaining cache consistency after updates.
 *
 * @param options Cache eviction options
 *
 * @example
 * // Evict specific key
 * @CacheEvict({ key: 'users:all' })
 * async createUser(userData: CreateUserDto) { ... }
 *
 * @example
 * // Evict multiple keys
 * @CacheEvict({
 *   key: ['users:all', 'users:count'],
 *   tags: ['users']
 * })
 * async updateUser(userId: string, data: UpdateUserDto) { ... }
 *
 * @example
 * // Evict all entries in namespace
 * @CacheEvict({ namespace: 'users', allEntries: true })
 * async resetUsers() { ... }
 *
 * @example
 * // Evict before method execution
 * @CacheEvict({
 *   key: (userId: string) => `user:${userId}`,
 *   beforeInvocation: true
 * })
 * async deleteUser(userId: string) { ... }
 */
export function CacheEvict(options: CacheEvictOptions = {}): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    SetMetadata(CACHE_EVICT_KEY, options)(target, propertyKey, descriptor);

    descriptor.value = async function (
      this: CacheableInstance,
      ...args: unknown[]
    ) {
      const cacheStrategy = this.cacheStrategy || this.cacheStrategyService;

      if (!cacheStrategy) {
        const result = await (originalMethod as (...a: unknown[]) => Promise<unknown>).apply(this, args);
        return result;
      }

      // Evict before invocation if specified
      if (options.beforeInvocation) {
        await evictCache(cacheStrategy, options, args);
      }

      // Execute original method
      const result = await (originalMethod as (...a: unknown[]) => Promise<unknown>).apply(this, args);

      // Evict after invocation (default)
      if (!options.beforeInvocation) {
        // Check condition
        if (!options.condition || options.condition(result, ...args)) {
          await evictCache(cacheStrategy, options, args);
        }
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * @CachePut Decorator
 *
 * Always execute method and update cache with result.
 * Unlike @Cacheable, this always runs the method and updates the cache.
 *
 * @param options Cache put options
 *
 * @example
 * // Update cache after method execution
 * @CachePut({
 *   keyGenerator: (userId: string) => `user:${userId}`,
 *   ttl: 600,
 *   tags: ['users']
 * })
 * async updateUser(userId: string, data: UpdateUserDto) { ... }
 *
 * @example
 * // Conditional cache update
 * @CachePut({
 *   key: 'latest-user',
 *   condition: (result) => result.isActive,
 *   tier: 'redis'
 * })
 * async createUser(userData: CreateUserDto) { ... }
 */
export function CachePut(options: CachePutOptions = {}): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    SetMetadata(CACHE_PUT_KEY, options)(target, propertyKey, descriptor);

    descriptor.value = async function (
      this: CacheableInstance,
      ...args: unknown[]
    ) {
      const cacheStrategy = this.cacheStrategy || this.cacheStrategyService;

      // Execute original method
      const result = await (originalMethod as (...a: unknown[]) => Promise<unknown>).apply(this, args);

      // Update cache if service available and condition met
      if (cacheStrategy) {
        if (!options.condition || options.condition(result)) {
          const cacheKey = generateCacheKey(
            options,
            args,
            propertyKey as string
          );

          await cacheStrategy.set(cacheKey, result, {
            ttl: options.ttl || 300,
            namespace: options.namespace,
            tier: options.tier || "both",
            tags: options.tags || [],
          });
        }
      }

      return result;
    };

    return descriptor;
  };
}

// Helper functions

function generateCacheKey(
  options: CacheableOptions | CachePutOptions,
  args: unknown[],
  methodName: string
): string {
  // Use keyGenerator if provided
  if ("keyGenerator" in options && options.keyGenerator) {
    return options.keyGenerator(...args);
  }

  // Use key if provided (string or function)
  if (options.key) {
    if (typeof options.key === "function") {
      return options.key(...args);
    }
    return options.key;
  }

  // Generate default key from method name and arguments
  const argsKey = args.length > 0 ? `:${JSON.stringify(args)}` : "";
  return `${methodName}${argsKey}`;
}

interface CacheStrategy {
  get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config?: {
      ttl?: number;
      namespace?: string;
      tier?: "memory" | "redis" | "both";
      tags?: string[];
    }
  ): Promise<T>;
  set<T>(
    key: string,
    value: T,
    config?: {
      ttl?: number;
      namespace?: string;
      tier?: "memory" | "redis" | "both";
      tags?: string[];
    }
  ): Promise<void>;
  delete(key: string, namespace?: string): Promise<void>;
  clearNamespace(namespace: string): Promise<void>;
  invalidateByTags(tags: string[]): Promise<number>;
}

interface CacheableInstance {
  cacheStrategy?: CacheStrategy;
  cacheStrategyService?: CacheStrategy;
}

async function evictCache(
  cacheStrategy: CacheStrategy,
  options: CacheEvictOptions,
  args: unknown[]
): Promise<void> {
  // Evict all entries in namespace
  if (options.allEntries && options.namespace) {
    await cacheStrategy.clearNamespace(options.namespace);
    return;
  }

  // Evict by tags
  if (options.tags && options.tags.length > 0) {
    await cacheStrategy.invalidateByTags(options.tags);
    return;
  }

  // Evict specific keys
  if (options.key) {
    let keys: string[];

    if (typeof options.key === "function") {
      const result = options.key(...args);
      keys = Array.isArray(result) ? result : [result];
    } else if (Array.isArray(options.key)) {
      keys = options.key;
    } else {
      keys = [options.key];
    }

    for (const key of keys) {
      await cacheStrategy.delete(key, options.namespace);
    }
  }
}

/**
 * Export all decorator metadata keys for interceptor use
 */
export const CacheDecoratorKeys = {
  CACHEABLE: CACHEABLE_KEY,
  CACHE_EVICT: CACHE_EVICT_KEY,
  CACHE_PUT: CACHE_PUT_KEY,
};
