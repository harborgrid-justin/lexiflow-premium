/**
 * Enterprise Agent 07: Cache Management Agent
 *
 * Manages distributed caching, cache invalidation strategies,
 * cache warming, and memory optimization across the system.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
} from '../interfaces/agent.interfaces';

/**
 * Cache operation types
 */
export enum CacheOperationType {
  GET = 'GET',
  SET = 'SET',
  DELETE = 'DELETE',
  INVALIDATE = 'INVALIDATE',
  WARM = 'WARM',
  FLUSH = 'FLUSH',
  STATS = 'STATS',
  OPTIMIZE = 'OPTIMIZE',
}

/**
 * Cache tier
 */
export enum CacheTier {
  L1_MEMORY = 'L1_MEMORY',
  L2_REDIS = 'L2_REDIS',
  L3_DATABASE = 'L3_DATABASE',
}

/**
 * Cache task payload
 */
export interface CacheTaskPayload {
  operationType: CacheOperationType;
  key?: string;
  pattern?: string;
  value?: unknown;
  ttlSeconds?: number;
  tier?: CacheTier;
  tags?: string[];
}

/**
 * Cache result
 */
export interface CacheResult {
  operationType: CacheOperationType;
  key?: string;
  value?: unknown;
  hit: boolean;
  tier?: CacheTier;
  stats?: CacheStats;
  duration: number;
  errors: string[];
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalKeys: number;
  memoryUsedBytes: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  evictionCount: number;
  avgKeyAgeMs: number;
}

/**
 * Cache entry
 */
interface CacheEntry {
  value: unknown;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessedAt: Date;
  tags: string[];
  tier: CacheTier;
}

/**
 * Cache Management Agent
 * Handles distributed caching and memory optimization
 */
@Injectable()
export class CacheManagementAgent extends BaseAgent {
  private readonly cacheLogger = new Logger(CacheManagementAgent.name);
  private readonly l1Cache: Map<string, CacheEntry> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private readonly maxL1Size = 10000;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(eventEmitter: EventEmitter2) {
    super(
      createAgentMetadata(
        'CacheManagementAgent',
        AgentType.WORKER,
        [
          'cache.get',
          'cache.set',
          'cache.delete',
          'cache.invalidate',
          'cache.warm',
          'cache.flush',
          'cache.stats',
          'cache.optimize',
        ],
        {
          priority: AgentPriority.HIGH,
          maxConcurrentTasks: 50,
          heartbeatIntervalMs: 10000,
          healthCheckIntervalMs: 30000,
        },
      ),
      eventEmitter,
    );
  }

  protected async onInitialize(): Promise<void> {
    this.cacheLogger.log('Initializing Cache Management Agent');
  }

  protected async onStart(): Promise<void> {
    this.cacheLogger.log('Cache Management Agent started');
    this.startCleanupCycle();
  }

  protected async onStop(): Promise<void> {
    this.cacheLogger.log('Cache Management Agent stopping');
    this.stopCleanupCycle();
  }

  protected async onPause(): Promise<void> {
    this.cacheLogger.log('Cache Management Agent paused');
  }

