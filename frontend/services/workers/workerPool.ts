/**
 * @module WorkerPool
 * @description Enterprise-grade Web Worker pool manager for efficient parallel processing
 * 
 * Provides production-ready worker pool management with:
 * - Fixed-size worker pool with automatic distribution
 * - Task queuing with timeout support
 * - Worker lifecycle management (acquire/release)
 * - Automatic cleanup on page unload
 * - Pool health monitoring and statistics
 * - Singleton pool manager for common worker types
 * - Development debugging helpers
 * 
 * @architecture
 * - Pattern: Object Pool + Queue + Singleton Manager
 * - Pool size: navigator.hardwareConcurrency / 2 (default)
 * - Queue: FIFO task distribution
 * - Lifecycle: Lazy initialization \u2192 acquisition \u2192 release \u2192 termination
 * - Manager: Centralized registry for named worker pools
 * 
 * @performance
 * - Worker creation overhead: ~50-100ms (reduced via pooling)
 * - Task distribution: O(1) for available workers, O(n) for queued
 * - Memory: Fixed pool prevents CPU saturation
 * - Cleanup: Automatic on page unload
 * 
 * @benefits
 * - Reduces worker creation overhead (reuses existing workers)
 * - Prevents CPU saturation via fixed pool size
 * - Memory efficient (bounded worker count)
 * - Automatic resource cleanup
 * 
 * @security
 * - Worker termination on pool termination
 * - Timeout support prevents hung tasks
 * - Error isolation per worker
 * - No worker escapes pool boundary
 * 
 * @usage
 * ```typescript
 * // Create pool
 * const pool = new WorkerPool(() => new Worker('./crypto.worker.js'), 2);
 * 
 * // Execute task
 * const result = await pool.execute(async (worker) => {
 *   return new Promise((resolve) => {
 *     worker.onmessage = (e) => resolve(e.data);
 *     worker.postMessage({ task: 'hash', data: '...' });
 *   });
 * });
 * 
 * // Cleanup
 * pool.terminate();
 * 
 * // Or use singleton manager
 * const cryptoPool = PoolManager.getPool('crypto', () => new Worker('./crypto.worker.js'));
 * ```
 * 
 * @created 2024-03-10
 * @modified 2025-12-22
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Worker task with promise resolution callbacks
 * @template T - Type of value returned by the task
 */
interface WorkerTask<T = any> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout?: number;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate worker factory parameter
 * @private
 */
function validateFactory(factory: any, methodName: string): void {
  if (typeof factory !== 'function') {
    throw new Error(`[WorkerPool.${methodName}] Factory must be a function`);
  }
}

/**
 * Validate pool size parameter
 * @private
 */
function validatePoolSize(size: any, methodName: string): void {
  if (typeof size !== 'number' || size <= 0 || !Number.isInteger(size)) {
    throw new Error(`[WorkerPool.${methodName}] Pool size must be a positive integer`);
  }
}

/**
 * Validate worker parameter
 * @private
 */
function validateWorker(worker: any, methodName: string): void {
  if (!worker || !(worker instanceof Worker)) {
    throw new Error(`[WorkerPool.${methodName}] Invalid worker object`);
  }
}

// =============================================================================
// WORKER POOL CLASS
// =============================================================================

/**
 * WorkerPool Class
 * Manages a fixed-size pool of Web Workers for efficient task distribution
 * 
 * @example
 * const pool = new WorkerPool(() => new Worker('./worker.js'), 4);
 * await pool.execute(worker => sendTask(worker));
 * pool.terminate();
 */
export class WorkerPool {
  private workers: Worker[] = [];
  private available: Worker[] = [];
  private queue: Array<WorkerTask<Worker>> = [];
  private isTerminated = false;

  /**
   * Create a worker pool
   * 
   * @param factory - Function that creates a new worker instance
   * @param size - Number of workers in the pool (default: hardwareConcurrency / 2)
   * @throws Error if factory is invalid or workers cannot be created
   * 
   * @example
   * const pool = new WorkerPool(() => new Worker('./crypto.worker.js'), 2);
   */
  constructor(
    private factory: () => Worker,
    private size: number = Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
  ) {
    validateFactory(factory, 'constructor');
    validatePoolSize(size, 'constructor');
    
    this.initialize();
  }

  /**
   * Initialize worker pool by creating worker instances
   * @private
   */
  private initialize(): void {
    console.log(`[WorkerPool] Initializing pool with ${this.size} workers...`);
    
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
      throw new Error('[WorkerPool] Failed to create any workers - pool initialization failed');
    }
    
    console.log(`[WorkerPool] Successfully created ${this.workers.length}/${this.size} workers`);
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

