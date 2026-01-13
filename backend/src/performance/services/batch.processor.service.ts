import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, Repository, ObjectLiteral, DeepPartial } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as MasterConfig from "@config/master.config";
import { Readable } from "stream";

/**
 * Batch Processing Configuration
 */
export interface BatchConfig {
  chunkSize?: number;
  concurrency?: number;
  useTransaction?: boolean;
  continueOnError?: boolean;
  timeout?: number;
  progressCallback?: (progress: BatchProgress) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Batch Processing Result
 */
export interface BatchResult<T = unknown> {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: BatchError[];
  duration: number;
  throughput: number;
  results: T[];
}

/**
 * Batch Processing Progress
 */
export interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentChunk: number;
  totalChunks: number;
}

/**
 * Batch Processing Error
 */
export interface BatchError {
  index: number;
  item: unknown;
  error: string;
  attempts: number;
  timestamp: number;
}

/**
 * Batch Insert Options
 */
export interface BatchInsertOptions<T> extends BatchConfig {
  conflictAction?: "ignore" | "update" | "fail";
  conflictColumns?: (keyof T)[];
  updateColumns?: (keyof T)[];
}

/**
 * Batch Update Options
 */
export interface BatchUpdateOptions extends BatchConfig {
  conditions?: Record<string, unknown>;
  partial?: boolean;
}

/**
 * Batch Processor Service
 *
 * Enterprise-grade batch processing with:
 * - Chunked processing for large datasets
 * - Configurable concurrency control
 * - Transaction support
 * - Progress tracking and reporting
 * - Error handling with retry logic
 * - Memory-efficient streaming
 * - Throughput optimization
 * - Event-driven progress updates
 *
 * @example
 * const result = await batchProcessor.batchInsert(repository, items, {
 *   chunkSize: 1000,
 *   concurrency: 5,
 *   useTransaction: true,
 *   progressCallback: (progress) => console.log(`${progress.percentage}% complete`)
 * });
 */
