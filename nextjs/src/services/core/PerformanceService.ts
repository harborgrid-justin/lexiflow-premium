/**
 * Performance Service - Pagination, caching, and performance monitoring
 *
 * @module services/core/PerformanceService
 * @description Provides:
 * - **Pagination helpers** - Convert between page/offset, calculate totals
 * - **Cache management** - LRU cache with TTL and invalidation
 * - **Performance monitoring** - Track operation durations and hit rates
 * - **Query optimization** - Debouncing, deduplication, prefetching
 *
 * @usage
 * ```typescript
 * // Paginate results
 * const paginated = PerformanceService.paginate(allCases, { page: 1, pageSize: 25 });
 *
 * // Cache expensive operation
 * const result = await PerformanceService.withCache(
 *   'cases-analytics',
 *   () => computeExpensiveAnalytics(),
 *   { ttl: 300000 } // 5 min
 * );
 *
 * // Monitor performance
 * const metrics = await PerformanceService.measureOperation(
 *   'fetchCases',
 *   () => api.cases.getAll()
 * );
 * ```
 */

import {
  PaginatedResult,
  PaginationParams,
  PerformanceMetrics,
} from "@/types/pagination";
import { ValidationService } from "./ValidationService";

/**
 * LRU Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

/**
 * Performance Service
 * Handles pagination, caching, and performance monitoring
 */
export class PerformanceService {
  private static cache = new Map<string, CacheEntry<any>>();
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_CACHE_SIZE = 1000;
  private static readonly MAX_METRICS = 10000;

  // =============================================================================
  // PAGINATION
  // =============================================================================

  /**
   * Paginate an array of items
   *
   * @param items - Full array of items
   * @param params - Pagination parameters
   * @returns Paginated result with metadata
   */
  static paginate<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
    const { page, pageSize, sortBy, sortOrder = "asc", search } = params;

    // Validate pagination params
    if (page < 1) {
      throw new Error("Page number must be >= 1");
    }
    if (pageSize < 1 || pageSize > 1000) {
      throw new Error("Page size must be between 1 and 1000");
    }

    let filteredItems = [...items];

