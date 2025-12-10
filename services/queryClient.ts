
import { useState, useEffect, useCallback, useRef } from 'react';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = () => Promise<T>;

interface QueryState<T> {
  data: T | undefined;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: any;
  dataUpdatedAt: number;
}

export interface UseQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  refetchOnWindowFocus?: boolean;
  initialData?: T;
}

const MAX_CACHE_SIZE = 50; 

// Optimized Deep Equal using native JSON serialization (faster for large POJOs than JS recursion)
function fastDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  try {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  } catch (e) {
    return false;
  }
}

class QueryClient {
  private cache: Map<string, QueryState<any>> = new Map();
  private listeners: Map<string, Set<(state: QueryState<any>) => void>> = new Map();
  private inflight: Map<string, Promise<any>> = new Map();

  private stableStringify(obj: any): string {
    if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj);
    if (Array.isArray(obj)) return '[' + obj.map(n => this.stableStringify(n)).join(',') + ']';
    return '{' + Object.keys(obj).sort().map(key => JSON.stringify(key) + ':' + this.stableStringify(obj[key])).join(',') + '}';
  }

  private hashKey(key: QueryKey): string {
    return this.stableStringify(key);
  }

  private touch(key: string) {
    const value = this.cache.get(key);
    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
  }

  private enforceLimits() {
    if (this.cache.size > MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
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
    if (this.cache.has(hashedKey)) {
      this.touch(hashedKey); 
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

    if (!force && cached && cached.status === 'success' && (now - cached.dataUpdatedAt < staleTime)) {
      this.touch(hashedKey);
      return cached.data;
    }

    if (this.inflight.has(hashedKey)) return this.inflight.get(hashedKey);

    if (!cached || force) {
      this.notify(hashedKey, { data: cached?.data, status: 'loading', error: null, dataUpdatedAt: cached?.dataUpdatedAt || 0 });
    }

    const promise = fn()
      .then((data) => {
        const currentCache = this.cache.get(hashedKey);
        
        // Check for data equality to prevent unnecessary re-renders
        if (currentCache && fastDeepEqual(currentCache.data, data)) {
           currentCache.dataUpdatedAt = Date.now();
           this.cache.set(hashedKey, currentCache);
           this.inflight.delete(hashedKey);
           return data;
        }

        const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now() };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); 
        this.notify(hashedKey, state);
        this.inflight.delete(hashedKey);
        return data;
      })
      .catch((error) => {
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
    const searchStr = typeof keyPattern === 'string' ? keyPattern : this.hashKey(keyPattern).replace(/"/g, '');
    for (const key of this.cache.keys()) {
      if (key.includes(searchStr)) {
        const current = this.cache.get(key);
        if (current) {
           this.cache.set(key, { ...current, dataUpdatedAt: 0 });
           if (this.listeners.has(key) && this.listeners.get(key)!.size > 0) {
               this.notify(key, { ...current, dataUpdatedAt: 0 });
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
      if (typeof updater === 'function') {
          // Explicit cast to function type to handle TS inference
          data = (updater as (oldData: T | undefined) => T | undefined)(oldData);
      } else {
          data = updater;
      }
      
      if (typeof data === 'undefined') return;

      const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now() };
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
  const { staleTime = 60000, enabled = true, onSuccess, refetchOnWindowFocus = true, initialData } = options;
  const hashedKey = queryClient['hashKey'](key);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryState<T>(key);
    if (cached) return cached;
    if (initialData !== undefined) return { data: initialData, status: 'success', error: null, dataUpdatedAt: Date.now() };
    return { data: undefined, status: 'idle', error: null, dataUpdatedAt: 0 };
  });

  const hasFetched = useRef(false);
  
  // Use a ref for the function to prevent useEffect from re-running when fn identity changes
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const refetch = useCallback(() => {
     if (!enabled) return Promise.reject(new Error("Query is not enabled."));
     return queryClient.fetch(key, fnRef.current, staleTime, true);
  }, [key, staleTime, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = queryClient.subscribe(key, (newState) => {
      setState(newState);
      // Auto-refetch if invalidated (dataUpdatedAt === 0)
      if (newState.status === 'success' && newState.dataUpdatedAt === 0) {
          queryClient.fetch(key, fnRef.current, staleTime, true);
      }
    });
    
    // Initial fetch if needed
    queryClient.fetch(key, fnRef.current, staleTime).then((data) => {
       if (onSuccess && !hasFetched.current) {
         onSuccess(data);
         hasFetched.current = true;
       }
    }).catch(() => {});

    let focusHandler: () => void;
    if (refetchOnWindowFocus && enabled) {
        focusHandler = () => {
            if (document.visibilityState === 'visible') {
                const queryState = queryClient.getQueryState(key);
                if (queryState && Date.now() - queryState.dataUpdatedAt > staleTime) refetch();
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
    // DEPENDENCY ARRAY FIX: Removed 'fn' and 'onSuccess' to prevent loops when these are inline functions
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
    onMutate?: (variables: V) => void; // Support optimistic updates
    invalidateKeys?: QueryKey[]; 
  }
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Use refs for callbacks to ensure stability
  const optionsRef = useRef(options);
  useEffect(() => {
      optionsRef.current = options;
  }, [options]);

  const mutate = useCallback(async (variables: V) => {
    setStatus('pending');
    
    const opts = optionsRef.current;
    
    // Optimistic Update / Setup
    if (opts?.onMutate) {
        opts.onMutate(variables);
    }

    try {
      const result = await mutationFn(variables);
      setStatus('success');
      
      if (opts?.invalidateKeys) {
        opts.invalidateKeys.forEach(k => queryClient.invalidate(k));
      }
      if (opts?.onSuccess) {
        opts.onSuccess(result, variables);
      }
      return result;
    } catch (e) {
      setStatus('error');
      if (opts?.onError) {
        opts.onError(e);
      }
      throw e;
    }
  }, [mutationFn]);

  return { mutate, isLoading: status === 'pending', isSuccess: status === 'success', isError: status === 'error' };
}
