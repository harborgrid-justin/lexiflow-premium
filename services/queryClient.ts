
import { useState, useEffect, useCallback, useRef } from 'react';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = () => Promise<T>;

interface QueryState<T> {
  data: T | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: Error | null;
  dataUpdatedAt: number;
}

export interface UseQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
  refetchOnWindowFocus?: boolean;
  initialData?: T;
}

const MAX_CACHE_SIZE = 100; // Increased limit for enterprise data volume

// Optimized Deep Equal using native JSON serialization with cycle detection
function fastDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  try {
    return stableStringify(obj1) === stableStringify(obj2);
  } catch (e) {
    console.warn("Deep equal failed due to circular structure, falling back to false");
    return false;
  }
}

/**
 * Cycle-Safe Stringify
 * Prevents "Maximum call stack size exceeded" errors when caching objects with circular references.
 */
function stableStringify(obj: any, seen: WeakSet<object> = new WeakSet()): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (seen.has(obj)) {
    return '"[Circular]"';
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    const arrStr = '[' + obj.map(n => stableStringify(n, seen)).join(',') + ']';
    seen.delete(obj);
    return arrStr;
  }

  const keys = Object.keys(obj).sort();
  const objStr = '{' + keys.map(key => {
    const val = obj[key];
    // Skip functions and undefined in cache keys
    if (typeof val === 'function' || val === undefined) return ''; 
    return JSON.stringify(key) + ':' + stableStringify(val, seen);
  }).filter(Boolean).join(',') + '}';
  
  seen.delete(obj);
  return objStr;
}

class QueryClient {
  private cache: Map<string, QueryState<any>> = new Map();
  private listeners: Map<string, Set<(state: QueryState<any>) => void>> = new Map();
  private inflight: Map<string, Promise<any>> = new Map();

  public hashKey(key: QueryKey): string {
    try {
      return stableStringify(key);
    } catch (e) {
      console.error("Failed to hash query key", e);
      return String(key); // Fallback
    }
  }

  private touch(key: string) {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value); // Re-insert to update LRU position (Map preserves insertion order)
    }
  }

  private enforceLimits() {
    if (this.cache.size > MAX_CACHE_SIZE) {
      // Maps iterate in insertion order, so the first key is the "oldest" (LRU)
      const iterator = this.cache.keys();
      const oldestKey = iterator.next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.listeners.delete(oldestKey);
      }
    }
  }

  getQueryState<T>(key: QueryKey): QueryState<T> | undefined {
    const hashedKey = this.hashKey(key);
    if (this.cache.has(hashedKey)) {
      this.touch(hashedKey);
      return this.cache.get(hashedKey) as QueryState<T>;
    }
    return undefined;
  }

  subscribe(key: QueryKey, listener: (state: QueryState<any>) => void) {
    const hashedKey = this.hashKey(key);
    if (!this.listeners.has(hashedKey)) {
      this.listeners.set(hashedKey, new Set());
    }
    this.listeners.get(hashedKey)!.add(listener);
    
    // Notify immediately if data exists
    if (this.cache.has(hashedKey)) {
      this.touch(hashedKey); 
      listener(this.cache.get(hashedKey)!);
    }
    
    return () => {
      const listeners = this.listeners.get(hashedKey);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(hashedKey);
        }
      }
    };
  }

  async fetch<T>(key: QueryKey, fn: QueryFunction<T>, staleTime = 30000, force = false): Promise<T> {
    const hashedKey = this.hashKey(key);
    const cached = this.cache.get(hashedKey);
    const now = Date.now();

    // Return cached data if fresh
    if (!force && cached && cached.status === 'success' && (now - cached.dataUpdatedAt < staleTime)) {
      this.touch(hashedKey);
      return cached.data;
    }

    // Deduplicate in-flight requests
    if (this.inflight.has(hashedKey)) {
      return this.inflight.get(hashedKey);
    }

    // Set loading state if no cache exists or if forcing refresh
    if (!cached || force) {
      this.notify(hashedKey, { 
        data: cached?.data, 
        status: 'loading', 
        error: null, 
        dataUpdatedAt: cached?.dataUpdatedAt || 0 
      });
    }

    const promise = fn()
      .then((data) => {
        const currentCache = this.cache.get(hashedKey);
        
        // Optimization: Return stable reference if deep equal
        if (currentCache && fastDeepEqual(currentCache.data, data)) {
           currentCache.dataUpdatedAt = Date.now();
           this.cache.set(hashedKey, currentCache);
           this.inflight.delete(hashedKey);
           return currentCache.data; 
        }

        const state: QueryState<T> = { 
          data, 
          status: 'success', 
          error: null, 
          dataUpdatedAt: Date.now() 
        };
        
        this.cache.set(hashedKey, state);
        this.enforceLimits(); 
        this.notify(hashedKey, state);
        this.inflight.delete(hashedKey);
        return data;
      })
      .catch((rawError) => {
        const error = rawError instanceof Error ? rawError : new Error(String(rawError));
        const state: QueryState<T> = { 
          data: cached?.data, 
          status: 'error', 
          error, 
          dataUpdatedAt: cached?.dataUpdatedAt || 0 
        };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); 
        this.notify(hashedKey, state);
        this.inflight.delete(hashedKey);
        throw error;
      });

    this.inflight.set(hashedKey, promise);
    return promise;
  }

  invalidate(keyPattern: string | QueryKey) {
    // If string pattern, match partial. If object/array, hash it and look for exact match.
    const searchStr = typeof keyPattern === 'string' ? keyPattern : this.hashKey(keyPattern).replace(/"/g, '');
    
    for (const key of this.cache.keys()) {
      if (key.includes(searchStr)) {
        const current = this.cache.get(key);
        if (current) {
           // Soft invalidate: keep data but mark stale (timestamp 0)
           const invalidState: QueryState<any> = { ...current, dataUpdatedAt: 0 };
           this.cache.set(key, invalidState);
           // Notify listeners to trigger refetch if active
           if (this.listeners.has(key) && this.listeners.get(key)!.size > 0) {
               this.notify(key, invalidState);
           }
        }
      }
    }
  }

  setQueryData<T>(key: QueryKey, updater: T | ((oldData: T | undefined) => T | undefined)) {
      const hashedKey = this.hashKey(key);
      const oldState = this.cache.get(hashedKey);
      const oldData = oldState ? (oldState.data as T | undefined) : undefined;
      
      let data: T | undefined;
      try {
          if (typeof updater === 'function') {
              data = (updater as (oldData: T | undefined) => T | undefined)(oldData);
          } else {
              data = updater;
          }
      } catch (e) {
          console.error("Error updating query data", e);
          return;
      }
      
      if (typeof data === 'undefined') return;

      const state: QueryState<T> = { 
        data, 
        status: 'success', 
        error: null, 
        dataUpdatedAt: Date.now() 
      };
      
      this.cache.set(hashedKey, state);
      this.enforceLimits(); 
      this.notify(hashedKey, state);
  }

  private notify(hashedKey: string, state: QueryState<any>) {
    this.listeners.get(hashedKey)?.forEach(listener => listener(state));
  }
}

