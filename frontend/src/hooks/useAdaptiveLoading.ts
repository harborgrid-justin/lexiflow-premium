/**
 * @module hooks/useAdaptiveLoading
 * @category Hooks
 * @description Smart loading state management with stale-while-revalidate pattern.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_RETRY_ATTEMPTS, API_RETRY_DELAY_MS, QUERY_CACHE_STALE_TIME_MS } from '../config/master.config';

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'validating' | 'success' | 'error';

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

/**
 * Hook options
 */
export interface UseAdaptiveLoadingOptions<T> {
  /** Fetch function that returns data */
  fetcher: () => Promise<T>;
  /** Cache key for localStorage */
  cacheKey?: string;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
  /** Revalidate stale data in background */
  revalidateOnMount?: boolean;
  /** Revalidate on window focus */
  revalidateOnFocus?: boolean;
  /** Revalidate interval in milliseconds */
  revalidateInterval?: number;
  /** Retry on error */
  retryOnError?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Dedupe requests within this time window (ms) */
  dedupingInterval?: number;
  /** onSuccess callback */
  onSuccess?: (data: T) => void;
  /** onError callback */
  onError?: (error: Error) => void;
}

/**
 * Hook return type
 */
export interface UseAdaptiveLoadingReturn<T> {
  data: T | null;
  error: Error | null;
  state: LoadingState;
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
  mutate: (data: T | ((current: T | null) => T)) => void;
  reset: () => void;
}

/**
 * In-flight request tracker for deduplication
 */
const requestCache = new Map<string, Promise<unknown>>();

/**
 * Adaptive Loading Hook
 * 
 * Implements stale-while-revalidate pattern:
 * 1. Return cached data immediately (if available)
 * 2. Fetch fresh data in background
 * 3. Update UI when new data arrives
 * 4. Handle errors gracefully with retry
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   isStale,
 *   refresh
 * } = useAdaptiveLoading({
 *   fetcher: () => fetchCaseDetails(caseId),
 *   cacheKey: `case-${caseId}`,
 *   cacheDuration: 5 * 60 * 1000, // 5 minutes
 *   revalidateOnMount: true
 * });
 * 
 * if (isLoading && !data) {
 *   return <AdaptiveLoader contentType="case-detail" />;
 * }
 * 
 * if (isStale && data) {
 *   return (
 *     <AdaptiveLoader
 *       showStale
 *       staleContent={<CaseDetail data={data} />}
 *       message="Updating..."
 *     />
 *   );
 * }
 * 
 * return <CaseDetail data={data} />;
 * ```
 */
export function useAdaptiveLoading<T = any>(
  options: UseAdaptiveLoadingOptions<T>
): UseAdaptiveLoadingReturn<T> {
  const {
    fetcher,
    cacheKey,
    cacheDuration = QUERY_CACHE_STALE_TIME_MS * 5, // 5x stale time
    revalidateOnMount = true,
    revalidateOnFocus = true,
    revalidateInterval,
    retryOnError = true,
    maxRetries = API_RETRY_ATTEMPTS,
    retryDelay = API_RETRY_DELAY_MS,
    dedupingInterval = QUERY_CACHE_STALE_TIME_MS / 30,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<LoadingState>('idle');
  const [isStale, setIsStale] = useState(false);

  const retryCountRef = useRef(0);
  const revalidateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  /**
   * Get cached data from localStorage
   */
  const getCachedData = useCallback((): CacheEntry<T> | null => {
    if (!cacheKey) return null;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;

      if (age > cacheDuration) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return entry;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, [cacheKey, cacheDuration]);

  /**
   * Save data to cache
   */
  const setCachedData = useCallback((data: T) => {
    if (!cacheKey) return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, [cacheKey]);

  /**
   * Execute fetch with retry logic
   */
  const executeFetch = useCallback(async (isRevalidation = false): Promise<T> => {
    // Check for in-flight request (deduping)
    if (cacheKey && requestCache.has(cacheKey)) {
      const timeSinceLastFetch = Date.now() - lastFetchRef.current;
      if (timeSinceLastFetch < dedupingInterval) {
        return requestCache.get(cacheKey)! as T;
      }
    }

    setState(isRevalidation ? 'validating' : 'loading');
    setError(null);

    const fetchPromise = (async () => {
      try {
        lastFetchRef.current = Date.now();
        const result = await fetcher();
        
        setData(result);
        setState('success');
        setIsStale(false);
        retryCountRef.current = 0;
        
        setCachedData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Retry logic
        if (retryOnError && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
          return executeFetch(isRevalidation);
        }
        
        setError(error);
        setState('error');
        
        if (onError) {
          onError(error);
        }
        
        throw error;
      }
    })();

    // Cache promise for deduping
    if (cacheKey) {
      requestCache.set(cacheKey, fetchPromise);
      fetchPromise.finally(() => {
        requestCache.delete(cacheKey);
      });
    }

    return fetchPromise;
  }, [fetcher, cacheKey, dedupingInterval, retryOnError, maxRetries, retryDelay, setCachedData, onSuccess, onError]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await executeFetch(!!data);
  }, [executeFetch, data]);

  /**
   * Mutate data locally (optimistic update)
   */
  const mutate = useCallback((newData: T | ((current: T | null) => T)) => {
    if (typeof newData === 'function') {
      setData(current => (newData as (current: T | null) => T)(current));
    } else {
      setData(newData);
      setCachedData(newData);
    }
  }, [setCachedData]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setState('idle');
    setIsStale(false);
    retryCountRef.current = 0;
    
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
    }
  }, [cacheKey]);

  /**
   * Initial data load
   */
  useEffect(() => {
    // Try to load from cache first
    const cached = getCachedData();
    
    if (cached) {
      setData(cached.data);
      setState('success');
      
      const age = Date.now() - cached.timestamp;
      const shouldRevalidate = age > cacheDuration * 0.8; // 80% of cache duration
      
      if (shouldRevalidate) {
        setIsStale(true);
        if (revalidateOnMount) {
          executeFetch(true);
        }
      }
    } else {
      // No cache, fetch fresh data
      executeFetch(false);
    }
  }, [getCachedData, cacheDuration, revalidateOnMount, executeFetch]);

  /**
   * Revalidate on focus
   */
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      const cached = getCachedData();
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age > cacheDuration * 0.5) {
          executeFetch(true);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, getCachedData, cacheDuration, executeFetch]);

  /**
   * Periodic revalidation
   */
  useEffect(() => {
    if (!revalidateInterval) return;

    revalidateTimerRef.current = setInterval(() => {
      executeFetch(true);
    }, revalidateInterval);

    return () => {
      if (revalidateTimerRef.current) {
        clearInterval(revalidateTimerRef.current);
      }
    };
  }, [revalidateInterval, executeFetch]);

  return {
    data,
    error,
    state,
    isLoading: state === 'loading',
    isValidating: state === 'validating',
    isStale,
    refresh,
    mutate,
    reset
  };
}

export default useAdaptiveLoading;
