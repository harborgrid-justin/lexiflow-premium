
import { StorageUtils } from '../utils/storage';

export interface Mutation {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

const QUEUE_KEY = 'lexiflow_sync_queue';

export const SyncEngine = {
  getQueue: (): Mutation[] => {
    return StorageUtils.get(QUEUE_KEY, []);
  },

  enqueue: (type: string, payload: any): Mutation => {
    const queue = SyncEngine.getQueue();
    const mutation: Mutation = {
      id: crypto.randomUUID(),
      type,
      payload,
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
      // @ts-ignore - Typescript might complain about casting but structure matches
      StorageUtils.set(QUEUE_KEY, updated);
  },
  
  clear: () => {
    StorageUtils.set(QUEUE_KEY, []);
  }
};
