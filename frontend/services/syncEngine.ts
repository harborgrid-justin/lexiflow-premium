
import { StorageUtils } from '../utils/storage';
import { LinearHash } from '../utils/datastructures/linearHash';

export interface Mutation {
  id: string;
  type: string;
  payload: any;
  patch?: any; // JSON Patch array
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

const QUEUE_KEY = 'lexiflow_sync_queue';

// Bounded cache with TTL and size limits
interface CacheEntry {
  processed: boolean;
  timestamp: number;
}

const MAX_CACHE_SIZE = 10000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const processedCache = new LinearHash<string, CacheEntry>();

// Simple Diff Implementation to generate JSON Patch-like structure
const createPatch = (oldData: any, newData: any) => {
    const patch: any = {};
    for (const key in newData) {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            patch[key] = newData[key];
        }
    }
    return patch;
};

// Cleanup expired cache entries
const cleanupCache = () => {
    const now = Date.now();
    const keys = processedCache.keys();
    let cleanedCount = 0;

    for (const key of keys) {
        const entry = processedCache.get(key);
        if (entry && (now - entry.timestamp > CACHE_TTL_MS)) {
            processedCache.delete(key);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[SyncEngine] Cleaned ${cleanedCount} expired cache entries`);
    }
};

// Enforce cache size limit using LRU-style eviction
const enforceCacheLimit = () => {
    const size = processedCache.size();
    if (size > MAX_CACHE_SIZE) {
        const keys = processedCache.keys();
        const entries: [string, CacheEntry][] = [];

        for (const key of keys) {
            const entry = processedCache.get(key);
            if (entry) {
                entries.push([key, entry]);
            }
        }

        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

        // Remove oldest 20% of entries
        const toRemove = Math.floor(size * 0.2);
        for (let i = 0; i < toRemove && i < entries.length; i++) {
            processedCache.delete(entries[i][0]);
        }

        console.log(`[SyncEngine] Evicted ${toRemove} oldest cache entries to maintain size limit`);
    }
};

// Periodic cleanup interval (runs every hour)
let cleanupInterval: number | null = null;
const startCleanupTimer = () => {
    if (cleanupInterval) return;

    cleanupInterval = window.setInterval(() => {
        cleanupCache();
        enforceCacheLimit();
    }, 60 * 60 * 1000); // Every hour
};

export const SyncEngine = {
  getQueue: (): Mutation[] => {
    startCleanupTimer(); // Ensure cleanup timer is running
    return StorageUtils.get(QUEUE_KEY, []);
  },

  enqueue: (type: string, payload: any, oldPayload?: any): Mutation => {
    const queue = SyncEngine.getQueue();

    // Optimization: Calculate patch if updating
    let patch = undefined;
    if (type.includes('UPDATE') && oldPayload) {
        patch = createPatch(oldPayload, payload);
        // If no changes, skip enqueue
        if (Object.keys(patch).length === 0) return { id: '', type, payload, timestamp: 0, status: 'pending', retryCount: 0 };
    }

    const mutation: Mutation = {
      id: crypto.randomUUID(),
      type,
      payload,
      patch, // Use patch for network transmission in real API implementation
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    const cached = processedCache.get(mutation.id);
    if (cached) {
        console.log(`[Sync] Skipping duplicate mutation: ${mutation.id}`);
        return mutation; // Don't re-add
    }

    queue.push(mutation);
    StorageUtils.set(QUEUE_KEY, queue);
    return mutation;
  },

  dequeue: (): Mutation | undefined => {
    const queue = SyncEngine.getQueue();
    if (queue.length === 0) return undefined;
    const item = queue.shift();
    if(item) {
        processedCache.set(item.id, { processed: true, timestamp: Date.now() });
        enforceCacheLimit(); // Check size limit on each dequeue
    }
    StorageUtils.set(QUEUE_KEY, queue);
    return item;
  },

  peek: (): Mutation | undefined => {
    const queue = SyncEngine.getQueue();
    return queue.length > 0 ? queue[0] : undefined;
  },

  update: (id: string, updates: Partial<Mutation>) => {
      const queue = SyncEngine.getQueue();
      const index = queue.findIndex(m => m.id === id);
      if (index !== -1) {
          queue[index] = { ...queue[index], ...updates };
          StorageUtils.set(QUEUE_KEY, queue);
      }
  },

  count: (): number => {
    return SyncEngine.getQueue().length;
  },

  getFailed: (): Mutation[] => {
      return SyncEngine.getQueue().filter(m => m.status === 'failed');
  },
  
  resetFailed: () => {
      const queue = SyncEngine.getQueue();
      const updated = queue.map(m => m.status === 'failed' ? { ...m, status: 'pending', retryCount: 0, lastError: undefined } : m);
      StorageUtils.set(QUEUE_KEY, updated);
  },
  
  clear: () => {
    StorageUtils.set(QUEUE_KEY, []);
  },

  // Manual cache cleanup (for testing or maintenance)
  cleanupCache: () => {
    cleanupCache();
    enforceCacheLimit();
  },

  // Get cache stats for monitoring
  getCacheStats: () => {
    const size = processedCache.size();
    const keys = processedCache.keys();
    let oldestTimestamp = Date.now();

    for (const key of keys) {
        const entry = processedCache.get(key);
        if (entry && entry.timestamp < oldestTimestamp) {
            oldestTimestamp = entry.timestamp;
        }
    }

    return {
        size,
        maxSize: MAX_CACHE_SIZE,
        oldestEntryAge: Date.now() - oldestTimestamp,
        ttlMs: CACHE_TTL_MS
    };
  },

  // Stop cleanup timer (for cleanup on unmount)
  stopCleanupTimer: () => {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
  }
};
