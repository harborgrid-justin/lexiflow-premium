/**
 * useOptimisticUpdate.ts
 * Optimistic UI updates for better perceived performance
 * Updates UI immediately while syncing with server in background
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  onSettled?: () => void;
  retryCount?: number;
  retryDelay?: number;
}

export interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  isPending: boolean;
  error: Error | null;
}

export interface OptimisticUpdateResult<T, TArgs extends any[] = any[]> {
  data: T;
  isOptimistic: boolean;
  isPending: boolean;
  error: Error | null;
  mutate: (...args: TArgs) => Promise<T>;
  rollback: () => void;
  reset: () => void;
}

// ============================================================================
// useOptimisticUpdate Hook
// ============================================================================

export function useOptimisticUpdate<T, TArgs extends any[] = any[]>(
  initialData: T,
  mutationFn: (...args: TArgs) => Promise<T>,
  options: OptimisticUpdateOptions<T> = {}
): OptimisticUpdateResult<T, TArgs> {
  const {
    onSuccess,
    onError,
    onSettled,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const previousDataRef = useRef<T>(initialData);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // Mutate Function (Optimistic Update)
  // ============================================================================

  const mutate = useCallback(
    async (...args: TArgs): Promise<T> => {
      // Store current data for potential rollback
      previousDataRef.current = data;

      // Apply optimistic update
      setIsOptimistic(true);
      setIsPending(true);
      setError(null);

      // Extract optimistic data from args if provided
      // Convention: last arg can be optimistic data
      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === 'object' && 'optimisticData' in lastArg) {
        setData(lastArg.optimisticData as T);
      }

      try {
        // Execute mutation
        const result = await mutationFn(...args);

        if (isMountedRef.current) {
          setData(result);
          setIsOptimistic(false);
          setIsPending(false);
          retryCountRef.current = 0;

          onSuccess?.(result);
          onSettled?.();
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');

        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;

          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));

          // Retry the mutation
          return mutate(...args);
        }

        // Rollback on error
        if (isMountedRef.current) {
          setData(previousDataRef.current);
          setIsOptimistic(false);
          setIsPending(false);
          setError(error);

          onError?.(error, previousDataRef.current);
          onSettled?.();
        }

        throw error;
      }
    },
    [data, mutationFn, onSuccess, onError, onSettled, retryCount, retryDelay]
  );

  // ============================================================================
  // Rollback Function
  // ============================================================================

  const rollback = useCallback(() => {
    setData(previousDataRef.current);
    setIsOptimistic(false);
    setIsPending(false);
    setError(null);
  }, []);

  // ============================================================================
  // Reset Function
  // ============================================================================

  const reset = useCallback(() => {
    setData(initialData);
    setIsOptimistic(false);
    setIsPending(false);
    setError(null);
    retryCountRef.current = 0;
  }, [initialData]);

  return {
    data,
    isOptimistic,
    isPending,
    error,
    mutate,
    rollback,
    reset,
  };
}

// ============================================================================
// useOptimisticList Hook (for list operations)
// ============================================================================

export function useOptimisticList<T extends { id: string | number }>(
  initialItems: T[]
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingOps, setPendingOps] = useState<Set<string | number>>(new Set());

  const addOptimistic = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
    setPendingOps(prev => new Set(prev).add(item.id));
  }, []);

  const updateOptimistic = useCallback((id: string | number, updates: Partial<T>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    setPendingOps(prev => new Set(prev).add(id));
  }, []);

  const removeOptimistic = useCallback((id: string | number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setPendingOps(prev => new Set(prev).add(id));
  }, []);

  const confirmOperation = useCallback((id: string | number, serverData?: T) => {
    if (serverData) {
      setItems(prev =>
        prev.map(item => (item.id === id ? serverData : item))
      );
    }
    setPendingOps(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const rollbackOperation = useCallback((id: string | number, originalData?: T) => {
    if (originalData) {
      setItems(prev =>
        prev.map(item => (item.id === id ? originalData : item))
      );
    } else {
      setItems(prev => prev.filter(item => item.id !== id));
    }
    setPendingOps(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isPending = useCallback(
    (id: string | number) => pendingOps.has(id),
    [pendingOps]
  );

  return {
    items,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmOperation,
    rollbackOperation,
    isPending,
    pendingCount: pendingOps.size,
  };
}

// ============================================================================
// useOptimisticMutation Hook (React Query style)
// ============================================================================

export interface MutationOptions<TData, TVariables> {
  onMutate?: (variables: TVariables) => TData | Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, rollback: () => void) => void;
  onSettled?: (data: TData | undefined, error: Error | null) => void;
}

export function useOptimisticMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
) {
  const [data, setData] = useState<TData | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const previousDataRef = useRef<TData | undefined>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const rollback = useCallback(() => {
    setData(previousDataRef.current);
  }, []);

  const mutate = useCallback(
    async (variables: TVariables) => {
      previousDataRef.current = data;
      setIsPending(true);
      setError(null);

      try {
        // Call onMutate for optimistic update
        if (options.onMutate) {
          const optimisticData = await options.onMutate(variables);
          if (isMountedRef.current) {
            setData(optimisticData);
          }
        }

        // Execute mutation
        const result = await mutationFn(variables);

        if (isMountedRef.current) {
          setData(result);
          setIsPending(false);

          options.onSuccess?.(result, variables);
          options.onSettled?.(result, null);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');

        if (isMountedRef.current) {
          setError(error);
          setIsPending(false);

          options.onError?.(error, variables, rollback);
          options.onSettled?.(undefined, error);

          // Auto-rollback on error
          rollback();
        }

        throw error;
      }
    },
    [data, mutationFn, options, rollback]
  );

  return {
    data,
    isPending,
    error,
    mutate,
    rollback,
    reset: () => {
      setData(undefined);
      setError(null);
      setIsPending(false);
    },
  };
}

export default useOptimisticUpdate;
