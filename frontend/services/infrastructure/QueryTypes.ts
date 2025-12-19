/**
 * Query Types - Shared type definitions for query system
 * 
 * Purpose: Centralize type definitions
 * Extracted from: queryClient.ts
 */

export type QueryKey = string | readonly unknown[];
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

export interface MutationContext {
  [key: string]: any;
}

export interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V, context?: MutationContext) => void;
  onError?: (error: Error, variables: V, context?: MutationContext) => void;
  onMutate?: (variables: V) => Promise<MutationContext | void> | MutationContext | void;
  onSettled?: (data: T | undefined, error: Error | null, variables: V, context?: MutationContext) => void;
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
