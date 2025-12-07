import { useState, useEffect, useCallback, useRef } from 'react';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = () => Promise<T>;

interface QueryState<T> {
  data: T | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: any;
  dataUpdatedAt: number;
}

const MAX_CACHE_SIZE = 50; // Maximum number of queries to hold in memory

class QueryClient {
  private cache: Map<string, QueryState<any>> = new Map();
  private listeners: Map<string, Set<(state: QueryState<any>) => void>> = new Map();
  private inflight: Map<string, Promise<any>> = new Map();

  // Stable Hashing for Objects
  private stableStringify(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(n => this.stableStringify(n)).join(',') + ']';
    }
    return '{' + Object.keys(obj).sort().map(key => {
      return JSON.stringify(key) + ':' + this.stableStringify(obj[key]);
    }).join(',') + '}';
  }

  private hashKey(key: QueryKey): string {
    return this.stableStringify(key);
  }

  // LRU Implementation: Re-inserting a key moves it to the end (most recent)
  private touch(key: string) {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
  }

  private enforceLimits() {
    if (this.cache.size > MAX_CACHE_SIZE) {
      // Map iterator yields keys in insertion order. First one is oldest (LRU).
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        // Also cleanup listeners if any exist for the evicted key (though they should have unsubscribed)
        this.listeners.delete(oldestKey);
      }
    }
  }

  getQueryState<T>(key: QueryKey): QueryState<T> | undefined {
    const hashedKey = this.hashKey(key);
    if (this.cache.has(hashedKey)) {
      this.touch(hashedKey); // Mark as recently used
      return this.cache.get(hashedKey);
    }
    return undefined;
  }

  subscribe(key: QueryKey, listener: (state: QueryState<any>) => void) {
    const hashedKey = this.hashKey(key);
    if (!this.listeners.has(hashedKey)) {
      this.listeners.set(hashedKey, new Set());
    }
    this.listeners.get(hashedKey)!.add(listener);

    // Send current state immediately if exists
    if (this.cache.has(hashedKey)) {
      this.touch(hashedKey); // Mark as recently used
      listener(this.cache.get(hashedKey)!);
    }

    return () => {
      this.listeners.get(hashedKey)?.delete(listener);
      if (this.listeners.get(hashedKey)?.size === 0) {
        this.listeners.delete(hashedKey);
      }
    };
  }

  async fetch<T>(key: QueryKey, fn: QueryFunction<T>, staleTime = 30000, force = false): Promise<T> {
    const hashedKey = this.hashKey(key);
    const cached = this.cache.get(hashedKey);
    const now = Date.now();

    // Return cached if valid and fresh and not forced
    if (!force && cached && cached.status === 'success' && (now - cached.dataUpdatedAt < staleTime)) {
      this.touch(hashedKey); // Mark as recently used
      return cached.data;
    }

    // Dedup inflight requests
    if (this.inflight.has(hashedKey)) {
      return this.inflight.get(hashedKey);
    }

    // Set loading state if no cache exists (stale-while-revalidate) or force
    if (!cached || force) {
      this.notify(hashedKey, { data: cached?.data, status: 'loading', error: null, dataUpdatedAt: cached?.dataUpdatedAt || 0 });
    }

    const promise = fn()
      .then((data) => {
        const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now() };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); // Check memory budget
        this.notify(hashedKey, state);
        this.inflight.delete(hashedKey);
        return data;
      })
      .catch((error) => {
        const state: QueryState<T> = { 
          data: cached?.data, // Keep old data on error
          status: 'error', 
          error, 
          dataUpdatedAt: cached?.dataUpdatedAt || 0 
        };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); // Check memory budget
        this.notify(hashedKey, state);
        this.inflight.delete(hashedKey);
        throw error;
      });

    this.inflight.set(hashedKey, promise);
    return promise;
  }

  invalidate(keyPattern: string | QueryKey) {
    const searchStr = typeof keyPattern === 'string' ? keyPattern : this.hashKey(keyPattern).replace(/"/g, '');
    
    for (const key of this.cache.keys()) {
      // Loose matching on hashed keys
      if (key.includes(searchStr)) {
        const current = this.cache.get(key);
        if (current) {
           // Mark as stale (timestamp 0)
           this.cache.set(key, { ...current, dataUpdatedAt: 0 });
           // Trigger re-fetch if listeners exist (Auto-Refetch)
           if (this.listeners.has(key) && this.listeners.get(key)!.size > 0) {
               // We don't store the fetch function in cache, so listeners need to trigger refetch via hook logic
               // This notifies them that data is updated (technically just marked stale, but hook can check)
               this.notify(key, { ...current, dataUpdatedAt: 0 });
           }
        }
      }
    }
  }

  // Optimistic update
  setQueryData<T>(key: QueryKey, updater: T | ((oldData: T | undefined) => T | undefined)) {
      const hashedKey = this.hashKey(key);
      const oldState = this.cache.get(hashedKey);
      const oldData = oldState ? (oldState.data as T | undefined) : undefined;
      const data =
        typeof updater === 'function'
          ? (updater as (oldData: T | undefined) => T | undefined)(oldData)
          : updater;
      
      if (typeof data === 'undefined') {
          return;
      }

      const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now() };
      this.cache.set(hashedKey, state);
      this.enforceLimits(); // Check memory budget
      this.notify(hashedKey, state);
  }

  private notify(hashedKey: string, state: QueryState<any>) {
    this.listeners.get(hashedKey)?.forEach(listener => listener(state));
  }
}

