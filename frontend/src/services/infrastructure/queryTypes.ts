/**
 * Query Types for Query Client
 * Type definitions for React Query-like state management
 */

/**
 * Query key type - array of serializable values
 */
export type QueryKey = ReadonlyArray<
  string | number | boolean | Record<string, unknown> | null | undefined
>;

/**
 * Query function type with abort signal support
 */
export type QueryFunction<T = unknown> = (signal: AbortSignal) => Promise<T>;

/**
 * Query state status
 */
export type QueryStatus = "idle" | "loading" | "success" | "error";

/**
 * Query state interface
 */
export interface QueryState<T = unknown> {
  data: T | undefined;
  status: QueryStatus;
  error: Error | null;
  dataUpdatedAt: number;
  isFetching: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

/**
 * Use query options
 */
export interface UseQueryOptions<T = unknown> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Mutation context
 */
export interface MutationContext {
  [key: string]: unknown;
}

/**
 * Mutation options
 */
export interface UseMutationOptions<T = unknown, V = unknown> {
  onMutate?: (
    variables: V
  ) => Promise<MutationContext> | MutationContext | void;
  onSuccess?: (
    data: T,
    variables: V,
    context: MutationContext
  ) => Promise<void> | void;
  onError?: (
    error: Error,
    variables: V,
    context: MutationContext
  ) => Promise<void> | void;
  onSettled?: (
    data: T | undefined,
    error: Error | null,
    variables: V,
    context: MutationContext
  ) => Promise<void> | void;
  invalidateKeys?: QueryKey[];
}

/**
 * Query result interface
 */
export interface UseQueryResult<T = unknown> extends QueryState<T> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<T>;
}

/**
 * Mutation result interface
 */
export interface UseMutationResult<T = unknown, V = unknown> {
  mutate: (variables: V) => Promise<T>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: T;
  error?: Error;
  reset: () => void;
}
