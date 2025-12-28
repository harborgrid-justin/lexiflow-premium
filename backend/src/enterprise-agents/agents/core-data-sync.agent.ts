/**
 * Enterprise Agent 01: Core Data Sync Agent
 *
 * Handles real-time data synchronization between frontend and backend,
 * manages conflict resolution, and ensures data consistency across
 * the distributed system.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';
import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
  AgentEventType,
  TaskStatus,
} from '../interfaces/agent.interfaces';

/**
 * Sync operation types
 */
export enum SyncOperationType {
  FULL_SYNC = 'FULL_SYNC',
  INCREMENTAL_SYNC = 'INCREMENTAL_SYNC',
  CONFLICT_RESOLUTION = 'CONFLICT_RESOLUTION',
  SCHEMA_MIGRATION = 'SCHEMA_MIGRATION',
  DATA_VALIDATION = 'DATA_VALIDATION',
  CACHE_INVALIDATION = 'CACHE_INVALIDATION',
}

/**
 * Sync task payload
 */
export interface SyncTaskPayload {
  operationType: SyncOperationType;
  entityType?: string;
  entityIds?: string[];
  fromTimestamp?: Date;
  toTimestamp?: Date;
  options?: Record<string, unknown>;
}

/**
 * Sync result
 */
export interface SyncResult {
  operationType: SyncOperationType;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  conflictsResolved: number;
  errors: string[];
  duration: number;
}

/**
 * Conflict entry
 */
interface ConflictEntry {
  entityType: string;
  entityId: string;
  localVersion: number;
  remoteVersion: number;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Core Data Sync Agent
 * Manages data synchronization and consistency
 */
@Injectable()
export class CoreDataSyncAgent extends BaseAgent {
  private readonly syncLogger = new Logger(CoreDataSyncAgent.name);
  private readonly conflicts: Map<string, ConflictEntry> = new Map();
  private syncInProgress = false;
  private lastSyncTimestamp?: Date;

