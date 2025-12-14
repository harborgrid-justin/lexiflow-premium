import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

/**
 * Transaction Options
 */
export interface TransactionOptions {
  isolationLevel?: 
    | 'READ UNCOMMITTED'
    | 'READ COMMITTED'
    | 'REPEATABLE READ'
    | 'SERIALIZABLE';
  timeout?: number; // milliseconds
}

/**
 * Transaction Manager Service
 * Provides enterprise-grade transaction management with automatic rollback
 * Supports nested transactions and savepoints
 * 
 * @example
 * await transactionManager.executeInTransaction(async (manager) => {
 *   await manager.save(entity1);
 *   await manager.save(entity2);
 *   // Automatic rollback on error
 * });
 */
@Injectable()
export class TransactionManagerService {
  private readonly logger = new Logger(TransactionManagerService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Execute operations in a transaction
   * Automatically commits on success, rolls back on error
   */
  async executeInTransaction<T>(
    operation: (manager: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(options?.isolationLevel);

    const startTime = Date.now();

    try {
      // Execute operation with transaction manager
      const result = await operation(queryRunner.manager);

      // Commit transaction
      await queryRunner.commitTransaction();

      const duration = Date.now() - startTime;
      this.logger.log(`Transaction committed successfully (${duration}ms)`);

      return result;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();

      const duration = Date.now() - startTime;
      this.logger.error(
        `Transaction rolled back after ${duration}ms: ${error.message}`,
        error.stack,
      );

      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Execute with savepoint for nested transactions
   */
  async executeWithSavepoint<T>(
    queryRunner: QueryRunner,
    operation: (manager: EntityManager) => Promise<T>,
    savepointName: string = 'sp1',
  ): Promise<T> {
    await queryRunner.query(`SAVEPOINT ${savepointName}`);

    try {
      const result = await operation(queryRunner.manager);
      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      return result;
    } catch (error) {
      await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      throw error;
    }
  }

  /**
   * Bulk execute with transaction
   * Processes items in batches with transaction per batch
   */
  async bulkExecuteInTransaction<T, R>(
    items: T[],
    batchSize: number,
    operation: (batch: T[], manager: EntityManager) => Promise<R[]>,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await this.executeInTransaction(async (manager) => {
        return operation(batch, manager);
      });

      results.push(...batchResults);

      this.logger.log(
        `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`,
      );
    }

    return results;
  }

  /**
   * Execute with retry on deadlock
   */
  async executeWithDeadlockRetry<T>(
    operation: (manager: EntityManager) => Promise<T>,
    maxRetries: number = 3,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeInTransaction(operation);
      } catch (error: any) {
        const isDeadlock =
          error.code === '40P01' || // PostgreSQL deadlock
          error.code === '40001'; // Serialization failure

        if (isDeadlock && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff
          this.logger.warn(
            `Deadlock detected, retrying (${attempt}/${maxRetries}) in ${delay}ms`,
          );
          await this.sleep(delay);
        } else {
          throw error;
        }
      }
    }

    throw new Error('Transaction failed after maximum retries');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
