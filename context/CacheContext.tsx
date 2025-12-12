/**
 * Cache Context
 * Client-side caching with TTL and invalidation strategies
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

interface CacheContextType {
  get: <T = any>(key: string) => T | null;
  set: <T = any>(key: string, data: T, ttl?: number, tags?: string[]) => void;
  remove: (key: string) => void;
  clear: () => void;
  invalidateByTag: (tag: string) => void;
  invalidateByPrefix: (prefix: string) => void;
  has: (key: string) => boolean;
  getStats: () => { size: number; hits: number; misses: number };
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

interface CacheProviderProps {
  children: ReactNode;
  defaultTTL?: number;
  maxSize?: number;
  persistToStorage?: boolean;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({
  children,
  defaultTTL = 5 * 60 * 1000, // 5 minutes
  maxSize = 100,
  persistToStorage = false,
}) => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const statsRef = useRef({ hits: 0, misses: 0 });
  const cleanupIntervalRef = useRef<NodeJS.Timeout>();

  // Load cache from localStorage on mount
  useEffect(() => {
    if (persistToStorage) {
      try {
        const stored = localStorage.getItem('app_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          setCache(new Map(Object.entries(parsed)));
        }
      } catch (error) {
        console.error('[Cache] Failed to load from storage:', error);
      }
    }
  }, [persistToStorage]);

  // Save cache to localStorage periodically
  useEffect(() => {
    if (!persistToStorage) return;

    const saveInterval = setInterval(() => {
      try {
        const cacheObject = Object.fromEntries(cache.entries());
        localStorage.setItem('app_cache', JSON.stringify(cacheObject));
      } catch (error) {
        console.error('[Cache] Failed to save to storage:', error);
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [cache, persistToStorage]);

  // Cleanup expired entries periodically
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map(prev);
        let removed = 0;

        for (const [key, entry] of newCache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            newCache.delete(key);
            removed++;
          }
        }

        if (removed > 0) {
          console.debug(`[Cache] Cleaned up ${removed} expired entries`);
        }

        return newCache;
      });
    }, 60000); // Check every minute

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  const get = useCallback(
    <T = any>(key: string): T | null => {
      const entry = cache.get(key);

      if (!entry) {
        statsRef.current.misses++;
        return null;
      }

      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        // Entry expired
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        statsRef.current.misses++;
        return null;
      }

      statsRef.current.hits++;
      return entry.data as T;
    },
    [cache]
  );

  const set = useCallback(
    <T = any>(key: string, data: T, ttl: number = defaultTTL, tags: string[] = []) => {
      setCache(prev => {
        const newCache = new Map(prev);

        // If cache is full, remove oldest entry (LRU)
        if (newCache.size >= maxSize) {
          let oldestKey: string | null = null;
          let oldestTime = Infinity;

          for (const [k, entry] of newCache.entries()) {
            if (entry.timestamp < oldestTime) {
              oldestTime = entry.timestamp;
              oldestKey = k;
            }
          }

          if (oldestKey) {
            newCache.delete(oldestKey);
            console.debug(`[Cache] Evicted oldest entry: ${oldestKey}`);
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
    },
    [defaultTTL, maxSize]
  );

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
    statsRef.current = { hits: 0, misses: 0 };
    if (persistToStorage) {
      localStorage.removeItem('app_cache');
    }
  }, [persistToStorage]);

  const invalidateByTag = useCallback((tag: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      let removed = 0;

      for (const [key, entry] of newCache.entries()) {
        if (entry.tags.includes(tag)) {
          newCache.delete(key);
          removed++;
        }
      }

      if (removed > 0) {
        console.debug(`[Cache] Invalidated ${removed} entries with tag: ${tag}`);
      }

      return newCache;
    });
  }, []);

  const invalidateByPrefix = useCallback((prefix: string) => {
    setCache(prev => {
      const newCache = new Map(prev);
      let removed = 0;

      for (const key of newCache.keys()) {
        if (key.startsWith(prefix)) {
          newCache.delete(key);
          removed++;
        }
      }

      if (removed > 0) {
        console.debug(`[Cache] Invalidated ${removed} entries with prefix: ${prefix}`);
      }

      return newCache;
    });
  }, []);

  const has = useCallback(
    (key: string): boolean => {
      const entry = cache.get(key);
      if (!entry) return false;

      const now = Date.now();
      return now - entry.timestamp <= entry.ttl;
    },
    [cache]
  );

  const getStats = useCallback(() => {
    return {
      size: cache.size,
      hits: statsRef.current.hits,
      misses: statsRef.current.misses,
    };
  }, [cache]);

  const value: CacheContextType = {
    get,
    set,
    remove,
    clear,
    invalidateByTag,
    invalidateByPrefix,
    has,
    getStats,
  };

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
};
