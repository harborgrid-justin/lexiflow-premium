import { hashQueryKey } from '../utils/queryUtils';
import type { QueryKey, QueryFunction, QueryState } from './QueryTypes';

class QueryClient {
  private cache = new Map<string, QueryState<any>>();
  private listeners = new Map<string, Set<(state: QueryState<any>) => void>>();
  private inflight = new Map<string, Promise<any>>();
  private globalListeners = new Set<(status: { isFetching: number }) => void>();

  public hashKey(key: QueryKey): string {
    return hashQueryKey(key);
  }

  // Add this for useGlobalQueryStatus.ts
  public subscribeToGlobalUpdates(listener: (status: { isFetching: number }) => void): () => void {
    this.globalListeners.add(listener);
    this.notifyGlobal();
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  private notifyGlobal(): void {
    let fetchingCount = 0;
    this.cache.forEach((state) => {
      if (state.isFetching) fetchingCount++;
    });
    this.globalListeners.forEach(l => l({ isFetching: fetchingCount }));
  }

  public getQueryState<T>(key: QueryKey): QueryState<T> | undefined {
    return this.cache.get(this.hashKey(key));
  }

  public subscribe(key: QueryKey, listener: (state: QueryState<any>) => void): () => void {
    const hashedKey = this.hashKey(key);
    if (!this.listeners.has(hashedKey)) this.listeners.set(hashedKey, new Set());
    this.listeners.get(hashedKey)!.add(listener);
    return () => {
      this.listeners.get(hashedKey)?.delete(listener);
    };
  }

  public setQueryData<T>(key: QueryKey, data: T | ((old: T | undefined) => T)): void {
    const hashedKey = this.hashKey(key);
    const oldState = this.cache.get(hashedKey);
    const newData = typeof data === 'function' ? (data as Function)(oldState?.data) : data;

    const newState: QueryState<T> = {
      data: newData,
      status: 'success',
      error: null,
      dataUpdatedAt: Date.now(),
      isFetching: false,
    };

    this.cache.set(hashedKey, newState);
    this.notify(hashedKey, newState);
    this.notifyGlobal();
  }

  public async fetch<T>(key: QueryKey, fn: QueryFunction<T>, staleTime = 30000): Promise<T> {
    const hashedKey = this.hashKey(key);
    const cached = this.cache.get(hashedKey);
    
    if (cached?.status === 'success' && (Date.now() - cached.dataUpdatedAt < staleTime)) {
      return cached.data;
    }

    if (this.inflight.has(hashedKey)) return this.inflight.get(hashedKey);

    const fetchingState: QueryState<T> = {
      ...(cached || { data: undefined, status: 'loading', error: null, dataUpdatedAt: 0 }),
      isFetching: true
    };
    this.cache.set(hashedKey, fetchingState);
    this.notify(hashedKey, fetchingState);
    this.notifyGlobal();

    const promise = fn(new AbortController().signal).then(data => {
      this.setQueryData(key, data);
      this.inflight.delete(hashedKey);
      return data;
    }).catch(err => {
      this.inflight.delete(hashedKey);
      const errorState: QueryState<T> = {
        ...(this.cache.get(hashedKey) || { data: undefined, dataUpdatedAt: 0 }),
        status: 'error',
        error: err instanceof Error ? err : new Error(String(err)),
        isFetching: false
      };
      this.cache.set(hashedKey, errorState);
      this.notify(hashedKey, errorState);
      this.notifyGlobal();
      throw err;
    });

    this.inflight.set(hashedKey, promise);
    return promise;
  }

  public invalidate(keyPattern: string | QueryKey): void {
    const search = typeof keyPattern === 'string' ? keyPattern : this.hashKey(keyPattern);
    this.cache.forEach((state, key) => {
      if (key.includes(search)) {
        this.cache.set(key, { ...state, dataUpdatedAt: 0 });
        this.notify(key, this.cache.get(key)!);
      }
    });
    this.notifyGlobal();
  }

  private notify(hashedKey: string, state: QueryState<any>): void {
    this.listeners.get(hashedKey)?.forEach(l => l(state));
  }
}

export const queryClient = new QueryClient();