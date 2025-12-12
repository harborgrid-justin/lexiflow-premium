/**
 * useAsync Hook
 * Manage async operations with loading, error, and data states
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAsyncOptions<T> {
  /**
   * Initial data value
   */
  initialData?: T;

  /**
   * Whether to execute immediately on mount
   */
  immediate?: boolean;

  /**
   * Callback when operation succeeds
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback when operation fails
   */
  onError?: (error: Error) => void;

  /**
   * Dependencies to trigger re-execution
   */
  dependencies?: any[];
}

export interface UseAsyncReturn<T, Args extends any[] = any[]> {
  /**
   * Execute the async operation
   */
  execute: (...args: Args) => Promise<T | undefined>;

  /**
   * Current data
   */
  data: T | undefined;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error if operation failed
   */
  error: Error | null;

  /**
   * Reset state to initial
   */
  reset: () => void;

  /**
   * Set data manually
   */
  setData: (data: T | undefined) => void;

  /**
   * Whether the operation has been executed at least once
   */
  called: boolean;
}

/**
 * Hook to manage async operations
 *
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   async (userId: string) => {
 *     const response = await fetch(`/api/users/${userId}`);
 *     return response.json();
 *   }
 * );
 *
 * @example
 * // With immediate execution
 * const { data, loading } = useAsync(
 *   async () => fetchData(),
 *   { immediate: true }
 * );
 */
export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const {
    initialData,
    immediate = false,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [called, setCalled] = useState<boolean>(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  // Track the latest async function to prevent race conditions
  const latestAsyncFunction = useRef(asyncFunction);
  useEffect(() => {
    latestAsyncFunction.current = asyncFunction;
  }, [asyncFunction]);

  // Execute the async operation
  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      setCalled(true);

      try {
        const result = await latestAsyncFunction.current(...args);

        if (isMounted.current) {
          setData(result);
          setLoading(false);

          if (onSuccess) {
            onSuccess(result);
          }
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (isMounted.current) {
          setError(error);
          setLoading(false);

          if (onError) {
            onError(error);
          }
        }

        throw error;
      }
    },
    [onSuccess, onError]
  );

  // Reset to initial state
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setCalled(false);
  }, [initialData]);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    execute,
    data,
    loading,
    error,
    reset,
    setData,
    called,
  };
}

/**
 * Helper hook for async operations that don't need arguments
 */
export function useAsyncCallback<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, []> {
  return useAsync(asyncFunction, options);
}

/**
 * Hook for fetching data with auto-retry on error
 */
export function useAsyncRetry<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> & {
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): UseAsyncReturn<T, Args> & { retry: () => void; retries: number } {
  const { maxRetries = 3, retryDelay = 1000, ...asyncOptions } = options;
  const [retries, setRetries] = useState(0);
  const lastArgs = useRef<Args>();

  const asyncResult = useAsync(asyncFunction, asyncOptions);

  const retry = useCallback(() => {
    if (retries < maxRetries && lastArgs.current) {
      setRetries(prev => prev + 1);
      setTimeout(() => {
        asyncResult.execute(...lastArgs.current!);
      }, retryDelay * (retries + 1)); // Exponential backoff
    }
  }, [retries, maxRetries, retryDelay, asyncResult]);

  const executeWithRetry = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      lastArgs.current = args;
      setRetries(0);

      try {
        return await asyncResult.execute(...args);
      } catch (error) {
        // Auto-retry on error
        if (retries < maxRetries) {
          setTimeout(() => {
            retry();
          }, retryDelay);
        }
        throw error;
      }
    },
    [asyncResult, retries, maxRetries, retryDelay, retry]
  );

  return {
    ...asyncResult,
    execute: executeWithRetry,
    retry,
    retries,
  };
}

export default useAsync;
