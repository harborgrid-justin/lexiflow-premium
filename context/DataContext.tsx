/**
 * Data Context
 * Global cached data management with TTL and invalidation
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useMemo } from 'react';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // For grouped invalidation
}

export interface CacheConfig {
  defaultTtl?: number;
  maxSize?: number;
  enablePersistence?: boolean;
  persistenceKey?: string;
}

interface DataContextType {
  // Cache operations
  get: <T = any>(key: string) => T | null;
  set: <T = any>(key: string, data: T, ttl?: number, tags?: string[]) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;

  // Tag-based operations
  invalidateByTag: (tag: string) => void;
  invalidateByTags: (tags: string[]) => void;

  // Bulk operations
  getMany: <T = any>(keys: string[]) => Record<string, T | null>;
  setMany: <T = any>(entries: Record<string, { data: T; ttl?: number; tags?: string[] }>) => void;

  // Cache info
  size: number;
  keys: () => string[];
  stats: () => { hits: number; misses: number; size: number };

  // Async data fetching with cache
  fetchWithCache: <T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; tags?: string[]; forceRefresh?: boolean }
  ) => Promise<T>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
  config?: CacheConfig;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  enablePersistence: false,
  persistenceKey: 'data-cache',
};

export const DataProvider: React.FC<DataProviderProps> = ({ children, config = {} }) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [stats, setStats] = useState({ hits: 0, misses: 0 });

  // Load cache from localStorage on mount
  useEffect(() => {
    if (mergedConfig.enablePersistence) {
      try {
        const stored = localStorage.getItem(mergedConfig.persistenceKey!);
        if (stored) {
          const parsed = JSON.parse(stored);
          const cacheMap = new Map<string, CacheEntry>();

          Object.entries(parsed).forEach(([key, entry]) => {
            const cacheEntry = entry as CacheEntry;
            // Check if entry is still valid
            if (!cacheEntry.ttl || Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
              cacheMap.set(key, cacheEntry);
            }
          });

          setCache(cacheMap);
        }
      } catch (error) {
        console.error('[DataContext] Failed to load cache from storage:', error);
      }
    }
  }, [mergedConfig.enablePersistence, mergedConfig.persistenceKey]);

  // Save cache to localStorage when it changes
  useEffect(() => {
    if (mergedConfig.enablePersistence && cache.size > 0) {
      try {
        const cacheObject: Record<string, CacheEntry> = {};
        cache.forEach((value, key) => {
          cacheObject[key] = value;
        });
        localStorage.setItem(mergedConfig.persistenceKey!, JSON.stringify(cacheObject));
      } catch (error) {
        console.error('[DataContext] Failed to save cache to storage:', error);
      }
    }
  }, [cache, mergedConfig.enablePersistence, mergedConfig.persistenceKey]);

  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCache((prevCache) => {
        const newCache = new Map(prevCache);
        let hasChanges = false;

        newCache.forEach((entry, key) => {
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            newCache.delete(key);
            hasChanges = true;
          }
        });

        return hasChanges ? newCache : prevCache;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Check if entry is valid
  const isValid = useCallback((entry: CacheEntry): boolean => {
    if (!entry.ttl) return true;
    return Date.now() - entry.timestamp < entry.ttl;
  }, []);

  // Get cached data
  const get = useCallback(<T = any>(key: string): T | null => {
    const entry = cache.get(key);

    if (!entry) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    if (!isValid(entry)) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data as T;
  }, [cache, isValid]);

  // Set cached data
  const set = useCallback(<T = any>(
    key: string,
    data: T,
    ttl: number = mergedConfig.defaultTtl!,
    tags: string[] = []
  ) => {
    setCache(prev => {
      const newCache = new Map(prev);

      // Enforce max size
      if (newCache.size >= mergedConfig.maxSize! && !newCache.has(key)) {
        // Remove oldest entry (first entry in map)
        const firstKey = newCache.keys().next().value;
        if (firstKey) {
          newCache.delete(firstKey);
        }
      }

      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      });

      return newCache;
    });
  }, [mergedConfig.defaultTtl, mergedConfig.maxSize]);

  // Remove cached data
  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  // Clear all cache
  const clear = useCallback(() => {
    setCache(new Map());
    setStats({ hits: 0, misses: 0 });
  }, []);

  // Check if key exists
  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    return entry ? isValid(entry) : false;
  }, [cache, isValid]);

  // Invalidate by tag
  const invalidateByTag = useCallback((tag: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      let hasChanges = false;

      newCache.forEach((entry, key) => {
        if (entry.tags?.includes(tag)) {
          newCache.delete(key);
          hasChanges = true;
        }
      });

      return hasChanges ? newCache : prev;
    });
  }, []);

  // Invalidate by multiple tags
  const invalidateByTags = useCallback((tags: string[]) => {
    setCache(prev => {
      const newCache = new Map(prev);
      let hasChanges = false;

      newCache.forEach((entry, key) => {
        if (entry.tags?.some(tag => tags.includes(tag))) {
          newCache.delete(key);
          hasChanges = true;
        }
      });

      return hasChanges ? newCache : prev;
    });
  }, []);

  // Get many keys at once
  const getMany = useCallback(<T = any>(keys: string[]): Record<string, T | null> => {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = get<T>(key);
    });
    return result;
  }, [get]);

  // Set many entries at once
  const setMany = useCallback(<T = any>(
    entries: Record<string, { data: T; ttl?: number; tags?: string[] }>
  ) => {
    Object.entries(entries).forEach(([key, { data, ttl, tags }]) => {
      set(key, data, ttl, tags);
    });
  }, [set]);

  // Get all keys
  const keys = useCallback((): string[] => {
    return Array.from(cache.keys());
  }, [cache]);

  // Get cache stats
  const getStats = useCallback(() => {
    return { ...stats, size: cache.size };
  }, [stats, cache.size]);

  // Fetch with cache
  const fetchWithCache = useCallback(async <T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; tags?: string[]; forceRefresh?: boolean } = {}
  ): Promise<T> => {
    const { ttl, tags, forceRefresh = false } = options;

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    // Fetch fresh data
    const data = await fetcher();
    set(key, data, ttl, tags);
    return data;
  }, [get, set]);

  const value = useMemo<DataContextType>(() => ({
    get,
    set,
    remove,
    clear,
    has,
    invalidateByTag,
    invalidateByTags,
    getMany,
    setMany,
    size: cache.size,
    keys,
    stats: getStats,
    fetchWithCache,
  }), [
    get,
    set,
    remove,
    clear,
    has,
    invalidateByTag,
    invalidateByTags,
    getMany,
    setMany,
    cache.size,
    keys,
    getStats,
    fetchWithCache,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
