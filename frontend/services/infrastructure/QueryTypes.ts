/**
 * Query Types - Shared type definitions for query system
 * Optimized for React 18 and Optimistic Updates
 */

export type QueryKey = string | readonly unknown[];

/**
 * Enhanced QueryFunction to support native fetch AbortSignals
 */
export type QueryFunction<T> = (signal: AbortSignal) => Promise<T>;

export interface QueryState<T> {
  data: T | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: Error | null;
  dataUpdatedAt: number;
  isFetching: boolean;
}

export interface UseQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
  refetchOnWindowFocus?: boolean;
  initialData?: T;
  cacheBypass?: boolean;
}

/**
 * MutationContext is primarily used to store "previousData" 
 * for rollback logic during optimistic updates.
 */
export interface MutationContext {
  previousData?: any;
  [key: string]: any;
}

export interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V, context: MutationContext) => void;
  onError?: (error: Error, variables: V, context: MutationContext) => void;
  /**
   * onMutate is the core of Optimistic Updates. 
   * It should return a context object containing the snapshot of data before the change.
   */
  onMutate?: (variables: V) => Promise<MutationContext> | MutationContext;
  onSettled?: (data: T | undefined, error: Error | null, variables: V, context: MutationContext) => void;
  invalidateKeys?: QueryKey[];
}

export interface QueryClientStats {
  cacheSize: number;
  maxCacheSize: number;
  listenerKeys: number;
  globalListeners: number;
  inflightQueries: number;
  emptyListenerSets: number;
}