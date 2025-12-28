/**
 * Data Scratchpad Manager
 *
 * Shared state management for data handling agents with TTL support.
 *
 * @module DataScratchpadManager
 * @version 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { DataScratchpadEntry } from '../interfaces/data-agent.interfaces';

@Injectable()
export class DataScratchpadManager {
  private readonly logger = new Logger(DataScratchpadManager.name);
  private readonly entries = new Map<string, DataScratchpadEntry>();
  private readonly subscribers = new Map<string, Set<(entry: DataScratchpadEntry) => void>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Every minute
  }

  private cleanupExpired(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.entries.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired scratchpad entries`);
    }
  }

  write(
    key: string,
    value: unknown,
    agentId: string,
    options?: { ttlMs?: number; tags?: string[] },
  ): void {
    const entry: DataScratchpadEntry = {
      key,
      value,
      agentId,
      createdAt: new Date(),
      expiresAt: options?.ttlMs
        ? new Date(Date.now() + options.ttlMs)
        : undefined,
      tags: options?.tags,
    };

    this.entries.set(key, entry);

    // Notify subscribers
    const handlers = this.subscribers.get(key) || new Set();
    for (const handler of handlers) {
      try {
        handler(entry);
      } catch (error) {
        this.logger.error(`Error notifying subscriber: ${error}`);
      }
    }

    this.logger.debug(`Scratchpad write: ${key} by ${agentId}`);
  }

  read(key: string): unknown | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  readEntry(key: string): DataScratchpadEntry | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry;
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  subscribe(key: string, handler: (entry: DataScratchpadEntry) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(handler);

    return () => {
      this.subscribers.get(key)?.delete(handler);
    };
  }

  getByAgent(agentId: string): DataScratchpadEntry[] {
    return Array.from(this.entries.values()).filter(e => e.agentId === agentId);
  }

  getByTag(tag: string): DataScratchpadEntry[] {
    return Array.from(this.entries.values()).filter(e => e.tags?.includes(tag));
  }

  getAllKeys(): string[] {
    return Array.from(this.entries.keys());
  }

  clear(): void {
    this.entries.clear();
    this.logger.log('Scratchpad cleared');
  }

  getStats(): { totalEntries: number; byAgent: Record<string, number> } {
    const byAgent: Record<string, number> = {};

    for (const entry of this.entries.values()) {
      byAgent[entry.agentId] = (byAgent[entry.agentId] || 0) + 1;
    }

    return {
      totalEntries: this.entries.size,
      byAgent,
    };
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
