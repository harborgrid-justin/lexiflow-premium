import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Configuration options for useParallelData hook
 */
export interface UseParallelDataOptions {
  /**
   * Whether to execute the fetchers immediately on mount
   * @default true
   */
  immediate?: boolean;
  
  /**
   * Dependencies array - re-fetch when these values change
   * @default []
   */
  dependencies?: React.DependencyList;
}

/**
 * Return type for useParallelData hook
 */
export interface UseParallelDataReturn<T extends readonly unknown[]> {
  /**
   * Tuple of fetched data matching the fetchers order
   */
  data: T | undefined;
  
  /**
   * Whether any request is currently in progress
   */
  loading: boolean;
  
  /**
   * Error message if any request failed
   */
  error: string | undefined;
  
  /**
   * Function to manually retry all requests
   */
  retry: () => Promise<void>;
}

/**
 * Generic hook for managing multiple parallel async data fetches.
 * Executes all fetchers simultaneously and returns results as a type-safe tuple.
 * Eliminates repetitive Promise.all patterns with manual state management.
 * 
 * @template T - Tuple type representing the return types of all fetchers
 * @param fetchers - Array of async functions to execute in parallel
 * @param options - Configuration options
 * @returns Object containing data tuple, loading, error, and retry
 * 
 * @example
 * // Basic usage - fetch two resources in parallel
 * const { data, loading, error } = useParallelData([
 *   async () => await api.custodians.getAll(),
 *   async () => await api.collections.getAll()
 * ]);
 * 
 * if (data) {
 *   const [custodians, collections] = data;
 *   // custodians and collections are fully typed
 * }
 * 
 * @example
 * // With type annotations for better IntelliSense
 * const { data, loading, error } = useParallelData<
 *   [Custodian[], Collection[], Matter[]]
 * >([
 *   async () => await api.custodians.getAll(),
 *   async () => await api.collections.getAll(),
 *   async () => await api.matters.getAll()
 * ]);
 * 
 * @example
 * // Manual execution with dependencies
 * const { data, loading, error, retry } = useParallelData(
 *   [
 *     async () => await api.custodians.search(query),
 *     async () => await api.collections.search(query)
 *   ],
 *   { 
 *     immediate: false,
 *     dependencies: [query]
 *   }
 * );
 * 
 * @example
 * // Multiple API calls for dashboard
 * const { data, loading } = useParallelData([
 *   async () => await api.stats.getCounts(),
 *   async () => await api.stats.getRecent(),
 *   async () => await api.users.getCurrent(),
 *   async () => await api.notifications.getUnread()
 * ]);
 * 
 * if (data) {
 *   const [counts, recent, user, notifications] = data;
 * }
 */
export function useParallelData<T extends readonly unknown[]>(
  fetchers: readonly [(...args: any[]) => Promise<T[0]>, ...Array<(...args: any[]) => Promise<any>>],
  options: UseParallelDataOptions = {}
): UseParallelDataReturn<T> {
  const {
    immediate = true,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | undefined>();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(undefined);

    try {
      // Execute all fetchers in parallel
      const results = await Promise.all(
        fetchers.map(fetcher => fetcher())
      );
      
      if (isMountedRef.current) {
        setData(results as unknown as T);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = err instanceof Error
          ? err.message
          : 'An unexpected error occurred while fetching data';
        
        setError(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchers]);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [execute, immediate, ...dependencies]);

  const retry = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    retry
  };
}
