import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Configuration options for useAsyncState hook
 */
export interface UseAsyncStateOptions<T> {
  /**
   * Whether to execute the fetcher immediately on mount
   * @default true
   */
  immediate?: boolean;
  
  /**
   * Dependencies array - re-fetch when these values change
   * @default []
   */
  dependencies?: React.DependencyList;
  
  /**
   * Custom error message or error message generator
   */
  errorMessage?: string | ((error: unknown) => string);
  
  /**
   * Initial data value
   */
  initialData?: T;
}

/**
 * Return type for useAsyncState hook
 */
export interface UseAsyncStateReturn<T> {
  /**
   * The fetched data, or undefined if not yet loaded
   */
  data: T | undefined;
  
  /**
   * Whether the request is currently in progress
   */
  loading: boolean;
  
  /**
   * Error message if the request failed
   */
  error: string | undefined;
  
  /**
   * Function to manually retry the request
   */
  retry: () => Promise<void>;
  
  /**
   * Whether this is the initial load (first request)
   */
  isInitialLoad: boolean;
}

/**
 * Generic hook for managing async data fetching with loading and error states.
 * Eliminates repetitive useState/useEffect patterns for API calls.
 * 
 * @template T - The type of data returned by the fetcher function
 * @param fetcher - Async function that returns the data
 * @param options - Configuration options
 * @returns Object containing data, loading, error, retry, and isInitialLoad
 * 
 * @example
 * // Basic usage - immediate fetch on mount
 * const { data, loading, error } = useAsyncState(
 *   async () => await api.custodians.getAll()
 * );
 * 
 * @example
 * // Manual execution
 * const { data, loading, error, retry } = useAsyncState(
 *   async () => await api.custodians.getById(id),
 *   { immediate: false }
 * );
 * // Later: retry()
 * 
 * @example
 * // Re-fetch when dependencies change
 * const { data, loading, error } = useAsyncState(
 *   async () => await api.custodians.search(query),
 *   { dependencies: [query] }
 * );
 * 
 * @example
 * // With custom error message
 * const { data, loading, error } = useAsyncState(
 *   async () => await api.custodians.getAll(),
 *   { 
 *     errorMessage: 'Failed to load custodians',
 *     initialData: []
 *   }
 * );
 * 
 * @example
 * // With dynamic error message
 * const { data, loading, error } = useAsyncState(
 *   async () => await api.collections.getById(id),
 *   { 
 *     errorMessage: (err) => `Failed to load collection: ${err.message}`,
 *     dependencies: [id]
 *   }
 * );
 */
export function useAsyncState<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const {
    immediate = true,
    dependencies = [],
    errorMessage,
    initialData
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | undefined>();
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track execution count to determine initial load
  const executionCountRef = useRef(0);

  const execute = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(undefined);

    try {
      const result = await fetcher();
      
      if (isMountedRef.current) {
        setData(result);
        executionCountRef.current += 1;
        
        if (executionCountRef.current > 1) {
          setIsInitialLoad(false);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = errorMessage
          ? typeof errorMessage === 'function'
            ? errorMessage(err)
            : errorMessage
          : err instanceof Error
          ? err.message
          : 'An unexpected error occurred';
        
        setError(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, errorMessage]);

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
    retry,
    isInitialLoad
  };
}
