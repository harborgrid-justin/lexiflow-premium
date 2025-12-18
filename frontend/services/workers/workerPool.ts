/**
 * @module services/workerPool
 * @category Services - Performance
 * @description Worker pool implementation for efficient Web Worker reuse.
 * Instead of creating new workers for each task, this pool maintains a fixed
 * number of workers and distributes tasks among them.
 * 
 * PERFORMANCE BENEFITS:
 * - Reduces worker creation overhead (each worker creation = ~50-100ms)
 * - Limits concurrent worker count (prevents CPU saturation)
 * - Reuses workers for multiple tasks (memory efficient)
 * - Automatic cleanup on page unload
 * 
 * USAGE:
 * ```typescript
 * const pool = new WorkerPool(() => CryptoWorker.create(), 2);
 * 
 * // Execute task
 * const worker = await pool.acquire();
 * worker.postMessage({ data: 'test' });
 * worker.onmessage = (e) => {
 *   console.log(e.data);
 *   pool.release(worker);
 * };
 * 
 * // Cleanup when done
 * pool.terminate();
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================
interface WorkerTask<T = any> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout?: number;
}

// ============================================================================
// WORKER POOL
// ============================================================================
export class WorkerPool {
  private workers: Worker[] = [];
  private available: Worker[] = [];
  private queue: Array<WorkerTask<Worker>> = [];
  private isTerminated = false;

  /**
   * Create a worker pool
   * @param factory - Function that creates a new worker
   * @param size - Number of workers in the pool (default: navigator.hardwareConcurrency / 2)
   */
  constructor(
    private factory: () => Worker,
    private size: number = Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
  ) {
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.size; i++) {
      try {
        const worker = this.factory();
        this.workers.push(worker);
        this.available.push(worker);
      } catch (error) {
        console.error(`[WorkerPool] Failed to create worker ${i}:`, error);
      }
    }
    
    if (this.workers.length === 0) {
      console.error('[WorkerPool] Failed to create any workers');
    }
  }

  /**
   * Acquire a worker from the pool
   * @param timeout - Maximum time to wait for a worker (ms)
   * @returns Promise that resolves with an available worker
   */
  acquire(timeout?: number): Promise<Worker> {
    if (this.isTerminated) {
      return Promise.reject(new Error('Worker pool has been terminated'));
    }

    // If worker is immediately available
    if (this.available.length > 0) {
      const worker = this.available.pop()!;
      return Promise.resolve(worker);
    }

    // Otherwise, queue the request
    return new Promise<Worker>((resolve, reject) => {
      const task: WorkerTask<Worker> = { resolve, reject, timeout };
      this.queue.push(task);

      // Set timeout if specified
      if (timeout) {
        setTimeout(() => {
          const index = this.queue.indexOf(task);
          if (index !== -1) {
            this.queue.splice(index, 1);
            reject(new Error(`Worker acquisition timed out after ${timeout}ms`));
          }
        }, timeout);
      }
    });
  }

  /**
   * Release a worker back to the pool
   * @param worker - The worker to release
   */
  release(worker: Worker): void {
    if (this.isTerminated) {
      worker.terminate();
      return;
    }

    // If there are queued requests, fulfill the next one
    if (this.queue.length > 0) {
      const task = this.queue.shift()!;
      task.resolve(worker);
    } else {
      // Otherwise, return to available pool
      if (!this.available.includes(worker)) {
        this.available.push(worker);
      }
    }
  }

  /**
   * Execute a task using a worker from the pool
   * @param task - Function that receives a worker and returns a promise
   * @param timeout - Maximum time to wait for worker (ms)
   * @returns Promise that resolves with the task result
   */
  async execute<T>(
    task: (worker: Worker) => Promise<T>,
    timeout?: number
  ): Promise<T> {
    const worker = await this.acquire(timeout);
    
    try {
      const result = await task(worker);
      this.release(worker);
      return result;
    } catch (error) {
      this.release(worker);
      throw error;
    }
  }

  /**
   * Execute multiple tasks in parallel using the pool
   * @param tasks - Array of task functions
   * @returns Promise that resolves with all results
   */
  async executeAll<T>(
    tasks: Array<(worker: Worker) => Promise<T>>
  ): Promise<T[]> {
    return Promise.all(tasks.map(task => this.execute(task)));
  }

  /**
   * Terminate all workers and clear the pool
   */
  terminate(): void {
    if (this.isTerminated) return;
    
    this.isTerminated = true;
    
    // Reject all queued tasks
    this.queue.forEach(task => {
      task.reject(new Error('Worker pool terminated'));
    });
    this.queue = [];
    
    // Terminate all workers
    this.workers.forEach(worker => {
      try {
        worker.terminate();
      } catch (error) {
        console.error('[WorkerPool] Error terminating worker:', error);
      }
    });
    
    this.workers = [];
    this.available = [];
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    size: number;
    available: number;
    queued: number;
    busy: number;
  } {
    return {
      size: this.workers.length,
      available: this.available.length,
      queued: this.queue.length,
      busy: this.workers.length - this.available.length
    };
  }

  /**
   * Check if pool is healthy (has workers available)
   */
  isHealthy(): boolean {
    return !this.isTerminated && this.workers.length > 0;
  }
}

// ============================================================================
// POOL MANAGER (Singleton for common worker types)
// ============================================================================
class WorkerPoolManager {
  private pools = new Map<string, WorkerPool>();

  /**
   * Get or create a named worker pool
   * @param name - Pool name/identifier
   * @param factory - Worker factory function
   * @param size - Pool size
   */
  getPool(name: string, factory: () => Worker, size?: number): WorkerPool {
    if (!this.pools.has(name)) {
      const pool = new WorkerPool(factory, size);
      this.pools.set(name, pool);
    }
    return this.pools.get(name)!;
  }

  /**
   * Terminate a specific pool
   */
  terminatePool(name: string): void {
    const pool = this.pools.get(name);
    if (pool) {
      pool.terminate();
      this.pools.delete(name);
    }
  }

  /**
   * Terminate all pools
   */
  terminateAll(): void {
    this.pools.forEach(pool => pool.terminate());
    this.pools.clear();
  }

  /**
   * Get statistics for all pools
   */
  getAllStats(): Record<string, ReturnType<WorkerPool['getStats']>> {
    const stats: Record<string, ReturnType<WorkerPool['getStats']>> = {};
    this.pools.forEach((pool, name) => {
      stats[name] = pool.getStats();
    });
    return stats;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
export const PoolManager = new WorkerPoolManager();

// ============================================================================
// AUTO-CLEANUP
// ============================================================================
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    PoolManager.terminateAll();
  });
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================
if (import.meta.env.DEV) {
  (window as any).__workerPoolManager = PoolManager;
  
  // Log pool stats every minute in dev
  setInterval(() => {
    const stats = PoolManager.getAllStats();
    const activePools = Object.entries(stats).filter(([_, s]) => s.size > 0);
    
    if (activePools.length > 0) {
      console.debug('[WorkerPool] Active pools:', stats);
    }
  }, 60 * 1000);
}

