
import { StorageUtils } from '../utils/storage';

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

export const SyncEngine = {
  getQueue: (): Mutation[] => {
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
    queue.push(mutation);
    StorageUtils.set(QUEUE_KEY, queue);
    return mutation;
  },

  dequeue: (): Mutation | undefined => {
    const queue = SyncEngine.getQueue();
    if (queue.length === 0) return undefined;
    const item = queue.shift();
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
  }
};
