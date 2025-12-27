import { Injectable, Logger } from '@nestjs/common';
import { RetryService } from '../../common/services/retry.service';
import { ErrorCodes } from '../constants/error.codes.constant';

/**
 * Failed Operation
 */
export interface FailedOperation {
  id: string;
  operationType: string;
  payload: any;
  error: Error;
  errorCode: string;
  attemptCount: number;
  maxAttempts: number;
  firstAttempt: string;
  lastAttempt: string;
  nextRetry?: string;
  status: OperationStatus;
  context?: Record<string, any>;
}

/**
 * Operation Status
 */
export enum OperationStatus {
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  FAILED = 'FAILED',
  RECOVERED = 'RECOVERED',
  DEAD_LETTER = 'DEAD_LETTER',
}

/**
 * Recovery Strategy
 */
export interface RecoveryStrategy {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrorCodes: string[];
  notifyOnFailure: boolean;
  moveToDeadLetter: boolean;
}

/**
 * Recovery Result
 */
export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  operation: FailedOperation;
  recoveredAfterAttempts?: number;
}

/**
 * Dead Letter Queue Stats
 */
export interface DeadLetterStats {
  totalItems: number;
  oldestItem?: string;
  newestItem?: string;
  byOperationType: Map<string, number>;
  byErrorCode: Map<string, number>;
}

/**
 * Error Recovery Service
 * Implements automatic retry logic, exponential backoff, and dead letter queue
 * Ensures failed operations are tracked and can be recovered
 */
@Injectable()
export class ErrorRecoveryService {
  private readonly logger = new Logger(ErrorRecoveryService.name);
  private failedOperations: Map<string, FailedOperation> = new Map();
  private deadLetterQueue: Map<string, FailedOperation> = new Map();
  private recoveryInProgress: Set<string> = new Set();

  constructor(private readonly retryService: RetryService) {
    this.startRecoveryWorker();
  }

  /**
   * Execute operation with automatic recovery
   */
  async executeWithRecovery<T>(
    operationType: string,
    operation: () => Promise<T>,
    strategy: Partial<RecoveryStrategy> = {},
    context?: Record<string, any>,
  ): Promise<T> {
    const fullStrategy = this.buildStrategy(strategy);

    try {
      // Execute with retry logic
      const result = await this.retryService.execute(operation, {
        maxAttempts: fullStrategy.maxAttempts,
        initialDelay: fullStrategy.initialDelay,
        maxDelay: fullStrategy.maxDelay,
        backoffMultiplier: fullStrategy.backoffMultiplier,
      });

      return result;
    } catch (error) {
      const errorCode = (error as any).errorCode || 'UNKNOWN';

      // Check if error is retryable
      if (!this.isRetryableError(errorCode, fullStrategy)) {
        this.logger.error(
          `Non-retryable error in ${operationType}: ${errorCode}`,
          error.stack,
        );
        throw error;
      }

      // Queue for recovery
      const failedOp = this.queueFailedOperation(
        operationType,
        {},
        error as Error,
        errorCode,
        fullStrategy,
        context,
      );

      this.logger.warn(
        `Operation ${operationType} failed, queued for recovery: ${failedOp.id}`,
      );

      throw error;
    }
  }

  /**
   * Queue a failed operation for retry
   */
  queueFailedOperation(
    operationType: string,
    payload: any,
    error: Error,
    errorCode: string,
    strategy: RecoveryStrategy,
    context?: Record<string, any>,
  ): FailedOperation {
    const id = this.generateOperationId();
    const now = new Date().toISOString();

    const failedOp: FailedOperation = {
      id,
      operationType,
      payload,
      error,
      errorCode,
      attemptCount: 1,
      maxAttempts: strategy.maxAttempts,
      firstAttempt: now,
      lastAttempt: now,
      nextRetry: this.calculateNextRetry(1, strategy.initialDelay, strategy.backoffMultiplier),
      status: OperationStatus.PENDING,
      context,
    };

    this.failedOperations.set(id, failedOp);

    this.logger.log(
      `Queued failed operation: ${id} (${operationType}) - Next retry: ${failedOp.nextRetry}`,
    );

    return failedOp;
  }

