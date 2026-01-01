import { queryClient } from "@/services/infrastructure/queryClient";
import type {
  MutationContext,
  QueryKey,
  QueryState,
  UseMutationOptions,
  UseQueryOptions,
} from "@/services/infrastructure/queryTypes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
export { queryClient } from "@/services/infrastructure/queryClient";

export function useQuery<T>(
  key: QueryKey,
  fn: (signal: AbortSignal) => Promise<T>,
  options: UseQueryOptions<T> = {}
) {
  const { staleTime = 60000, enabled = true, initialData } = options;
  const hashedKey = useMemo(() => queryClient.hashKey(key), [key]);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryState<T>(key);
    if (cached) return cached;
    if (initialData !== undefined) {
      return {
        data: initialData,
        status: "success",
        error: null,
        dataUpdatedAt: Date.now(),
        isFetching: false,
      };
    }
    return {
      data: undefined,
      status: "idle",
      error: null,
      dataUpdatedAt: 0,
      isFetching: false,
    };
  });

  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = queryClient.subscribe(key, (newState) => {
      setState(newState as QueryState<T>);
    });

    queryClient
      .fetch(key, (sig) => fnRef.current(sig), staleTime)
      .catch(() => {});

    return unsubscribe;
  }, [hashedKey, enabled, staleTime]);

  return {
    ...state,
    isLoading:
      state.status === "loading" ||
      (state.isFetching && state.status === "idle"),
    isError: state.status === "error",
    refetch: () => queryClient.fetch(key, (sig) => fnRef.current(sig), 0),
  };
}

export function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: UseMutationOptions<T, V>
) {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(
    async (variables: V) => {
      setLoading(true);
      let context: MutationContext = {};

      try {
        // Optimistic Update Trigger
        if (options?.onMutate) {
          const result = await options.onMutate(variables);
          if (result) context = result;
        }

        const data = await mutationFn(variables);

        options?.onSuccess?.(data, variables, context);
        options?.invalidateKeys?.forEach((k) => queryClient.invalidate(k));
        options?.onSettled?.(data, null, variables, context);

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        options?.onError?.(error, variables, context);
        options?.onSettled?.(undefined, error, variables, context);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options]
  );

  return {
    mutate,
    mutateAsync: mutate, // Alias for compatibility with react-query-like APIs
    isLoading: loading,
  };
}
