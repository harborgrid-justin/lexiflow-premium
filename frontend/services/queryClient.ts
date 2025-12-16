
import { useState, useEffect, useCallback, useRef } from 'react';
import { errorHandler } from '../utils/errorHandler';

type QueryKey = string | readonly unknown[];
type QueryFunction<T> = (signal: AbortSignal) => Promise<T>;

interface QueryState<T> {
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
}

const MAX_CACHE_SIZE = 100;

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
  private abortControllers: Map<string, AbortController> = new Map();
  private globalListeners: Set<(status: { isFetching: number }) => void> = new Set();
  private listenerCleanupTimer: number | null = null;

  private notifyGlobal() {
    const fetchingCount = Array.from(this.cache.values()).filter(s => s.isFetching).length;
    this.globalListeners.forEach(listener => listener({ isFetching: fetchingCount }));
  }

  public subscribeToGlobalUpdates(listener: (status: { isFetching: number }) => void) {
    this.startListenerCleanup(); // Ensure periodic cleanup is running
    this.globalListeners.add(listener);
    this.notifyGlobal();
    return () => this.globalListeners.delete(listener);
  }

  // Get diagnostic stats for monitoring
  public getStats() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: MAX_CACHE_SIZE,
      listenerKeys: this.listeners.size,
      globalListeners: this.globalListeners.size,
      inflightQueries: this.inflight.size,
      emptyListenerSets: Array.from(this.listeners.values()).filter(s => s.size === 0).length
    };
  }

  public hashKey(key: QueryKey): string {
    try {
      return stableStringify(key);
    } catch (e) {
      errorHandler.logError(e as Error, 'QueryClient:hashKey');
      return String(key);
    }
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
    this.cleanupEmptyListenerSets();
  }

  // Clean up empty listener Sets that might have been left behind
  private cleanupEmptyListenerSets() {
    const keysToDelete: string[] = [];

    for (const [key, listenerSet] of this.listeners.entries()) {
      if (listenerSet.size === 0) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.listeners.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[QueryClient] Cleaned up ${keysToDelete.length} empty listener sets`);
    }
  }

  // Periodic cleanup for listeners (runs every 5 minutes)
  private startListenerCleanup() {
    if (this.listenerCleanupTimer) return;

    this.listenerCleanupTimer = window.setInterval(() => {
      this.cleanupEmptyListenerSets();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  public stopListenerCleanup() {
    if (this.listenerCleanupTimer) {
      clearInterval(this.listenerCleanupTimer);
      this.listenerCleanupTimer = null;
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
    this.startListenerCleanup(); // Ensure periodic cleanup is running

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

    if (!force && cached && cached.status === 'success' && (now - cached.dataUpdatedAt < staleTime)) {
      this.touch(hashedKey);
      return cached.data;
    }

    if (this.inflight.has(hashedKey)) {
      return this.inflight.get(hashedKey);
    }

    if (force && this.abortControllers.has(hashedKey)) {
        this.abortControllers.get(hashedKey)?.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(hashedKey, controller);

    this.notify(hashedKey, { 
      ...(this.cache.get(hashedKey) || { status: 'loading', data: undefined, error: null, dataUpdatedAt: 0 }),
      isFetching: true 
    });
    this.notifyGlobal();

    const promise = fn(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) throw new Error('Aborted');

        const currentCache = this.cache.get(hashedKey);
        
        if (currentCache && fastDeepEqual(currentCache.data, data) && currentCache.status === 'success') {
           this.notify(hashedKey, { ...currentCache, dataUpdatedAt: Date.now(), isFetching: false });
           this.notifyGlobal();
           this.inflight.delete(hashedKey);
           this.abortControllers.delete(hashedKey);
           return currentCache.data;
        }

        const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now(), isFetching: false };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); 
        this.notify(hashedKey, state);
        this.notifyGlobal();
        this.inflight.delete(hashedKey);
        this.abortControllers.delete(hashedKey);
        return data;
      })
      .catch((rawError) => {
        if (controller.signal.aborted) return;

        let errorMsg = 'Unknown Query Error';
        if (rawError instanceof Error) errorMsg = rawError.message;
        else if (typeof rawError === 'string') errorMsg = rawError;
        else {
             try { errorMsg = JSON.stringify(rawError); } catch(e) { errorMsg = String(rawError); }
        }
        
        const error = new Error(errorMsg);
        // Attach raw error info if possible for inspection
        (error as any).originalError = rawError;
        
        errorHandler.logError(error, `QueryFetch:${String(key)}`);
        
        const state: QueryState<T> = { 
            ...(this.cache.get(hashedKey) || { data: undefined, dataUpdatedAt: 0 }),
            status: 'error', 
            error,
            isFetching: false
        };
        this.cache.set(hashedKey, state);
        this.enforceLimits(); 
        this.notify(hashedKey, state);
        this.notifyGlobal();
        this.inflight.delete(hashedKey);
        this.abortControllers.delete(hashedKey);
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
           const invalidState: QueryState<any> = { ...current, dataUpdatedAt: 0 };
           this.cache.set(key, invalidState);
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
          data = typeof updater === 'function' ? (updater as (oldData: T | undefined) => T | undefined)(oldData) : updater;
      } catch (e) {
          errorHandler.logError(e as Error, 'QueryClient:setQueryData');
          return;
      }
      
      if (typeof data === 'undefined') return;

      const state: QueryState<T> = { data, status: 'success', error: null, dataUpdatedAt: Date.now(), isFetching: false };
      this.cache.set(hashedKey, state);
      this.enforceLimits(); 
      this.notify(hashedKey, state);
  }

  private notify(hashedKey: string, state: QueryState<any>) {
    this.listeners.get(hashedKey)?.forEach(listener => listener(state));
  }
}

export const queryClient = new QueryClient();

export function useQuery<T>(key: QueryKey, fn: () => Promise<T>, options: UseQueryOptions<T> = {}) {
  const { staleTime = 60000, enabled = true, onSuccess, onError, refetchOnWindowFocus = true, initialData } = options;
  const hashedKey = queryClient.hashKey(key);

  const [state, setState] = useState<QueryState<T>>(() => {
    const cached = queryClient.getQueryState<T>(key);
    if (cached) return cached;
    if (initialData !== undefined) return { data: initialData, status: 'success', error: null, dataUpdatedAt: Date.now(), isFetching: false };
    return { data: undefined, status: 'idle', error: null, dataUpdatedAt: 0, isFetching: false };
  });

  const fnRef = useRef(fn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fnRef.current = fn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [fn, onSuccess, onError]);

  const refetch = useCallback(() => {
     if (!enabled) return Promise.reject(new Error("Query is not enabled."));
     const wrappedFn = () => fnRef.current(); 
     return queryClient.fetch(key, wrappedFn, staleTime, true);
  }, [hashedKey, staleTime, enabled, key]); 

  useEffect(() => {
    if (!enabled) return;
    
    const unsubscribe = queryClient.subscribe(key, (newState) => setState(newState as QueryState<T>));
    
    if (state.dataUpdatedAt === 0) { // Fetch on mount or if invalidated
      const wrappedFn = () => fnRef.current();
      queryClient.fetch<T>(key, wrappedFn, staleTime);
    }

    let focusHandler: () => void;
    if (refetchOnWindowFocus && enabled) {
        focusHandler = () => {
            if (document.visibilityState === 'visible') {
                refetch();
            }
        };
        window.addEventListener('visibilitychange', focusHandler);
    }

    return () => {
        unsubscribe();
        if (focusHandler) window.removeEventListener('visibilitychange', focusHandler);
    };
  }, [hashedKey, enabled, staleTime, refetchOnWindowFocus, refetch, key, state.dataUpdatedAt]);

  return { 
    ...state, 
    isFetching: state.isFetching,
    isLoading: state.isFetching && state.status !== 'success',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    refetch
  };
}

interface MutationContext { [key: string]: any; }
interface UseMutationOptions<T, V> {
    onSuccess?: (data: T, variables: V, context?: MutationContext) => void;
    onError?: (error: Error, variables: V, context?: MutationContext) => void;
    onMutate?: (variables: V) => Promise<MutationContext | void> | MutationContext | void;
    onSettled?: (data: T | undefined, error: Error | null, variables: V, context?: MutationContext) => void;
    invalidateKeys?: QueryKey[]; 
}

export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options?: UseMutationOptions<T, V>
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
    let context: MutationContext | void = undefined;
    
    if (opts?.onMutate) {
        try {
            context = await opts.onMutate(variables);
        } catch(e) {
            const err = e instanceof Error ? e : new Error(String(e));
            setError(err);
            setStatus('error');
            if(opts.onError) opts.onError(err, variables, context || {});
            if(opts.onSettled) opts.onSettled(undefined, err, variables, context || {});
            return;
        }
    }

    let result: T | undefined;
    let mutationError: Error | null = null;
    try {
      result = await fnRef.current(variables);
      setData(result);
      setStatus('success');
      if (opts?.onSuccess) {
        opts.onSuccess(result, variables, context || {});
      }
    } catch (e) {
      mutationError = e instanceof Error ? e : new Error(String(e));
      setError(mutationError);
      setStatus('error');
      errorHandler.logError(mutationError, 'useMutation');
      if (opts?.onError) {
        opts.onError(mutationError, variables, context || {});
      }
    } finally {
        if (opts?.onSettled) {
            opts.onSettled(result, mutationError, variables, context || {});
        }
        if (opts?.invalidateKeys) {
            opts.invalidateKeys.forEach(k => queryClient.invalidate(k));
        }
    }
    
    if (mutationError) throw mutationError;
    return result;
  }, []);

  return { mutate, isLoading: status === 'pending', isSuccess: status === 'success', isError: status === 'error', error, data };
}