export const queryClient = new QueryClient();

export function useQuery<T>(key: QueryKey, fn: QueryFunction<T>, options: UseQueryOptions<T> = {}) {
  const { staleTime = 60000, enabled = true, onSuccess, onError, refetchOnWindowFocus = true, initialData } = options;
  
  // Use hashedKey for stable identity across renders
  const hashedKey = queryClient.hashKey(key);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryState<T>(key);
    if (cached) return cached;
    if (initialData !== undefined) return { data: initialData, status: 'success', error: null, dataUpdatedAt: Date.now() };
    return { data: undefined, status: 'idle', error: null, dataUpdatedAt: 0 };
  });

  const hasFetched = useRef(false);
  const fnRef = useRef(fn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep refs up to date to avoid effect re-triggers
  useEffect(() => {
    fnRef.current = fn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [fn, onSuccess, onError]);

  // Stable refetch function
  const refetch = useCallback(() => {
     if (!enabled) return Promise.reject(new Error("Query is not enabled."));
     return queryClient.fetch(key, fnRef.current, staleTime, true);
  }, [hashedKey, staleTime, enabled]); // Intentionally using hashedKey string

  useEffect(() => {
    if (!enabled) return;
    
    // Subscribe to cache updates
    const unsubscribe = queryClient.subscribe(key, (newState) => {
      setState(newState as QueryState<T>);
      // Trigger background refetch if stale
      if (newState.status === 'success' && newState.dataUpdatedAt === 0) {
          queryClient.fetch(key, fnRef.current, staleTime, true);
      }
    });
    
    // Initial fetch
    queryClient.fetch<T>(key, fnRef.current, staleTime)
      .then((data) => {
         if (onSuccessRef.current && !hasFetched.current) {
           onSuccessRef.current(data);
           hasFetched.current = true;
         }
      })
      .catch((err) => {
         if (onErrorRef.current) onErrorRef.current(err);
      });

    // Window focus refetching
    let focusHandler: () => void;
    if (refetchOnWindowFocus && enabled) {
        focusHandler = () => {
            if (document.visibilityState === 'visible') {
                const queryState = queryClient.getQueryState(key);
                // Only refetch if stale
                if (queryState && Date.now() - queryState.dataUpdatedAt > staleTime) {
                    refetch();
                }
            }
        };
        window.addEventListener('focus', focusHandler);
        window.addEventListener('visibilitychange', focusHandler);
    }

    return () => {
        unsubscribe();
        if (focusHandler) {
            window.removeEventListener('focus', focusHandler);
            window.removeEventListener('visibilitychange', focusHandler);
        }
    };
  }, [hashedKey, enabled, staleTime, refetchOnWindowFocus, refetch]);

  return { 
    ...state, 
    isLoading: state.status === 'loading' || (enabled && state.status === 'idle'),
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    refetch
  };
}

export function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options?: { 
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: any) => void;
    onMutate?: (variables: V) => void;
    invalidateKeys?: QueryKey[]; 
  }
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);

  const optionsRef = useRef(options);
  const fnRef = useRef(mutationFn);

  useEffect(() => {
      optionsRef.current = options;
      fnRef.current = mutationFn;
  }, [options, mutationFn]);

  const mutate = useCallback(async (variables: V) => {
    setStatus('pending');
    setError(null);
    
    const opts = optionsRef.current;
    
    if (opts?.onMutate) {
        try {
            opts.onMutate(variables);
        } catch(e) {
            console.error("Error in mutation onMutate callback", e);
        }
    }

    try {
      const result = await fnRef.current(variables);
      setData(result);
      setStatus('success');
      
      if (opts?.invalidateKeys) {
        opts.invalidateKeys.forEach(k => queryClient.invalidate(k));
      }
      
      if (opts?.onSuccess) {
        opts.onSuccess(result, variables);
      }
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setStatus('error');
      
      if (opts?.onError) {
        opts.onError(err);
      }
      // Re-throw so awaiters can catch if they want
      throw err;
    }
  }, []);

  return { mutate, isLoading: status === 'pending', isSuccess: status === 'success', isError: status === 'error', error, data };
}
