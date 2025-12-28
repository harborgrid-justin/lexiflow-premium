/**
 * Enterprise Agent 12: Scratchpad Manager Agent
 *
 * Manages shared state and temporary data between agents.
 * Provides a centralized key-value store with TTL support,
 * subscriptions, and cross-agent data sharing capabilities.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  IScratchpadManager,
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
  AgentEventType,
  ScratchpadEntry,
  ScratchpadStats,
} from '../interfaces/agent.interfaces';
import { AgentEventBus } from '../events/agent-event-bus';

/**
 * Scratchpad operation types
 */
export enum ScratchpadOperationType {
  WRITE = 'WRITE',
  READ = 'READ',
  DELETE = 'DELETE',
  CLEAR = 'CLEAR',
  GET_KEYS = 'GET_KEYS',
  GET_ENTRIES = 'GET_ENTRIES',
  GET_STATS = 'GET_STATS',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
}

/**
 * Scratchpad task payload
 */
export interface ScratchpadTaskPayload {
  operationType: ScratchpadOperationType;
  key?: string;
  value?: unknown;
  pattern?: string;
  ttlMs?: number;
  agentId?: string;
}

/**
 * Scratchpad result
 */
export interface ScratchpadResult {
  operationType: ScratchpadOperationType;
  key?: string;
  entry?: ScratchpadEntry;
  entries?: ScratchpadEntry[];
  keys?: string[];
  stats?: ScratchpadStats;
  deleted?: boolean;
  clearedCount?: number;
  duration: number;
  errors: string[];
}

/**
 * Internal entry with additional metadata
 */
interface InternalEntry<T = unknown> extends ScratchpadEntry<T> {
  accessCount: number;
  lastAccessedAt: Date;
}

/**
 * Subscription entry
 */
interface SubscriptionEntry {
  id: string;
  key: string;
  agentId: string;
  callback: (entry: ScratchpadEntry) => void;
}

/**
 * Scratchpad Manager Agent
 * Manages shared state between agents
 */
@Injectable()
export class ScratchpadManagerAgent extends BaseAgent implements IScratchpadManager, OnModuleInit, OnModuleDestroy {
  private readonly scratchpadLogger = new Logger(ScratchpadManagerAgent.name);
  private readonly entries: Map<string, InternalEntry> = new Map();
  private readonly subscriptions: Map<string, SubscriptionEntry> = new Map();
  private readonly keySubscriptions: Map<string, Set<string>> = new Map();

  private hitCount = 0;
  private missCount = 0;
  private expirationCount = 0;
  private cleanupInterval?: NodeJS.Timeout;

  private readonly maxEntries = 100000;
  private readonly maxEntrySizeBytes = 1024 * 1024; // 1MB max entry size
  private readonly defaultTtlMs = 3600000;

  constructor(
    eventEmitter: EventEmitter2,
    private readonly eventBus: AgentEventBus,
  ) {
    super(
      createAgentMetadata(
        'ScratchpadManagerAgent',
        AgentType.SCRATCHPAD,
        [
          'scratchpad.write',
          'scratchpad.read',
          'scratchpad.delete',
          'scratchpad.clear',
          'scratchpad.keys',
          'scratchpad.entries',
          'scratchpad.stats',
          'scratchpad.subscribe',
          'scratchpad.unsubscribe',
        ],
        {
          priority: AgentPriority.HIGH,
          maxConcurrentTasks: 200,
          heartbeatIntervalMs: 10000,
          healthCheckIntervalMs: 30000,
        },
      ),
      eventEmitter,
    );
  }

