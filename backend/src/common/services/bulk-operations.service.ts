import { Injectable, Logger } from "@nestjs/common";
import * as MasterConfig from "@config/master.config";
import { Repository, ObjectLiteral, DeepPartial } from "typeorm";

/**
 * Bulk Operation Result
 */
export interface BulkOperationResult<T> {
  success: T[];
  failed: BulkOperationError[];
  total: number;
  successCount: number;
  failedCount: number;
}

export interface BulkOperationError {
  item: unknown;
  error: string;
  index: number;
}

/**
 * Bulk Operations Service
 * Provides high-performance batch operations with transaction support
 * Optimized for processing thousands of records efficiently
 *
 * @example
 * const result = await bulkOperationsService.bulkInsert(
 *   repository,
 *   items,
 *   { batchSize: 500, useTransaction: true }
 * );
 */
/**
 * ╔=================================================================================================================╗
 * ║BULKOPERATIONS                                                                                                   ║
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
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);
  private readonly DEFAULT_BATCH_SIZE = MasterConfig.BULK_OPERATION_BATCH_SIZE;

  /**
   * Bulk insert with batching and transaction support
   */
  async bulkInsert<T extends ObjectLiteral>(
    repository: Repository<T>,
    items: Partial<T>[],
    options: {
      batchSize?: number;
      useTransaction?: boolean;
      continueOnError?: boolean;
    } = {}
  ): Promise<BulkOperationResult<T>> {
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const result: BulkOperationResult<T> = {
      success: [],
      failed: [],
      total: items.length,
      successCount: 0,
      failedCount: 0,
    };

    this.logger.log(`Starting bulk insert of ${items.length} items`);

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        if (options.useTransaction) {
          await repository.manager.transaction(async (manager) => {
            const inserted = await manager.save(
              repository.target,
              batch as unknown as DeepPartial<T>[]
            );
            result.success.push(...(inserted as T[]));
          });
        } else {
          const inserted = await repository.save(
            batch as unknown as DeepPartial<T>[]
          );
          result.success.push(...(inserted as T[]));
        }

        result.successCount += batch.length;
        this.logger.log(`Processed batch ${Math.floor(i / batchSize) + 1}`);
      } catch (error: unknown) {
        if (options.continueOnError) {
          batch.forEach((item, idx) => {
            result.failed.push({
              item,
              error: (error as Error).message,
              index: i + idx,
            });
          });
          result.failedCount += batch.length;
          this.logger.warn(
            `Batch failed, continuing: ${(error as Error).message}`
          );
        } else {
          throw error;
        }
      }
    }

    this.logger.log(
      `Bulk insert completed: ${result.successCount} success, ${result.failedCount} failed`
    );

    // Clear batch arrays to free memory
    items.length = 0;

    return result;
  }

  /**
   * Bulk update with batching
   */
  async bulkUpdate<T extends ObjectLiteral>(
    repository: Repository<T>,
    items: Array<{ id: string | number; updates: Partial<T> }>,
    options: {
      batchSize?: number;
      useTransaction?: boolean;
    } = {}
  ): Promise<BulkOperationResult<T>> {
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const result: BulkOperationResult<T> = {
      success: [],
      failed: [],
      total: items.length,
      successCount: 0,
      failedCount: 0,
    };

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        if (options.useTransaction) {
          await repository.manager.transaction(async (manager) => {
            for (const { id, updates } of batch) {
              await manager.update(
                repository.target,
                id,
                updates as Partial<T>
              );
            }
          });
        } else {
          for (const { id, updates } of batch) {
            await repository.update(id, updates as Partial<T>);
          }
        }

        result.successCount += batch.length;
      } catch (error: unknown) {
        batch.forEach((item, idx) => {
          result.failed.push({
            item,
            error: (error as Error).message,
            index: i + idx,
          });
        });
        result.failedCount += batch.length;
      }
    }

    return result;
  }

  /**
   * Bulk delete with batching
   */
  async bulkDelete<T extends ObjectLiteral>(
    repository: Repository<T>,
    ids: Array<string | number>,
    options: {
      batchSize?: number;
      useTransaction?: boolean;
      softDelete?: boolean;
    } = {}
  ): Promise<{ deletedCount: number; errors: string[] }> {
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    let deletedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);

      try {
        if (options.useTransaction) {
          await repository.manager.transaction(async (manager) => {
            if (options.softDelete) {
              await manager.softDelete(repository.target, batch);
            } else {
              await manager.delete(repository.target, batch);
            }
          });
        } else {
          if (options.softDelete) {
            await repository.softDelete(batch as string[] | number[]);
          } else {
            await repository.delete(batch as string[] | number[]);
          }
        }

        deletedCount += batch.length;
      } catch (error: unknown) {
        errors.push(
          `Batch ${i}-${i + batch.length}: ${(error as Error).message}`
        );
      }
    }

    return { deletedCount, errors };
  }

  /**
   * Bulk upsert (insert or update)
   */
  async bulkUpsert<T extends ObjectLiteral>(
    repository: Repository<T>,
    items: Partial<T>[],
    conflictColumns: string[],
    options: {
      batchSize?: number;
      updateColumns?: string[];
    } = {}
  ): Promise<BulkOperationResult<T>> {
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const result: BulkOperationResult<T> = {
      success: [],
      failed: [],
      total: items.length,
      successCount: 0,
      failedCount: 0,
    };

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      try {
        await repository
          .createQueryBuilder()
          .insert()
          .into(repository.target)
          .values(batch as Partial<T>[])
          .orUpdate(
            options.updateColumns || Object.keys(batch[0] || {}),
            conflictColumns
          )
          .execute();

        result.successCount += batch.length;
      } catch (error: unknown) {
        batch.forEach((item, idx) => {
          result.failed.push({
            item,
            error: (error as Error).message,
            index: i + idx,
          });
        });
        result.failedCount += batch.length;
      }
    }

    return result;
  }
}
