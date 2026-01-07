/**
 * Query client - Data fetching and caching
 * Simplified implementation (in production, use TanStack Query)
 */

import { cachePolicy } from "./cachePolicy";
import { retryPolicy } from "./retryPolicy";

interface QueryOptions {
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class QueryClient {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  async query<T>(
    key: string[],
    fetcher: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const cacheKey = JSON.stringify(key);
    const opts = { ...cachePolicy.default, ...options };

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < opts.staleTime!) {
        return cached.data;
      }
    }

    // Check in-flight requests
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Fetch with retry
    const promise = this.fetchWithRetry(
      fetcher,
      opts.retry || retryPolicy.maxAttempts
    );
    this.inFlightRequests.set(cacheKey, promise);

    try {
      const data = await promise;

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      // Set cache expiration
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, opts.cacheTime!);

      return data;
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
  }

  private async fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    maxAttempts: number,
    attempt = 1
  ): Promise<T> {
    try {
      return await fetcher();
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      // Exponential backoff
      const delay = retryPolicy.getDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.fetchWithRetry(fetcher, maxAttempts, attempt + 1);
    }
  }

  invalidate(key: string[]): void {
    const cacheKey = JSON.stringify(key);
    this.cache.delete(cacheKey);
  }

  clear(): void {
    this.cache.clear();
    this.inFlightRequests.clear();
  }
}

export const queryClient = new QueryClient();