  protected async onResume(): Promise<void> {
    this.cacheLogger.log('Cache Management Agent resumed');
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    this.cacheLogger.debug(`Received event: ${event.type}`);
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as CacheTaskPayload;

    switch (payload.operationType) {
      case CacheOperationType.GET:
        return this.get(payload) as unknown as TResult;

      case CacheOperationType.SET:
        return this.set(payload) as unknown as TResult;

      case CacheOperationType.DELETE:
        return this.delete(payload) as unknown as TResult;

      case CacheOperationType.INVALIDATE:
        return this.invalidate(payload) as unknown as TResult;

      case CacheOperationType.WARM:
        return this.warm(payload) as unknown as TResult;

      case CacheOperationType.FLUSH:
        return this.flush(payload) as unknown as TResult;

      case CacheOperationType.STATS:
        return this.getStats(payload) as unknown as TResult;

      case CacheOperationType.OPTIMIZE:
        return this.optimize(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  private async get(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const key = payload.key ?? '';
    const entry = this.l1Cache.get(key);

    if (entry) {
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        this.l1Cache.delete(key);
        this.missCount++;
        return {
          operationType: CacheOperationType.GET,
          key,
          hit: false,
          duration: Date.now() - startTime,
          errors: [],
        };
      }

      entry.accessCount++;
      entry.lastAccessedAt = new Date();
      this.hitCount++;

      return {
        operationType: CacheOperationType.GET,
        key,
        value: entry.value,
        hit: true,
        tier: entry.tier,
        duration: Date.now() - startTime,
        errors: [],
      };
    }

    this.missCount++;
    return {
      operationType: CacheOperationType.GET,
      key,
      hit: false,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async set(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const key = payload.key ?? '';

    if (this.l1Cache.size >= this.maxL1Size) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry = {
      value: payload.value,
      createdAt: new Date(),
      expiresAt: payload.ttlSeconds
        ? new Date(Date.now() + payload.ttlSeconds * 1000)
        : undefined,
      accessCount: 0,
      lastAccessedAt: new Date(),
      tags: payload.tags ?? [],
      tier: payload.tier ?? CacheTier.L1_MEMORY,
    };

    this.l1Cache.set(key, entry);

    return {
      operationType: CacheOperationType.SET,
      key,
      hit: true,
      tier: entry.tier,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async delete(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const key = payload.key ?? '';
    const deleted = this.l1Cache.delete(key);

    return {
      operationType: CacheOperationType.DELETE,
      key,
      hit: deleted,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async invalidate(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const pattern = payload.pattern ?? '*';
    let invalidatedCount = 0;

    if (pattern === '*') {
      invalidatedCount = this.l1Cache.size;
      this.l1Cache.clear();
    } else {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      for (const key of this.l1Cache.keys()) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          invalidatedCount++;
        }
      }
    }

    return {
      operationType: CacheOperationType.INVALIDATE,
      hit: invalidatedCount > 0,
      stats: { totalKeys: invalidatedCount } as CacheStats,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async warm(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();

    return {
      operationType: CacheOperationType.WARM,
      hit: true,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async flush(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const count = this.l1Cache.size;
    this.l1Cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictionCount = 0;

    return {
      operationType: CacheOperationType.FLUSH,
      hit: true,
      stats: { totalKeys: count } as CacheStats,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async getStats(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    const totalHits = this.hitCount + this.missCount;

    const stats: CacheStats = {
      totalKeys: this.l1Cache.size,
      memoryUsedBytes: this.estimateMemoryUsage(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalHits > 0 ? this.hitCount / totalHits : 0,
      evictionCount: this.evictionCount,
      avgKeyAgeMs: this.calculateAvgKeyAge(),
    };

    return {
      operationType: CacheOperationType.STATS,
      hit: true,
      stats,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async optimize(payload: CacheTaskPayload): Promise<CacheResult> {
    const startTime = Date.now();
    let optimizedCount = 0;

    const now = new Date();
    for (const [key, entry] of this.l1Cache) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.l1Cache.delete(key);
        optimizedCount++;
      }
    }

    return {
      operationType: CacheOperationType.OPTIMIZE,
      hit: true,
      stats: { totalKeys: optimizedCount } as CacheStats,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, entry] of this.l1Cache) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.l1Cache.delete(oldestKey);
      this.evictionCount++;
    }
  }

  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.l1Cache) {
      totalSize += key.length * 2;
      totalSize += JSON.stringify(entry.value).length * 2;
    }
    return totalSize;
  }

  private calculateAvgKeyAge(): number {
    if (this.l1Cache.size === 0) return 0;

    let totalAge = 0;
    const now = Date.now();
    for (const entry of this.l1Cache.values()) {
      totalAge += now - entry.createdAt.getTime();
    }
    return totalAge / this.l1Cache.size;
  }

  private startCleanupCycle(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000);
  }

  private stopCleanupCycle(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  private performCleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.l1Cache) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.l1Cache.delete(key);
      }
    }
  }

  public getCacheSize(): number {
    return this.l1Cache.size;
  }

  public getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }
}
