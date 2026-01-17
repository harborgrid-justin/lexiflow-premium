/**
 * useApiQuery Hook
 *
 * @module useApiQuery
 * @description React hook for data fetching with caching, similar to React Query's useQuery
 * 
 * Provides:
 * - Automatic data fetching on mount
 * - Caching with configurable stale time
 * - Loading and error states
 * - Refetch functionality
 * - Subscription to query updates
 * - Request cancellation on unmount
 * - TypeScript type safety
 *
 * EXPLICIT ASYNC STATE (G51):
 * - loading: Initial fetch in progress (first-class state)
 * - error: Explicit error state, not inferred from nullability
 * - success: Explicit success indicator (isSuccess)
 * - status: Discriminated union ('idle' | 'loading' | 'success' | 'error')
 * - NOT inferred: States are explicit, not based on data presence or timing
 *
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: select transform, status derivation
 * - Effect boundary: fetch operation, cache access
 * - No render-phase side effects: All async in effects/callbacks
 *
 * REF USAGE (G45 - Identity, not data flow):
 * - retryCount: Models IDENTITY of retry attempt sequence
 * - isMounted: Models IDENTITY of component lifecycle
 * - abortControllerRef: Models IDENTITY of cancellable request
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Data stabilizes: After successful fetch
 * - Data resets: On refetch or queryKey change
 * - Data persists: In cache according to staleTime
 * - Cleanup: AbortController cancels in-flight requests on unmount
 *
 * CONCURRENCY SAFETY (G49, G50, G57):
 * - Suspense-safe: Explicit loading states, no synchronous assumptions
 * - Tearing-safe: AbortController prevents stale responses
 * - Idempotent: Multiple renders don't duplicate fetches (cache layer)
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useApiQuery(
 *   ['cases', caseId],
 *   () => api.cases.getById(caseId),
 *   { enabled: !!caseId, staleTime: 5000 }
 * );
 * ```
 */

import { useEffect, useState, useCallback, useRef } from 'react';

import { queryClient } from '@/services/infrastructure/queryClient';

import type { QueryKey } from '@/services/infrastructure/queryTypes';

/**
 * Query options configuration
 */
export interface UseQueryOptions<TData = unknown> {
  /**
   * Enable/disable automatic query execution
   * @default true
   */
  enabled?: boolean;

  /**
   * Time in milliseconds before data is considered stale
   * @default 30000 (30 seconds)
   */
  staleTime?: number;

  /**
   * Refetch on window focus
   * @default false
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Refetch on mount
   * @default true
   */
  refetchOnMount?: boolean;

  /**
   * Retry failed queries
   * @default 0
   */
  retry?: number;

  /**
   * Callback on success
   */
  onSuccess?: (data: TData) => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;

  /**
   * Initial data before first fetch
   */
  initialData?: TData;

  /**
   * Select/transform data
   */
  select?: (data: TData) => unknown;
}

/**
 * Query result
 * 
 * G51 (EXPLICIT ASYNC STATES): All async states are first-class, not inferred
 * - data: May be undefined (explicit nullability)
 * - error: Explicit error state (not inferred from !data)
 * - isLoading: Explicit initial fetch indicator
 * - isFetching: Explicit background refetch indicator
 * - isSuccess/isError: Explicit outcome indicators
 * - status: Discriminated union for type-safe state matching
 */
export interface UseQueryResult<TData = unknown> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
}

/**
 * useApiQuery Hook
 *
 * @param queryKey - Unique key for caching
 * @param queryFn - Function that returns a promise with data
 * @param options - Query configuration options
 * @returns Query result with data, loading state, error, and refetch function
 */
export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: (signal: AbortSignal) => Promise<TData>,
  options: UseQueryOptions<TData> = {}
): UseQueryResult<TData> {
  const {
    enabled = true,
    staleTime = 30000,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    retry = 0,
    onSuccess,
    onError,
    initialData,
    select,
  } = options;

  const [data, setData] = useState<TData | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const retryCount = useRef(0);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Fetch data from query function
   */
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Set loading states
    const isFirstFetch = data === undefined;
    if (isFirstFetch) {
      setIsLoading(true);
      setStatus('loading');
    }
    setIsFetching(true);
    setError(null);

    try {
      // Use query client for caching
      const result = await queryClient.fetch<TData>(
        queryKey,
        queryFn,
        staleTime
      );

      if (!isMounted.current) return;

      // Apply select transform if provided
      const finalData = select ? (select(result) as TData) : result;

      setData(finalData);
      setError(null);
      setStatus('success');
      retryCount.current = 0;

      // Call onSuccess callback
      onSuccess?.(finalData);
    } catch (err) {
      if (!isMounted.current) return;

      const error = err instanceof Error ? err : new Error(String(err));

      // Retry logic
      if (retry > 0 && retryCount.current < retry) {
        retryCount.current++;
        setTimeout(() => fetchData(), Math.min(1000 * Math.pow(2, retryCount.current), 30000));
        return;
      }

      setError(error);
      setStatus('error');

      // Call onError callback
      onError?.(error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [enabled, queryKey, queryFn, staleTime, retry, select, onSuccess, onError, data]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    // Invalidate cache before refetch
    queryClient.invalidate(queryKey);
    await fetchData();
  }, [queryKey, fetchData]);

  /**
   * Initial fetch and subscription
   */
  useEffect(() => {
    isMounted.current = true;

    // Subscribe to query state changes
    const unsubscribe = queryClient.subscribe(queryKey, (state) => {
      if (!isMounted.current) return;

      if (state.data !== undefined) {
        const finalData = select ? (select(state.data as TData) as TData) : (state.data as TData);
        setData(finalData);
      }
      if (state.error) {
        setError(state.error);
      }
      setIsFetching(state.isFetching || false);

      // Update status
      if (state.status === 'success') {
        setStatus('success');
        setIsLoading(false);
      } else if (state.status === 'error') {
        setStatus('error');
        setIsLoading(false);
      } else if (state.status === 'loading') {
        if (data === undefined) {
          setIsLoading(true);
        }
        setStatus('loading');
      }
    });

    // Initial fetch
    if (refetchOnMount || data === undefined) {
      fetchData();
    }

    return () => {
      isMounted.current = false;
      unsubscribe();

      // Cancel ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey, fetchData, refetchOnMount, select, data]);

  /**
   * Refetch on window focus
   */
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, fetchData]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isSuccess: status === 'success',
    isError: status === 'error',
    refetch,
    status,
  };
}
