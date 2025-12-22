import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

export interface TransactionOptions {
  isolationLevel?:
    | 'READ UNCOMMITTED'
    | 'READ COMMITTED'
    | 'REPEATABLE READ'
    | 'SERIALIZABLE';
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Execute operations in a transaction
   */
  async executeInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    if (options?.isolationLevel) {
      await queryRunner.startTransaction(options.isolationLevel);
    } else {
      await queryRunner.startTransaction();
    }

    try {
      this.logger.debug('Transaction started');
      
      const result = await work(queryRunner.manager);
      
      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed');
      
      return result;
    } catch (error) {
      const __message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Transaction failed, rolling back', stack);
      await queryRunner.rollbackTransaction();
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute with retry logic
   */
  async executeWithRetry<T>(
    work: (manager: EntityManager) => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeInTransaction(work);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const __stack = error instanceof Error ? error.stack : undefined;
        lastError = error;
        this.logger.warn(
          `Transaction attempt ${attempt} failed: ${message}`,
        );

        if (attempt < maxRetries) {
          await this.delay(retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
