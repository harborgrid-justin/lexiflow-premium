/**
 * useApiMutation Hook
 *
 * @module useApiMutation
 * @description React hook for data mutations (POST, PUT, PATCH, DELETE)
 * Provides:
 * - Mutation state management (loading, error, success)
 * - Optimistic updates support
 * - Automatic cache invalidation
 * - Success/error callbacks
 * - TypeScript type safety
 * - Reset mutation state
 *
 * @example
 * ```tsx
 * const createCase = useApiMutation(
 *   (data: CreateCaseDto) => api.cases.create(data),
 *   {
 *     onSuccess: (data) => {
 *       toast.success('Case created!');
 *       queryClient.invalidate(['cases']);
 *     },
 *     onError: (error) => toast.error(error.message),
 *   }
 * );
 *
 * // Usage
 * await createCase.mutate({ title: 'New Case' });
 * ```
 */

import { useState, useCallback, useRef } from 'react';

import { queryClient } from '@/services/infrastructure/queryClient';

import type { QueryKey } from '@/services/infrastructure/queryTypes';

/**
 * Mutation options configuration
 */
export interface UseMutationOptions<TData = unknown, TVariables = unknown> {
  /**
   * Callback on mutation success
   */
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;

  /**
   * Callback on mutation error
   */
  onError?: (error: Error, variables: TVariables) => void | Promise<void>;

  /**
   * Callback on mutation settled (success or error)
   */
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void | Promise<void>;

  /**
   * Callback before mutation starts (for optimistic updates)
   */
  onMutate?: (variables: TVariables) => void | Promise<unknown>;

  /**
   * Query keys to invalidate on success
   */
  invalidateQueries?: QueryKey[];

  /**
   * Retry failed mutations
   * @default 0
   */
  retry?: number;

  /**
   * Retry delay in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

/**
 * Mutation result
 */
export interface UseMutationResult<TData = unknown, TVariables = unknown> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  reset: () => void;
  status: 'idle' | 'loading' | 'success' | 'error';
}

/**
 * useApiMutation Hook
 *
 * @param mutationFn - Function that performs the mutation
 * @param options - Mutation configuration options
 * @returns Mutation result with mutate function and state
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    onSettled,
    onMutate,
    invalidateQueries = [],
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const retryCount = useRef(0);
  const isMounted = useRef(true);
  const optimisticContextRef = useRef<unknown>(null);

  /**
   * Reset mutation state
   */
  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
    setStatus('idle');
    retryCount.current = 0;
  }, []);

  /**
   * Execute mutation with retry logic
   */
  const executeMutation = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setStatus('loading');
      setError(null);

      try {
        // Call onMutate for optimistic updates
        if (onMutate) {
          optimisticContextRef.current = await onMutate(variables);
        }

        // Execute mutation
        const result = await mutationFn(variables);

        if (!isMounted.current) return result;

        // Update state
        setData(result);
        setStatus('success');
        retryCount.current = 0;

        // Invalidate queries
        if (invalidateQueries.length > 0) {
          invalidateQueries.forEach((key) => {
            queryClient.invalidate(key);
          });
        }

        // Call onSuccess callback
        await onSuccess?.(result, variables);

        // Call onSettled callback
        await onSettled?.(result, null, variables);

        return result;
      } catch (err) {
        if (!isMounted.current) throw err;

        const error = err instanceof Error ? err : new Error(String(err));

        // Retry logic
        if (retry > 0 && retryCount.current < retry) {
          retryCount.current++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay * retryCount.current));
          return executeMutation(variables);
        }

        // Update error state
        setError(error);
        setStatus('error');

        // Call onError callback
        await onError?.(error, variables);

        // Call onSettled callback
        await onSettled?.(undefined, error, variables);

        throw error;
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, invalidateQueries, retry, retryDelay]
  );

  /**
   * Mutate function (doesn't return promise)
   */
  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      return await executeMutation(variables);
    },
    [executeMutation]
  );

  /**
   * MutateAsync function (returns promise)
   */
  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      return executeMutation(variables);
    },
    [executeMutation]
  );

  return {
    data,
    error,
    isLoading,
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle',
    mutate,
    mutateAsync,
    reset,
    status,
  };
}