  /**
   * Manually retry a failed operation
   */
  async retryOperation<T>(
    operationId: string,
    operation: () => Promise<T>,
  ): Promise<RecoveryResult<T>> {
    const failedOp = this.failedOperations.get(operationId);

    if (!failedOp) {
      throw new Error(`Failed operation not found: ${operationId}`);
    }

    if (this.recoveryInProgress.has(operationId)) {
      throw new Error(`Recovery already in progress for: ${operationId}`);
    }

    this.recoveryInProgress.add(operationId);
    failedOp.status = OperationStatus.RETRYING;
    failedOp.attemptCount++;
    failedOp.lastAttempt = new Date().toISOString();

    try {
      const result = await operation();

      // Success! Remove from failed operations
      this.failedOperations.delete(operationId);
      failedOp.status = OperationStatus.RECOVERED;

      this.logger.log(
        `Operation recovered successfully: ${operationId} after ${failedOp.attemptCount} attempts`,
      );

      this.recoveryInProgress.delete(operationId);

      return {
        success: true,
        data: result,
        operation: failedOp,
        recoveredAfterAttempts: failedOp.attemptCount,
      };
    } catch (error) {
      const errorCode = (error as any).errorCode || 'UNKNOWN';
      failedOp.error = error as Error;
      failedOp.errorCode = errorCode;

      // Check if we've exhausted retries
      if (failedOp.attemptCount >= failedOp.maxAttempts) {
        this.moveToDeadLetter(failedOp);
      } else {
        // Schedule next retry
        failedOp.nextRetry = this.calculateNextRetry(
          failedOp.attemptCount,
          2000,
          2,
        );
        failedOp.status = OperationStatus.FAILED;
      }

      this.recoveryInProgress.delete(operationId);

      return {
        success: false,
        operation: failedOp,
      };
    }
  }

  /**
   * Get failed operation by ID
   */
  getFailedOperation(operationId: string): FailedOperation | undefined {
    return this.failedOperations.get(operationId);
  }

  /**
   * Get all failed operations
   */
  getAllFailedOperations(): FailedOperation[] {
    return Array.from(this.failedOperations.values());
  }

  /**
   * Get failed operations by type
   */
  getFailedOperationsByType(operationType: string): FailedOperation[] {
    return Array.from(this.failedOperations.values()).filter(
      (op) => op.operationType === operationType,
    );
  }

  /**
   * Get dead letter queue items
   */
  getDeadLetterQueue(): FailedOperation[] {
    return Array.from(this.deadLetterQueue.values());
  }

  /**
   * Get dead letter queue statistics
   */
  getDeadLetterStats(): DeadLetterStats {
    const items = this.getDeadLetterQueue();
    const byOperationType = new Map<string, number>();
    const byErrorCode = new Map<string, number>();

    items.forEach((item) => {
      byOperationType.set(
        item.operationType,
        (byOperationType.get(item.operationType) || 0) + 1,
      );
      byErrorCode.set(
        item.errorCode,
        (byErrorCode.get(item.errorCode) || 0) + 1,
      );
    });

    const sorted = items.sort(
      (a, b) =>
        new Date(a.firstAttempt).getTime() - new Date(b.firstAttempt).getTime(),
    );

    return {
      totalItems: items.length,
      oldestItem: sorted[0]?.firstAttempt,
      newestItem: sorted[sorted.length - 1]?.firstAttempt,
      byOperationType,
      byErrorCode,
    };
  }

  /**
   * Manually move operation to dead letter queue
   */
  moveToDeadLetter(operation: FailedOperation): void {
    operation.status = OperationStatus.DEAD_LETTER;
    this.deadLetterQueue.set(operation.id, operation);
    this.failedOperations.delete(operation.id);

    this.logger.error(
      `Operation moved to dead letter queue: ${operation.id} (${operation.operationType}) ` +
      `after ${operation.attemptCount} attempts. Error: ${operation.errorCode}`,
    );

    // Send notification if configured
    this.notifyDeadLetter(operation);
  }

