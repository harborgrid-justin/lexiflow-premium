/**
 * useApi Hook
 * Comprehensive hook for API requests with loading, error handling, and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCache } from '../context/CacheContext';
import { useNotifications } from '../context/NotificationContext';

interface UseApiOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  cacheTags?: string[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  refresh: () => Promise<T | null>;
}

/**
 * Hook for making API requests with built-in state management
 *
 * @example
 * const { data, loading, error, execute } = useApi(
 *   async (id: string) => restApi.cases.getById(id),
 *   { cacheKey: 'case', showErrorToast: true }
 * );
 */
export function useApi<T = any>(
  apiFn: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    initialData = null,
    autoFetch = false,
    cacheKey,
    cacheTTL = 5 * 60 * 1000,
    cacheTags = [],
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
  } = options;

  const cache = useCache();
  const { showToast } = useNotifications();

  const [data, setData] = useState<T | null>(initialData as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const argsRef = useRef<any[]>([]);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Abort ongoing request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Store args for refresh functionality
      argsRef.current = args;

      // Check cache first
      if (cacheKey) {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          return cachedData;
        }
      }

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiFn(...args);

        if (!mountedRef.current) return null;

        setData(result);
        setLoading(false);

        // Cache the result
        if (cacheKey) {
          cache.set(cacheKey, result, cacheTTL, cacheTags);
        }

        // Success callback
        if (onSuccess) {
          onSuccess(result);
        }

        // Success toast
        if (showSuccessToast && successMessage) {
          showToast(successMessage, 'success');
        }

        return result;
      } catch (err) {
        if (!mountedRef.current) return null;

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);

        // Error callback
        if (onError) {
          onError(error);
        }

        // Error toast
        if (showErrorToast) {
          showToast(error.message || 'An error occurred', 'error');
        }

        return null;
      }
    },
    [apiFn, cacheKey, cacheTTL, cacheTags, cache, onSuccess, onError, showErrorToast, showSuccessToast, successMessage, showToast]
  );

  const reset = useCallback(() => {
    setData(initialData as T);
    setError(null);
    setLoading(false);
  }, [initialData]);

  const refresh = useCallback(async (): Promise<T | null> => {
    // Clear cache before refreshing
    if (cacheKey) {
      cache.remove(cacheKey);
    }
    return execute(...argsRef.current);
  }, [execute, cacheKey, cache]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch]); // Only run on mount

  return {
    data,
    loading,
    error,
    execute,
    reset,
    refresh,
  };
}

export default useApi;