  /**
   * Initialize on module start
   */
  async onModuleInit(): Promise<void> {
    await this.initialize();
    await this.start();
    this.subscribeToEvents();
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  protected async onInitialize(): Promise<void> {
    this.scratchpadLogger.log('Initializing Scratchpad Manager Agent');
  }

  protected async onStart(): Promise<void> {
    this.scratchpadLogger.log('Scratchpad Manager Agent started');
    this.startCleanupCycle();
  }

  protected async onStop(): Promise<void> {
    this.scratchpadLogger.log('Scratchpad Manager Agent stopping');
    this.stopCleanupCycle();
  }

  protected async onPause(): Promise<void> {
    this.scratchpadLogger.log('Scratchpad Manager Agent paused');
  }

  protected async onResume(): Promise<void> {
    this.scratchpadLogger.log('Scratchpad Manager Agent resumed');
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case AgentEventType.SCRATCHPAD_WRITE:
        const writePayload = event.payload as { key: string; value: unknown; ttlMs?: number };
        await this.write(writePayload.key, writePayload.value, writePayload.ttlMs);
        break;

      case AgentEventType.SCRATCHPAD_READ:
        const readPayload = event.payload as { key: string };
        await this.read(readPayload.key);
        break;

      case AgentEventType.SCRATCHPAD_CLEAR:
        const clearPayload = event.payload as { pattern?: string };
        await this.clear(clearPayload.pattern);
        break;
    }
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as ScratchpadTaskPayload;

    switch (payload.operationType) {
      case ScratchpadOperationType.WRITE:
        return this.handleWrite(payload) as unknown as TResult;

      case ScratchpadOperationType.READ:
        return this.handleRead(payload) as unknown as TResult;

      case ScratchpadOperationType.DELETE:
        return this.handleDelete(payload) as unknown as TResult;

      case ScratchpadOperationType.CLEAR:
        return this.handleClear(payload) as unknown as TResult;

      case ScratchpadOperationType.GET_KEYS:
        return this.handleGetKeys(payload) as unknown as TResult;

      case ScratchpadOperationType.GET_ENTRIES:
        return this.handleGetEntries(payload) as unknown as TResult;

      case ScratchpadOperationType.GET_STATS:
        return this.handleGetStats() as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  /**
   * Write a value to the scratchpad
   */
  async write<T>(key: string, value: T, ttlMs?: number): Promise<ScratchpadEntry<T>> {
    // Validate entry size
    const valueSize = JSON.stringify(value).length * 2;
    if (valueSize > this.maxEntrySizeBytes) {
      throw new Error(`Entry size ${valueSize} bytes exceeds maximum allowed size of ${this.maxEntrySizeBytes} bytes`);
    }

    if (this.entries.size >= this.maxEntries) {
      this.evictOldestEntry();
    }

    const entry: InternalEntry<T> = {
      key,
      value,
      agentId: this.metadata.id,
      timestamp: new Date(),
      expiresAt: ttlMs ? new Date(Date.now() + ttlMs) : new Date(Date.now() + this.defaultTtlMs),
      version: (this.entries.get(key)?.version ?? 0) + 1,
      metadata: {},
      accessCount: 0,
      lastAccessedAt: new Date(),
    };

    this.entries.set(key, entry);
    this.notifySubscribers(key, entry);

    await this.emitEvent(AgentEventType.SCRATCHPAD_WRITE, { key, agentId: this.metadata.id });

    return entry;
  }

  /**
   * Read a value from the scratchpad
   */
  async read<T>(key: string): Promise<ScratchpadEntry<T> | null> {
    const entry = this.entries.get(key) as InternalEntry<T> | undefined;

    if (!entry) {
      this.missCount++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key);
      this.expirationCount++;
      this.missCount++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccessedAt = new Date();
    this.hitCount++;

    return entry;
  }

  /**
   * Delete a key from the scratchpad
   */
  async delete(key: string): Promise<boolean> {
    const deleted = this.entries.delete(key);
    return deleted;
  }

  /**
   * Clear entries matching a pattern
   */
  async clear(pattern?: string): Promise<number> {
    if (!pattern || pattern === '*') {
      const count = this.entries.size;
      this.entries.clear();
      return count;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;

    for (const key of this.entries.keys()) {
      if (regex.test(key)) {
        this.entries.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get keys matching a pattern
   */
  async getKeys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.entries.keys());

    if (!pattern || pattern === '*') {
      return keys;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  /**
   * Get entries matching a pattern
   */
  async getEntries(pattern?: string): Promise<ScratchpadEntry[]> {
    const matchingKeys = await this.getKeys(pattern);
    return matchingKeys
      .map(key => this.entries.get(key))
      .filter((entry): entry is InternalEntry => entry !== undefined);
  }

  /**
   * Subscribe to key changes
   */
  subscribe(key: string, callback: (entry: ScratchpadEntry) => void): () => void {
    const subscriptionId = uuidv4();

    const subscription: SubscriptionEntry = {
      id: subscriptionId,
      key,
      agentId: this.metadata.id,
      callback,
    };

    this.subscriptions.set(subscriptionId, subscription);

    let keySet = this.keySubscriptions.get(key);
    if (!keySet) {
      keySet = new Set();
      this.keySubscriptions.set(key, keySet);
    }
    keySet.add(subscriptionId);

    return () => {
      this.subscriptions.delete(subscriptionId);
      keySet?.delete(subscriptionId);
    };
  }

  /**
   * Get scratchpad statistics
   */
  getStats(): ScratchpadStats {
    const totalHits = this.hitCount + this.missCount;
    let totalAge = 0;

    for (const entry of this.entries.values()) {
      totalAge += Date.now() - entry.timestamp.getTime();
    }

    return {
      totalEntries: this.entries.size,
      totalSizeBytes: this.calculateTotalSize(),
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalHits > 0 ? this.hitCount / totalHits : 0,
      expirationCount: this.expirationCount,
      averageEntryAgeMs: this.entries.size > 0 ? totalAge / this.entries.size : 0,
    };
  }

  private async handleWrite(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();

    if (!payload.key) {
      return {
        operationType: ScratchpadOperationType.WRITE,
        duration: Date.now() - startTime,
        errors: ['Key is required'],
      };
    }

    const entry = await this.write(payload.key, payload.value, payload.ttlMs);

    return {
      operationType: ScratchpadOperationType.WRITE,
      key: payload.key,
      entry,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleRead(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();

    if (!payload.key) {
      return {
        operationType: ScratchpadOperationType.READ,
        duration: Date.now() - startTime,
        errors: ['Key is required'],
      };
    }

    const entry = await this.read(payload.key);

    return {
      operationType: ScratchpadOperationType.READ,
      key: payload.key,
      entry: entry ?? undefined,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleDelete(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();

    if (!payload.key) {
      return {
        operationType: ScratchpadOperationType.DELETE,
        duration: Date.now() - startTime,
        errors: ['Key is required'],
      };
    }

    const deleted = await this.delete(payload.key);

    return {
      operationType: ScratchpadOperationType.DELETE,
      key: payload.key,
      deleted,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleClear(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();
    const clearedCount = await this.clear(payload.pattern);

    return {
      operationType: ScratchpadOperationType.CLEAR,
      clearedCount,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleGetKeys(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();
    const keys = await this.getKeys(payload.pattern);

    return {
      operationType: ScratchpadOperationType.GET_KEYS,
      keys,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleGetEntries(payload: ScratchpadTaskPayload): Promise<ScratchpadResult> {
    const startTime = Date.now();
    const entries = await this.getEntries(payload.pattern);

    return {
      operationType: ScratchpadOperationType.GET_ENTRIES,
      entries,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleGetStats(): Promise<ScratchpadResult> {
    const startTime = Date.now();
    const stats = this.getStats();

    return {
      operationType: ScratchpadOperationType.GET_STATS,
      stats,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private notifySubscribers(key: string, entry: ScratchpadEntry): void {
    const subscriptionIds = this.keySubscriptions.get(key);
    if (!subscriptionIds) return;

    for (const subscriptionId of subscriptionIds) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        try {
          subscription.callback(entry);
        } catch (error) {
          this.scratchpadLogger.error(`Subscription callback error: ${(error as Error).message}`);
        }
      }
    }
  }

  private evictOldestEntry(): void {
    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, entry] of this.entries) {
      if (entry.lastAccessedAt < oldestTime) {
        oldestTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.entries.delete(oldestKey);
    }
  }

  private calculateTotalSize(): number {
    let totalSize = 0;
    for (const [key, entry] of this.entries) {
      totalSize += key.length * 2;
      totalSize += JSON.stringify(entry.value).length * 2;
    }
    return totalSize;
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
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.entries.delete(key);
        this.expirationCount++;
      }
    }
  }

  private subscribeToEvents(): void {
    this.eventBus.subscribe(this.metadata.id, AgentEventType.SCRATCHPAD_WRITE, async event => {
      await this.handleEvent(event);
    });

    this.eventBus.subscribe(this.metadata.id, AgentEventType.SCRATCHPAD_READ, async event => {
      await this.handleEvent(event);
    });

    this.eventBus.subscribe(this.metadata.id, AgentEventType.SCRATCHPAD_CLEAR, async event => {
      await this.handleEvent(event);
    });
  }

  public getEntryCount(): number {
    return this.entries.size;
  }

  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}