  /**
   * Reprocess dead letter item
   */
  async reprocessDeadLetter<T>(
    operationId: string,
    operation: () => Promise<T>,
  ): Promise<RecoveryResult<T>> {
    const deadOp = this.deadLetterQueue.get(operationId);

    if (!deadOp) {
      throw new Error(`Dead letter item not found: ${operationId}`);
    }

    // Move back to failed operations for retry
    deadOp.status = OperationStatus.PENDING;
    deadOp.attemptCount = 0;
    this.deadLetterQueue.delete(operationId);
    this.failedOperations.set(operationId, deadOp);

    this.logger.log(`Reprocessing dead letter item: ${operationId}`);

    return this.retryOperation(operationId, operation);
  }

  /**
   * Clear dead letter queue
   */
  clearDeadLetterQueue(olderThan?: Date): number {
    if (!olderThan) {
      const count = this.deadLetterQueue.size;
      this.deadLetterQueue.clear();
      this.logger.log(`Cleared ${count} items from dead letter queue`);
      return count;
    }

    let cleared = 0;
    this.deadLetterQueue.forEach((op, id) => {
      if (new Date(op.firstAttempt) < olderThan) {
        this.deadLetterQueue.delete(id);
        cleared++;
      }
    });

    this.logger.log(
      `Cleared ${cleared} items older than ${olderThan.toISOString()} from dead letter queue`,
    );

    return cleared;
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    pendingOperations: number;
    retryingOperations: number;
    deadLetterItems: number;
    totalFailedOperations: number;
  } {
    const operations = this.getAllFailedOperations();

    return {
      pendingOperations: operations.filter((op) => op.status === OperationStatus.PENDING).length,
      retryingOperations: operations.filter((op) => op.status === OperationStatus.RETRYING).length,
      deadLetterItems: this.deadLetterQueue.size,
      totalFailedOperations: this.failedOperations.size,
    };
  }

  private buildStrategy(partial: Partial<RecoveryStrategy>): RecoveryStrategy {
    return {
      maxAttempts: partial.maxAttempts ?? 3,
      initialDelay: partial.initialDelay ?? 1000,
      maxDelay: partial.maxDelay ?? 30000,
      backoffMultiplier: partial.backoffMultiplier ?? 2,
      retryableErrorCodes: partial.retryableErrorCodes ?? this.getDefaultRetryableErrors(),
      notifyOnFailure: partial.notifyOnFailure ?? true,
      moveToDeadLetter: partial.moveToDeadLetter ?? true,
    };
  }

  private getDefaultRetryableErrors(): string[] {
    // Get all retryable error codes
    return ErrorCodes.getRetryableErrors().map((def) => def.code);
  }

  private isRetryableError(errorCode: string, strategy: RecoveryStrategy): boolean {
    if (strategy.retryableErrorCodes.length === 0) {
      return true; // Retry all if not specified
    }

    return strategy.retryableErrorCodes.includes(errorCode);
  }

  private calculateNextRetry(
    attemptCount: number,
    initialDelay: number,
    backoffMultiplier: number,
  ): string {
    const delay = initialDelay * Math.pow(backoffMultiplier, attemptCount - 1);
    const nextRetry = new Date(Date.now() + delay);
    return nextRetry.toISOString();
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private notifyDeadLetter(operation: FailedOperation): void {
    // Integration point for notifications
    // - Send email to operations team
    // - Post to Slack channel
    // - Create PagerDuty incident
    // - Log to monitoring system

    this.logger.error(
      `DEAD LETTER NOTIFICATION: ${operation.operationType} failed permanently`,
      {
        operationId: operation.id,
        errorCode: operation.errorCode,
        attempts: operation.attemptCount,
        context: operation.context,
      },
    );
  }

  private startRecoveryWorker(): void {
    // Run recovery worker every 30 seconds
    setInterval(() => {
      this.processRecoveryQueue();
    }, 30000);
  }

  private async processRecoveryQueue(): Promise<void> {
    const now = new Date();
    const operations = this.getAllFailedOperations();

    const readyForRetry = operations.filter(
      (op) =>
        op.status === OperationStatus.PENDING &&
        op.nextRetry &&
        new Date(op.nextRetry) <= now &&
        !this.recoveryInProgress.has(op.id),
    );

    if (readyForRetry.length > 0) {
      this.logger.log(
        `Recovery worker: Processing ${readyForRetry.length} operations ready for retry`,
      );
    }

    // Note: Actual retry would need the operation function
    // In practice, operations would be stored with serializable payloads
    // and a registry of operation handlers would be used for recovery
  }
}
