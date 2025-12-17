/**
 * @module services/cryptoService
 * @category Services - Cryptography
 * @description High-performance cryptographic service using WorkerPool for SHA-256 hashing.
 * Automatically manages worker lifecycle and provides efficient batch processing.
 * 
 * PERFORMANCE:
 * - Reuses workers via pool (no creation overhead)
 * - Parallel processing for batch operations
 * - Automatic timeout handling
 * - Memory efficient (workers are shared)
 * 
 * USAGE:
 * ```typescript
 * // Single file hash
 * const hash = await CryptoService.hashFile(file);
 * 
 * // Batch processing
 * const hashes = await CryptoService.hashFiles([file1, file2, file3]);
 * 
 * // Cleanup (automatic on page unload, but can be called manually)
 * CryptoService.terminate();
 * ```
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { PoolManager } from './workerPool';
import { CryptoWorker } from './cryptoWorker';

// ============================================================================
// TYPES
// ============================================================================
interface HashResult {
  hash: string;
  fileName: string;
  size: number;
  processingTime: number;
}

interface HashError {
  error: string;
  fileName: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const WORKER_POOL_SIZE = 2; // Optimal for most use cases
const HASH_TIMEOUT = 30000; // 30 seconds per file
const POOL_NAME = 'crypto';

// ============================================================================
// SERVICE
// ============================================================================
class CryptoServiceClass {
  private poolInitialized = false;

  /**
   * Get or initialize the crypto worker pool
   */
  private getPool() {
    if (!this.poolInitialized) {
      PoolManager.getPool(POOL_NAME, () => CryptoWorker.create(), WORKER_POOL_SIZE);
      this.poolInitialized = true;
    }
    return PoolManager.getPool(POOL_NAME, () => CryptoWorker.create(), WORKER_POOL_SIZE);
  }

  /**
   * Hash a single file using SHA-256
   * @param file - File to hash
   * @returns Promise resolving to hash result
   */
  async hashFile(file: File): Promise<HashResult> {
    const startTime = performance.now();
    const pool = this.getPool();

    try {
      const fileBuffer = await file.arrayBuffer();
      
      const hash = await pool.execute<string>(async (worker) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Hash operation timed out for ${file.name}`));
          }, HASH_TIMEOUT);

          worker.onmessage = (e) => {
            clearTimeout(timeout);
            const { hash, status, error } = e.data;
            
            if (status === 'success') {
              resolve(hash);
            } else {
              reject(new Error(error || 'Hash computation failed'));
            }
          };

          worker.onerror = (err) => {
            clearTimeout(timeout);
            reject(err);
          };

          // Send file chunk to worker
          worker.postMessage({
            fileChunk: fileBuffer,
            id: file.name
          });
        });
      }, HASH_TIMEOUT);

      const processingTime = performance.now() - startTime;

      return {
        hash,
        fileName: file.name,
        size: file.size,
        processingTime
      };
    } catch (error) {
      throw new Error(`Failed to hash file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash multiple files in parallel using the worker pool
   * @param files - Array of files to hash
   * @returns Promise resolving to array of hash results
   */
  async hashFiles(files: File[]): Promise<(HashResult | HashError)[]> {
    const startTime = performance.now();
    
    const results = await Promise.allSettled(
      files.map(file => this.hashFile(file))
    );

    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          error: result.reason?.message || 'Unknown error',
          fileName: files[index]?.name || 'Unknown'
        };
      }
    });

    const totalTime = performance.now() - startTime;
    console.debug(`[CryptoService] Hashed ${files.length} files in ${totalTime.toFixed(2)}ms`);

    return processedResults;
  }

  /**
   * Hash a file chunk (for streaming/large files)
   * @param chunk - ArrayBuffer chunk
   * @param chunkId - Identifier for the chunk
   * @returns Promise resolving to hash string
   */
  async hashChunk(chunk: ArrayBuffer, chunkId: string): Promise<string> {
    const pool = this.getPool();

    return pool.execute<string>(async (worker) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Hash operation timed out for chunk ${chunkId}`));
        }, HASH_TIMEOUT);

        worker.onmessage = (e) => {
          clearTimeout(timeout);
          const { hash, status, error } = e.data;
          
          if (status === 'success') {
            resolve(hash);
          } else {
            reject(new Error(error || 'Hash computation failed'));
          }
        };

        worker.onerror = (err) => {
          clearTimeout(timeout);
          reject(err);
        };

        worker.postMessage({ fileChunk: chunk, id: chunkId });
      });
    }, HASH_TIMEOUT);
  }

  /**
   * Hash a string using SHA-256 (lightweight, no worker needed)
   * @param text - Text to hash
   * @returns Promise resolving to hex hash string
   */
  async hashString(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get pool statistics
   */
  getStats() {
    if (!this.poolInitialized) {
      return { initialized: false };
    }
    const pool = this.getPool();
    return {
      initialized: true,
      ...pool.getStats()
    };
  }

  /**
   * Terminate the worker pool (cleanup)
   */
  terminate() {
    if (this.poolInitialized) {
      PoolManager.terminatePool(POOL_NAME);
      this.poolInitialized = false;
    }
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    if (!this.poolInitialized) return true; // Not yet needed
    const pool = this.getPool();
    return pool.isHealthy();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
export const CryptoService = new CryptoServiceClass();

// ============================================================================
// AUTO-CLEANUP
// ============================================================================
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    CryptoService.terminate();
  });
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================
if (import.meta.env.DEV) {
  (window as any).__cryptoService = CryptoService;
}