export const queryClient = new QueryClient();

// --- HOOKS ---

interface UseQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  refetchOnWindowFocus?: boolean;
  // FIX: Add initialData property to allow seeding queries with initial data.
  initialData?: T;
}

export function useQuery<T>(
  key: QueryKey, 
  fn: QueryFunction<T>, 
  options: UseQueryOptions<T> = {}
) {
  const { staleTime = 60000, enabled = true, onSuccess, refetchOnWindowFocus = true, initialData } = options;
  
  // Hash key once for stability across renders
  const hashedKey = queryClient['hashKey'](key);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryState<T>(key);
    // FIX: Use initialData if provided and no cached data exists.
    if (cached) return cached;
    if (initialData !== undefined) {
      return { data: initialData, status: 'success', error: null, dataUpdatedAt: Date.now() };
    }
    return { data: undefined, status: 'idle', error: null, dataUpdatedAt: 0 };
  });

  const hasFetched = useRef(false);

  const refetch = useCallback(() => {
     if (!enabled) return Promise.reject(new Error("Query is not enabled."));
     return queryClient.fetch(key, fn, staleTime, true);
  }, [key, fn, staleTime, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = queryClient.subscribe(key, (newState) => {
      setState(newState);
      if (newState.status === 'success' && newState.dataUpdatedAt === 0) {
          queryClient.fetch(key, fn, staleTime, true);
      }
    });

    queryClient.fetch(key, fn, staleTime).then((data) => {
       if (onSuccess && !hasFetched.current) {
         onSuccess(data);
         hasFetched.current = true;
       }
    }).catch(() => {});

    // --- NEW: Refetch on window focus ---
    let focusHandler: () => void;
    if (refetchOnWindowFocus && enabled) {
        focusHandler = () => {
            const queryState = queryClient.getQueryState(key);
            if (queryState && Date.now() - queryState.dataUpdatedAt > staleTime) {
                refetch();
            }
        };
        window.addEventListener('focus', focusHandler);
        // FIX: Add visibilitychange listener for better tab switching detection
        window.addEventListener('visibilitychange', focusHandler);
    }
    
    return () => {
        unsubscribe();
        if (focusHandler) {
            window.removeEventListener('focus', focusHandler);
            // FIX: Remove visibilitychange listener on cleanup
            window.removeEventListener('visibilitychange', focusHandler);
        }
    };
  }, [hashedKey, enabled, staleTime, fn, onSuccess, refetchOnWindowFocus, refetch]);

  return { 
    ...state, 
    isLoading: state.status === 'loading' || (enabled && state.status === 'idle'),
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    refetch
  };
}

// Alias for backward compatibility, but marked deprecated
export const useDataQuery = useQuery; 

export function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: { 
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: any) => void;
    invalidateKeys?: QueryKey[]; 
  }
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const mutate = async (variables: V) => {
    setStatus('pending');
    try {
      const result = await mutationFn(variables);
      setStatus('success');
      
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(k => queryClient.invalidate(k));
      }
      if (options?.onSuccess) {
        options.onSuccess(result, variables);
      }
      return result;
    } catch (e) {
      setStatus('error');
      if (options?.onError) {
        options.onError(e);
      }
      throw e;
    }
  };

  return { mutate, isLoading: status === 'pending', isSuccess: status === 'success', isError: status === 'error' };
}