/**
 * ╔=================================================================================================================╗
 * ║BATCHPROCESSOR                                                                                                   ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class BatchProcessorService implements OnModuleDestroy {
  private readonly logger = new Logger(BatchProcessorService.name);
  private readonly DEFAULT_CHUNK_SIZE =
    MasterConfig.BULK_OPERATION_BATCH_SIZE || 1000;
  private readonly DEFAULT_CONCURRENCY = 5;
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000;

  // Memory management
  private readonly MEMORY_THRESHOLD_MB = 512; // Pause if heap used > 512MB
  // Memory check interval for monitoring
  // Memory check interval removed - using adaptive checking
  // private isPaused = false;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2
  ) {
    void this.dataSource;
  }

  onModuleDestroy() {
    // Pause functionality removed
    this.logger.log("BatchProcessorService destroyed, pausing operations");
  }

  private checkMemoryPressure(): boolean {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    if (used > this.MEMORY_THRESHOLD_MB) {
      this.logger.warn(
        `High memory usage detected: ${used.toFixed(2)}MB. Pausing batch processing...`
      );
      return true;
    }
    return false;
  }

  /**
   * Stream processing for large datasets
   */
  async streamBatch<T>(
    stream: Readable,
    processor: (item: T) => Promise<void>,
    options: BatchConfig = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const result: BatchResult = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      throughput: 0,
      results: [],
    };

    const concurrency = options.concurrency || this.DEFAULT_CONCURRENCY;
    const executing = new Set<Promise<void>>();

    for await (const item of stream) {
      result.total++;

      // Check memory pressure
      while (this.checkMemoryPressure()) {
        await this.sleep(1000);
        if (global.gc) global.gc();
      }

      const p = (async () => {
        try {
          await processor(item as T);
          result.successful++;
        } catch (error) {
          result.failed++;
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          result.errors.push({
            index: result.processed,
            item,
            error: errorMessage,
            attempts: 1,
            timestamp: Date.now(),
          });
        } finally {
          result.processed++;
          const currentPromise: Promise<void> =
            undefined as unknown as Promise<void>;
          if (currentPromise) executing.delete(currentPromise);
        }
      })();

      executing.add(p);

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);

    result.duration = Date.now() - startTime;
    result.throughput = result.processed / (result.duration / 1000);

    return result;
  }

  /**
   * Batch insert with optimized chunking
   */
  async batchInsert<T extends ObjectLiteral>(
    repository: Repository<T>,
    items: Partial<T>[],
    options: BatchInsertOptions<T> = {}
  ): Promise<BatchResult<T>> {
    const startTime = Date.now();
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const chunks = this.createChunks(items, chunkSize);

    this.logger.log(
      `Starting batch insert: ${items.length} items in ${chunks.length} chunks`
    );

    const result: BatchResult<T> = {
      total: items.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      throughput: 0,
      results: [],
    };

    // Process chunks with concurrency control
    await this.processChunksWithConcurrency(
      chunks,
      async (chunk, chunkIndex) => {
        try {
          const inserted = await this.insertChunk(repository, chunk, options);
          result.results.push(...inserted);
          result.successful += inserted.length;
          result.processed += chunk.length;

          // Report progress
          this.reportProgress(
            result,
            chunks.length,
            chunkIndex + 1,
            startTime,
            options
          );
        } catch (error) {
          const err =
            error instanceof Error ? error : new Error("Unknown error");
          this.handleChunkError(result, chunk, chunkIndex, err, options);
        }
      },
      options.concurrency || this.DEFAULT_CONCURRENCY
    );

    // Calculate final metrics
    result.duration = Date.now() - startTime;
    result.throughput = result.processed / (result.duration / 1000);

    this.logger.log(
      `Batch insert completed: ${result.successful}/${result.total} successful ` +
        `in ${result.duration}ms (${result.throughput.toFixed(0)} items/sec)`
    );

    return result;
  }

  /**
   * Batch update with optimized chunking
   */
  async batchUpdate<T extends ObjectLiteral>(
    repository: Repository<T>,
    updates: Array<{ id: string | number; data: Partial<T> }>,
    options: BatchUpdateOptions = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const chunks = this.createChunks(updates, chunkSize);

    this.logger.log(
      `Starting batch update: ${updates.length} items in ${chunks.length} chunks`
    );

    const result: BatchResult = {
      total: updates.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      throughput: 0,
      results: [],
    };

    await this.processChunksWithConcurrency(
      chunks,
      async (chunk, chunkIndex) => {
        try {
          await this.updateChunk(repository, chunk, options);
          result.successful += chunk.length;
          result.processed += chunk.length;

          this.reportProgress(
            result,
            chunks.length,
            chunkIndex + 1,
            startTime,
            options
          );
        } catch (error) {
          this.handleChunkError(
            result,
            chunk,
            chunkIndex,
            error as Error,
            options
          );
        }
      },
      options.concurrency || this.DEFAULT_CONCURRENCY
    );

    result.duration = Date.now() - startTime;
    result.throughput = result.processed / (result.duration / 1000);

    this.logger.log(
      `Batch update completed: ${result.successful}/${result.total} successful ` +
        `in ${result.duration}ms`
    );

    return result;
  }

  /**
   * Batch delete with optimized chunking
   */
  async batchDelete<T extends ObjectLiteral>(
    repository: Repository<T>,
    ids: Array<string | number>,
    options: BatchConfig = {}
  ): Promise<BatchResult> {
    const startTime = Date.now();
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const chunks = this.createChunks(ids, chunkSize);

    this.logger.log(
      `Starting batch delete: ${ids.length} items in ${chunks.length} chunks`
    );

    const result: BatchResult = {
      total: ids.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      throughput: 0,
      results: [],
    };

    await this.processChunksWithConcurrency(
      chunks,
      async (chunk, chunkIndex) => {
        try {
          await this.deleteChunk(repository, chunk, options);
          result.successful += chunk.length;
          result.processed += chunk.length;

          this.reportProgress(
            result,
            chunks.length,
            chunkIndex + 1,
            startTime,
            options
          );
        } catch (error) {
          const err =
            error instanceof Error ? error : new Error("Unknown error");
          this.handleChunkError(result, chunk, chunkIndex, err, options);
        }
      },
      options.concurrency || this.DEFAULT_CONCURRENCY
    );

    result.duration = Date.now() - startTime;
    result.throughput = result.processed / (result.duration / 1000);

    this.logger.log(
      `Batch delete completed: ${result.successful}/${result.total} successful`
    );

    return result;
  }

  /**
   * Process items in batches with custom processor function
   */
  async processBatch<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: BatchConfig = {}
  ): Promise<BatchResult<R>> {
    const startTime = Date.now();
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const chunks = this.createChunks(items, chunkSize);

    this.logger.log(
      `Starting batch processing: ${items.length} items in ${chunks.length} chunks`
    );

    const result: BatchResult<R> = {
      total: items.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
      throughput: 0,
      results: [],
    };

    await this.processChunksWithConcurrency(
      chunks,
      async (chunk, chunkIndex) => {
        const chunkResults = await Promise.allSettled(
          chunk.map((item, idx) => {
            const globalIndex = chunkIndex * chunkSize + idx;
            return this.processWithRetry(
              () => processor(item, globalIndex),
              options.retryAttempts || this.DEFAULT_RETRY_ATTEMPTS,
              options.retryDelay || this.DEFAULT_RETRY_DELAY
            );
          })
        );

        for (let i = 0; i < chunkResults.length; i++) {
          const chunkResult = chunkResults[i];
          if (!chunkResult) continue;

          result.processed++;

          if (chunkResult.status === "fulfilled") {
            result.successful++;
            result.results.push(
              (chunkResult as PromiseFulfilledResult<R>).value
            );
          } else {
            result.failed++;
            const reason = (chunkResult as PromiseRejectedResult).reason as
              | Error
              | string;
            result.errors.push({
              index: chunkIndex * chunkSize + i,
              item: chunk[i],
              error: reason instanceof Error ? reason.message : "Unknown error",
              attempts: options.retryAttempts || this.DEFAULT_RETRY_ATTEMPTS,
              timestamp: Date.now(),
            });
          }
        }

        this.reportProgress(
          result,
          chunks.length,
          chunkIndex + 1,
          startTime,
          options
        );
      },
      options.concurrency || this.DEFAULT_CONCURRENCY
    );

    result.duration = Date.now() - startTime;
    result.throughput = result.processed / (result.duration / 1000);

    this.logger.log(
      `Batch processing completed: ${result.successful}/${result.total} successful ` +
        `in ${result.duration}ms (${result.throughput.toFixed(0)} items/sec)`
    );

    return result;
  }

  // Private helper methods

  private async insertChunk<T extends ObjectLiteral>(
    repository: Repository<T>,
    chunk: Partial<T>[],
    options: BatchInsertOptions<T>
  ): Promise<T[]> {
    if (options.useTransaction) {
      return await repository.manager.transaction(async (manager) => {
        return await this.executeInsert(
          manager.getRepository(repository.target),
          chunk,
          options
        );
      });
    }

    return await this.executeInsert(repository, chunk, options);
  }

  private async executeInsert<T extends ObjectLiteral>(
    repository: Repository<T>,
    chunk: Partial<T>[],
    options: BatchInsertOptions<T>
  ): Promise<T[]> {
    if (
      options.conflictAction === "ignore" ||
      options.conflictAction === "update"
    ) {
      const queryBuilder = repository
        .createQueryBuilder()
        .insert()
        .into(repository.target)
        .values(chunk);

      if (options.conflictAction === "update" && options.conflictColumns) {
        queryBuilder.orUpdate(
          (options.updateColumns as string[]) || Object.keys(chunk[0] || {}),
          options.conflictColumns as string[]
        );
      } else if (options.conflictAction === "ignore") {
        queryBuilder.orIgnore();
      }

      await queryBuilder.execute();
      return chunk as T[];
    }

    return (await repository.save(
      chunk as unknown as DeepPartial<T>[]
    )) as unknown as T[];
  }

  private async updateChunk<T extends ObjectLiteral>(
    repository: Repository<T>,
    chunk: Array<{ id: string | number; data: Partial<T> }>,
    options: BatchUpdateOptions
  ): Promise<void> {
    if (options.useTransaction) {
      await repository.manager.transaction(async (manager) => {
        for (const { id, data } of chunk) {
          await manager.update(repository.target, id, data);
        }
      });
    } else {
      for (const { id, data } of chunk) {
        await repository.update(id, data);
      }
    }
  }

  private async deleteChunk<T extends ObjectLiteral>(
    repository: Repository<T>,
    chunk: Array<string | number>,
    options: BatchConfig
  ): Promise<void> {
    if (options.useTransaction) {
      // @ts-expect-error - Transaction manager delete types are limited in TypeORM
      await repository.manager.transaction(async (manager) => {
        await manager.delete(repository.target, chunk as string[] | number[]);
      });
    } else {
      await repository.delete(chunk as string[] | number[]);
    }
  }

  private createChunks<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async processChunksWithConcurrency<T>(
    chunks: T[][],
    processor: (chunk: T[], index: number) => Promise<void>,
    concurrency: number
  ): Promise<void> {
    const executing = new Set<Promise<void>>();

    for (let i = 0; i < chunks.length; i++) {
      // Check memory pressure
      while (this.checkMemoryPressure()) {
        await this.sleep(1000);
        if (global.gc) global.gc();
      }

      const p = processor(chunks[i] ?? [], i).then(() => {
        executing.delete(p);
      });

      executing.add(p);

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }

  private async processWithRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number
  ): Promise<T> {
    let lastError: Error = new Error("No attempts made");

    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < attempts - 1) {
          await this.sleep(delay * Math.pow(2, i)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  private reportProgress(
    result: BatchResult,
    totalChunks: number,
    currentChunk: number,
    startTime: number,
    options: BatchConfig
  ): void {
    const elapsed = Date.now() - startTime;
    const percentage = (result.processed / result.total) * 100;
    const estimatedTotal = (elapsed / result.processed) * result.total;
    const estimatedRemaining = estimatedTotal - elapsed;

    const progress: BatchProgress = {
      total: result.total,
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      percentage,
      estimatedTimeRemaining: estimatedRemaining,
      currentChunk,
      totalChunks,
    };

    // Call progress callback
    if (options.progressCallback) {
      options.progressCallback(progress);
    }

    // Emit progress event
    this.eventEmitter.emit("batch.progress", progress);

    this.logger.debug(
      `Progress: ${percentage.toFixed(1)}% (${result.processed}/${result.total}) - ` +
        `ETA: ${(estimatedRemaining / 1000).toFixed(0)}s`
    );
  }

  private handleChunkError(
    result: BatchResult,
    chunk: unknown[],
    chunkIndex: number,
    error: Error,
    options: BatchConfig
  ): void {
    this.logger.error(
      `Chunk ${chunkIndex} failed: ${error.message}`,
      error.stack
    );

    if (options.continueOnError) {
      result.failed += chunk.length;
      result.processed += chunk.length;

      for (let i = 0; i < chunk.length; i++) {
        result.errors.push({
          index:
            chunkIndex * (options.chunkSize || this.DEFAULT_CHUNK_SIZE) + i,
          item: chunk[i],
          error: error.message,
          attempts: 1,
          timestamp: Date.now(),
        });
      }
    } else {
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