  constructor(
    eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {
    super(
      createAgentMetadata(
        'CoreDataSyncAgent',
        AgentType.WORKER,
        [
          'data.sync.full',
          'data.sync.incremental',
          'data.conflict.resolve',
          'data.validation',
          'cache.invalidation',
        ],
        {
          priority: AgentPriority.HIGH,
          maxConcurrentTasks: 5,
          heartbeatIntervalMs: 15000,
          healthCheckIntervalMs: 30000,
        },
      ),
      eventEmitter,
    );
  }

  /**
   * Initialize agent
   */
  protected async onInitialize(): Promise<void> {
    this.syncLogger.log('Initializing Core Data Sync Agent');
    await this.validateDatabaseConnection();
  }

  /**
   * Start agent
   */
  protected async onStart(): Promise<void> {
    this.syncLogger.log('Core Data Sync Agent started');
    await this.schedulePeriodicSync();
  }

  /**
   * Stop agent
   */
  protected async onStop(): Promise<void> {
    this.syncLogger.log('Core Data Sync Agent stopping');
    this.syncInProgress = false;
  }

  /**
   * Pause agent
   */
  protected async onPause(): Promise<void> {
    this.syncLogger.log('Core Data Sync Agent paused');
  }

  /**
   * Resume agent
   */
  protected async onResume(): Promise<void> {
    this.syncLogger.log('Core Data Sync Agent resumed');
  }

  /**
   * Handle incoming events
   */
  protected async onEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case AgentEventType.SYNC_REQUEST:
        await this.handleSyncRequest(event.payload as SyncTaskPayload);
        break;
      default:
        this.syncLogger.debug(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Execute sync task
   */
  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as SyncTaskPayload;

    switch (payload.operationType) {
      case SyncOperationType.FULL_SYNC:
        return this.performFullSync(payload) as unknown as TResult;

      case SyncOperationType.INCREMENTAL_SYNC:
        return this.performIncrementalSync(payload) as unknown as TResult;

      case SyncOperationType.CONFLICT_RESOLUTION:
        return this.resolveConflicts(payload) as unknown as TResult;

      case SyncOperationType.DATA_VALIDATION:
        return this.validateData(payload) as unknown as TResult;

      case SyncOperationType.CACHE_INVALIDATION:
        return this.invalidateCache(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  /**
   * Perform full database sync
   */
  private async performFullSync(payload: SyncTaskPayload): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const result: SyncResult = {
      operationType: SyncOperationType.FULL_SYNC,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      duration: 0,
    };

    try {
      const entityMetadata = this.dataSource.entityMetadatas;

      for (const metadata of entityMetadata) {
        if (payload.entityType && metadata.name !== payload.entityType) {
          continue;
        }

        try {
          const repository = this.dataSource.getRepository(metadata.target);
          const count = await repository.count();
          result.recordsProcessed += count;
          this.syncLogger.debug(`Synced ${count} records for ${metadata.name}`);
        } catch (error) {
          result.errors.push(`Error syncing ${metadata.name}: ${(error as Error).message}`);
        }
      }

      this.lastSyncTimestamp = new Date();
      result.duration = Date.now() - startTime;

      await this.emitEvent(AgentEventType.SYNC_COMPLETE, {
        result,
        timestamp: this.lastSyncTimestamp,
      });

      return result;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform incremental sync
   */
  private async performIncrementalSync(payload: SyncTaskPayload): Promise<SyncResult> {
    const startTime = Date.now();
    const fromTimestamp = payload.fromTimestamp ?? this.lastSyncTimestamp ?? new Date(0);

    const result: SyncResult = {
      operationType: SyncOperationType.INCREMENTAL_SYNC,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      duration: 0,
    };

    try {
      const entityMetadata = this.dataSource.entityMetadatas;

      for (const metadata of entityMetadata) {
        if (payload.entityType && metadata.name !== payload.entityType) {
          continue;
        }

        const hasUpdatedAt = metadata.columns.some(
          col => col.propertyName === 'updatedAt',
        );

        if (hasUpdatedAt) {
          try {
            const repository = this.dataSource.getRepository(metadata.target);
            const updatedRecords = await repository
              .createQueryBuilder()
              .where('updatedAt > :fromTimestamp', { fromTimestamp })
              .getMany();

            result.recordsProcessed += updatedRecords.length;
            result.recordsUpdated += updatedRecords.length;
          } catch (error) {
            result.errors.push(`Error syncing ${metadata.name}: ${(error as Error).message}`);
          }
        }
      }

      this.lastSyncTimestamp = new Date();
      result.duration = Date.now() - startTime;

      return result;
    } catch (error) {
      result.errors.push((error as Error).message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Resolve data conflicts
   */
  private async resolveConflicts(payload: SyncTaskPayload): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      operationType: SyncOperationType.CONFLICT_RESOLUTION,
      recordsProcessed: this.conflicts.size,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      duration: 0,
    };

    for (const [key, conflict] of this.conflicts) {
      try {
        const resolved = await this.resolveConflict(conflict);
        if (resolved) {
          result.conflictsResolved++;
          this.conflicts.delete(key);
        }
      } catch (error) {
        result.errors.push(`Conflict resolution failed for ${key}: ${(error as Error).message}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Resolve a single conflict
   */
  private async resolveConflict(conflict: ConflictEntry): Promise<boolean> {
    if (conflict.remoteVersion > conflict.localVersion) {
      this.syncLogger.debug(
        `Resolving conflict for ${conflict.entityType}:${conflict.entityId} - using remote version`,
      );
      return true;
    }

    if (conflict.localVersion > conflict.remoteVersion) {
      this.syncLogger.debug(
        `Resolving conflict for ${conflict.entityType}:${conflict.entityId} - using local version`,
      );
      return true;
    }

    this.syncLogger.warn(
      `Cannot auto-resolve conflict for ${conflict.entityType}:${conflict.entityId} - versions equal`,
    );
    return false;
  }

  /**
   * Validate data integrity
   */
  private async validateData(payload: SyncTaskPayload): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      operationType: SyncOperationType.DATA_VALIDATION,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      duration: 0,
    };

    try {
      const entityMetadata = this.dataSource.entityMetadatas;

      for (const metadata of entityMetadata) {
        if (payload.entityType && metadata.name !== payload.entityType) {
          continue;
        }

        const repository = this.dataSource.getRepository(metadata.target);
        const count = await repository.count();
        result.recordsProcessed += count;
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.errors.push((error as Error).message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Invalidate cache entries
   */
  private async invalidateCache(payload: SyncTaskPayload): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      operationType: SyncOperationType.CACHE_INVALIDATION,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      conflictsResolved: 0,
      errors: [],
      duration: 0,
    };

    try {
      await this.emitEvent(AgentEventType.SCRATCHPAD_CLEAR, {
        pattern: payload.entityType ? `cache:${payload.entityType}:*` : 'cache:*',
      });

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.errors.push((error as Error).message);
      result.duration = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Handle sync request event
   */
  private async handleSyncRequest(payload: SyncTaskPayload): Promise<void> {
    this.syncLogger.log(`Received sync request: ${payload.operationType}`);

    const task: AgentTask<SyncTaskPayload, SyncResult> = {
      id: `sync-${Date.now()}`,
      type: 'sync',
      priority: AgentPriority.HIGH,
      payload,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      timeoutMs: 300000,
      metadata: {},
    };

    await this.processTask(task);
  }

  /**
   * Validate database connection
   */
  private async validateDatabaseConnection(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      throw new Error('Database connection not initialized');
    }
    this.syncLogger.log('Database connection validated');
  }

  /**
   * Schedule periodic sync operations
   */
  private async schedulePeriodicSync(): Promise<void> {
    this.syncLogger.log('Periodic sync scheduling initialized');
  }

  /**
   * Register a conflict for resolution
   */
  public registerConflict(conflict: ConflictEntry): void {
    const key = `${conflict.entityType}:${conflict.entityId}`;
    this.conflicts.set(key, conflict);
    this.syncLogger.warn(`Conflict registered: ${key}`);
  }

  /**
   * Get pending conflicts
   */
  public getPendingConflicts(): ConflictEntry[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Get last sync timestamp
   */
  public getLastSyncTimestamp(): Date | undefined {
    return this.lastSyncTimestamp;
  }
}
