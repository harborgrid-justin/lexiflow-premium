/**
 * usePrefetch.ts
 * Data prefetching hook for improved perceived performance
 * Supports hover, viewport, and predictive prefetching strategies
 */

import { useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type PrefetchStrategy = 'hover' | 'viewport' | 'immediate' | 'idle';

export interface PrefetchOptions {
  strategy?: PrefetchStrategy;
  delay?: number; // Delay before prefetch (for hover strategy)
  cache?: boolean; // Whether to cache prefetched data
  priority?: 'high' | 'low' | 'auto';
}

export interface PrefetchResult<T> {
  data: T | null;
  isPrefetching: boolean;
  error: Error | null;
  prefetch: () => void;
}

// ============================================================================
// Cache Storage
// ============================================================================

class PrefetchCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minutes
  private maxSize: number = 100;

  set(key: string, data: any) {
    // Implement LRU by removing oldest entries when cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

const prefetchCache = new PrefetchCache();

// ============================================================================
// usePrefetch Hook
// ============================================================================

export function usePrefetch<T = any>(
  fetcher: () => Promise<T>,
  key: string,
  options: PrefetchOptions = {}
): PrefetchResult<T> {
  const {
    strategy = 'hover',
    delay = 100,
    cache = true,
    priority = 'auto',
  } = options;

  const [data, setData] = React.useState<T | null>(null);
  const [isPrefetching, setIsPrefetching] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  const hasPrefetchedRef = useRef(false);

  // ============================================================================
  // Prefetch Function
  // ============================================================================

  const prefetch = useCallback(async () => {
    // Check cache first
    if (cache && prefetchCache.has(key)) {
      const cachedData = prefetchCache.get(key);
      if (isMountedRef.current) {
        setData(cachedData);
      }
      return;
    }

    // Skip if already prefetching
    if (isPrefetching || hasPrefetchedRef.current) return;

    setIsPrefetching(true);
    setError(null);

    try {
      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setIsPrefetching(false);
        hasPrefetchedRef.current = true;

        // Cache the result
        if (cache) {
          prefetchCache.set(key, result);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Prefetch failed'));
        setIsPrefetching(false);
      }
    }
  }, [fetcher, key, cache, isPrefetching]);

  // ============================================================================
  // Strategy: Immediate
  // ============================================================================

  useEffect(() => {
    if (strategy === 'immediate') {
      prefetch();
    }
  }, [strategy, prefetch]);

  // ============================================================================
  // Strategy: Idle
  // ============================================================================

  useEffect(() => {
    if (strategy === 'idle' && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        prefetch();
      });

      return () => {
        window.cancelIdleCallback(idleCallback);
      };
    }
  }, [strategy, prefetch]);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isPrefetching,
    error,
    prefetch,
  };
}

// ============================================================================
// usePrefetchOnHover Hook
// ============================================================================

export function usePrefetchOnHover<T = any>(
  fetcher: () => Promise<T>,
  key: string,
  options: Omit<PrefetchOptions, 'strategy'> = {}
) {
  const { delay = 100, ...restOptions } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { prefetch, ...rest } = usePrefetch<T>(fetcher, key, {
    ...restOptions,
    strategy: 'hover',
  });

  const onMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      prefetch();
    }, delay);
  }, [prefetch, delay]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    ...rest,
    prefetch,
    onMouseEnter,
    onMouseLeave,
  };
}

// ============================================================================
// usePrefetchOnViewport Hook
// ============================================================================

export function usePrefetchOnViewport<T = any>(
  fetcher: () => Promise<T>,
  key: string,
  options: Omit<PrefetchOptions, 'strategy'> & {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { threshold = 0.1, rootMargin = '50px', ...restOptions } = options;
  const elementRef = useRef<HTMLElement | null>(null);

  const { prefetch, ...rest } = usePrefetch<T>(fetcher, key, {
    ...restOptions,
    strategy: 'viewport',
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            prefetch();
            observer.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [prefetch, threshold, rootMargin]);

  return {
    ...rest,
    prefetch,
    ref: elementRef,
  };
}

// ============================================================================
// usePrefetchLink Hook (for navigation)
// ============================================================================

export function usePrefetchLink(
  url: string,
  options: {
    strategy?: PrefetchStrategy;
    delay?: number;
  } = {}
) {
  const { strategy = 'hover', delay = 100 } = options;

  const prefetchLink = useCallback(() => {
    // Use link prefetch
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'document';
    document.head.appendChild(link);
  }, [url]);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const onMouseEnter = useCallback(() => {
    if (strategy === 'hover') {
      timeoutRef.current = setTimeout(prefetchLink, delay);
    }
  }, [strategy, prefetchLink, delay]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (strategy === 'immediate') {
      prefetchLink();
    }
  }, [strategy, prefetchLink]);

  return {
    onMouseEnter,
    onMouseLeave,
    prefetch: prefetchLink,
  };
}

// ============================================================================
// Utility: Clear Cache
// ============================================================================

export function clearPrefetchCache(key?: string) {
  if (key) {
    prefetchCache.delete(key);
  } else {
    prefetchCache.clear();
  }
}

export default usePrefetch;