    // Apply search filter if provided
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(searchLower);
      });
    }

    // Apply sorting if specified
    if (sortBy) {
      filteredItems.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];

        if (aVal === bVal) return 0;

        const comparison = aVal < bVal ? -1 : 1;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const data = filteredItems.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      sort: sortBy ? { field: sortBy, order: sortOrder } : undefined,
      filters: search ? { search } : undefined,
    };
  }

  /**
   * Convert page number to offset for database queries
   *
   * @param page - Page number (1-indexed)
   * @param pageSize - Items per page
   * @returns Offset for database query
   */
  static pageToOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  /**
   * Create pagination metadata from total count
   *
   * @param page - Current page
   * @param pageSize - Items per page
   * @param totalItems - Total count across all pages
   * @returns Pagination metadata
   */
  static createPaginationMetadata(
    page: number,
    pageSize: number,
    totalItems: number
  ) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // =============================================================================
  // CACHING
  // =============================================================================

  /**
   * Execute operation with caching
   *
   * @param key - Cache key
   * @param operation - Function to execute if cache miss
   * @param config - Cache configuration
   * @returns Cached or fresh result
   */
  static async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    config: { ttl?: number; enabled?: boolean } = {}
  ): Promise<T> {
    const { ttl = 300000, enabled = true } = config; // Default 5 min TTL

    if (!enabled) {
      return operation();
    }

    ValidationService.validateRequired(key, "Cache key");

    // Check cache
    const cached = PerformanceService.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      cached.hits++;
      console.log(
        `[PerformanceService] Cache HIT: ${key} (hits: ${cached.hits})`
      );
      return cached.data;
    }

    // Cache miss - execute operation
    console.log(`[PerformanceService] Cache MISS: ${key}`);
    const result = await operation();

    // Store in cache
    PerformanceService.cache.set(key, {
      data: result,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });

    // Evict oldest entries if cache is full (LRU)
    if (PerformanceService.cache.size > PerformanceService.MAX_CACHE_SIZE) {
      PerformanceService.evictOldestEntries();
    }

    return result;
  }

  /**
   * Invalidate cache by key or pattern
   *
   * @param keyOrPattern - Cache key or pattern (supports wildcards)
   */
  static invalidateCache(keyOrPattern: string): void {
    if (keyOrPattern.includes("*")) {
      // Pattern matching
      const pattern = keyOrPattern.replace(/\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`);

      const keysToDelete: string[] = [];
      PerformanceService.cache.forEach((_, key) => {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach((key) => PerformanceService.cache.delete(key));
      console.log(
        `[PerformanceService] Invalidated ${keysToDelete.length} cache entries matching ${keyOrPattern}`
      );
    } else {
      // Exact key
      PerformanceService.cache.delete(keyOrPattern);
      console.log(`[PerformanceService] Invalidated cache: ${keyOrPattern}`);
    }
  }

  /**
   * Clear all cache entries
   */
  static clearCache(): void {
    const size = PerformanceService.cache.size;
    PerformanceService.cache.clear();
    console.log(`[PerformanceService] Cleared ${size} cache entries`);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    let totalHits = 0;
    let totalRequests = 0;
    const entries: Array<{ key: string; hits: number; age: number }> = [];

    PerformanceService.cache.forEach((entry, key) => {
      totalHits += entry.hits;
      totalRequests += entry.hits + 1; // +1 for initial cache miss
      entries.push({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp,
      });
    });

    return {
      size: PerformanceService.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      entries: entries.sort((a, b) => b.hits - a.hits),
    };
  }

  /**
   * Evict oldest cache entries (LRU)
   */
  private static evictOldestEntries(): void {
    const entries = Array.from(PerformanceService.cache.entries());
    entries.sort((a, b) => {
      // Sort by last access time (timestamp + hits as proxy)
      return a[1].timestamp - b[1].timestamp;
    });

    const toRemove = entries.slice(
      0,
      Math.floor(PerformanceService.MAX_CACHE_SIZE * 0.2)
    );
    toRemove.forEach(([key]) => PerformanceService.cache.delete(key));

    console.log(
      `[PerformanceService] Evicted ${toRemove.length} old cache entries`
    );
  }

  // =============================================================================
  // PERFORMANCE MONITORING
  // =============================================================================

  /**
   * Measure operation performance
   *
   * @param operation - Operation name
   * @param fn - Function to measure
   * @returns Result of function and performance metrics
   */
  static async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      const metrics: PerformanceMetrics = {
        operation,
        duration,
        cached: false,
        timestamp: new Date().toISOString(),
        itemCount: Array.isArray(result) ? result.length : undefined,
      };

      PerformanceService.recordMetrics(metrics);

      if (duration > 1000) {
        console.warn(
          `[PerformanceService] SLOW operation: ${operation} took ${duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (err) {
      const duration = performance.now() - startTime;
      console.error(
        `[PerformanceService] FAILED operation: ${operation} (${duration.toFixed(2)}ms)`,
        err
      );
      throw err;
    }
  }

  /**
   * Record performance metrics
   */
  private static recordMetrics(metrics: PerformanceMetrics): void {
    PerformanceService.metrics.push(metrics);

    // Trim metrics if exceeding max
    if (PerformanceService.metrics.length > PerformanceService.MAX_METRICS) {
      PerformanceService.metrics = PerformanceService.metrics.slice(
        -PerformanceService.MAX_METRICS
      );
    }
  }

  /**
   * Get performance metrics summary
   */
  static getPerformanceMetrics(operation?: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    cacheHitRate: number;
  } {
    let metrics = PerformanceService.metrics;
    if (operation) {
      metrics = metrics.filter((m) => m.operation === operation);
    }

    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        cacheHitRate: 0,
      };
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((acc, d) => acc + d, 0);
    const cachedCount = metrics.filter((m) => m.cached).length;

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * durations.length) - 1;
      return durations[Math.max(0, index)] ?? 0;
    };

    return {
      count: metrics.length,
      avgDuration: sum / metrics.length,
      minDuration: durations[0] ?? 0,
      maxDuration: durations[durations.length - 1] ?? 0,
      p50Duration: percentile(50),
      p95Duration: percentile(95),
      p99Duration: percentile(99),
      cacheHitRate: cachedCount / metrics.length,
    };
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    const count = PerformanceService.metrics.length;
    PerformanceService.metrics = [];
    console.log(`[PerformanceService] Cleared ${count} performance metrics`);
  }

  // =============================================================================
  // QUERY OPTIMIZATION
  // =============================================================================

  /**
   * Debounce function calls
   * Useful for search inputs and expensive operations
   *
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function calls
   * Ensures function is called at most once per interval
   *
   * @param fn - Function to throttle
   * @param interval - Interval in milliseconds
   * @returns Throttled function
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    interval: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  /**
   * Deduplicate concurrent requests
   * Prevents multiple identical API calls in flight
   *
   * @param key - Deduplication key
   * @param fn - Function to execute
   * @returns Promise that resolves when operation completes
   */
  private static pendingRequests = new Map<string, Promise<any>>();

  static async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check for pending request
    if (PerformanceService.pendingRequests.has(key)) {
      console.log(`[PerformanceService] Deduplicating request: ${key}`);
      return PerformanceService.pendingRequests.get(key)!;
    }

    // Execute and store promise
    const promise = fn().finally(() => {
      PerformanceService.pendingRequests.delete(key);
    });

    PerformanceService.pendingRequests.set(key, promise);
    return promise;
  }
}
