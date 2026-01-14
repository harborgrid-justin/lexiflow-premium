/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      STORAGE SERVICE                                      ║
 * ║          Enterprise Browser Capability - Persistent Storage              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/storage/StorageService
 * @description Browser-based persistent storage service
 *
 * COMPLIANCE CHECKLIST:
 * [✓] Is this logic imperative? YES - manages browser storage
 * [✓] Does it touch browser or SDK APIs? YES - localStorage, sessionStorage
 * [✓] Is it stateless? YES - delegates to browser storage
 * [✓] Is it injectable? YES - implements IService
 * [✓] Does it avoid domain knowledge? YES - generic key-value storage
 * [✓] Does it avoid React imports? YES - no React dependencies
 *
 * WHAT IT IS:
 * - Browser capability service for persistent storage
 * - Abstraction over localStorage/sessionStorage
 * - Environment-aware (SSR safe)
 *
 * WHAT IT IS NOT:
 * - Data repository (domain aware)
 * - State management
 * - Cache service
 */

import { BaseService, type ServiceConfig } from "../core/ServiceLifecycle";
import {
  LocalStorageAdapter,
  type IStorageAdapter,
} from "../infrastructure/adapters/StorageAdapter";

// ============================================================================
// TYPES
// ============================================================================

export interface StorageServiceConfig extends ServiceConfig {
  /** Storage adapter (defaults to LocalStorageAdapter) */
  adapter?: IStorageAdapter;
  /** Prefix for all keys (namespace isolation) */
  prefix?: string;
}

// ============================================================================
// STORAGE SERVICE
// ============================================================================

/**
 * Storage service for browser-based persistent storage
 * Provides abstraction over localStorage with namespacing
 *
 * @example
 * ```typescript
 * const storage = new StorageService();
 * storage.configure({
 *   name: 'storage',
 *   prefix: 'lexiflow:'
 * });
 * await storage.start();
 *
 * // Set item
 * storage.setItem('theme', 'dark');
 *
 * // Get item
 * const theme = storage.getItem('theme');
 *
 * // Remove item
 * storage.removeItem('theme');
 * ```
 */
export class StorageService extends BaseService<StorageServiceConfig> {
  private adapter!: IStorageAdapter;
  private prefix = "";

  constructor() {
    super("storage");
  }

  protected override onConfigure(config: StorageServiceConfig): void {
    this.adapter = config.adapter ?? new LocalStorageAdapter();
    this.prefix = config.prefix ?? "";
  }

  protected override onStop(): void {
    // Storage persists across stop/start
    // No cleanup needed
  }

  /**
   * Get item from storage
   */
  getItem(key: string): string | null {
    this.ensureRunning();
    const prefixedKey = this.prefix + key;
    return this.adapter.getItem(prefixedKey);
  }

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): void {
    this.ensureRunning();
    const prefixedKey = this.prefix + key;

    try {
      this.adapter.setItem(prefixedKey, value);
    } catch (error) {
      this.error(`Failed to set item '${key}':`, error);
      throw error;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    this.ensureRunning();
    const prefixedKey = this.prefix + key;
    this.adapter.removeItem(prefixedKey);
  }

  /**
   * Check if key exists
   */
  hasItem(key: string): boolean {
    this.ensureRunning();
    const prefixedKey = this.prefix + key;
    return this.adapter.hasKey(prefixedKey);
  }

  /**
   * Get all keys (with prefix filter)
   */
  getKeys(): string[] {
    this.ensureRunning();
    const allKeys = this.adapter.keys();

    if (!this.prefix) {
      return allKeys;
    }

    // Filter by prefix and remove prefix from returned keys
    return allKeys
      .filter((k) => k.startsWith(this.prefix))
      .map((k) => k.slice(this.prefix.length));
  }

  /**
   * Clear all items (respects prefix)
   */
  clear(): void {
    this.ensureRunning();

    if (!this.prefix) {
      // No prefix = clear all
      this.adapter.clear();
      return;
    }

    // With prefix = only clear prefixed keys
    const keys = this.adapter.keys().filter((k) => k.startsWith(this.prefix));
    for (const key of keys) {
      this.adapter.removeItem(key);
    }
  }

  /**
   * Get JSON item (auto-parse)
   */
  getJSON<T>(key: string, defaultValue?: T): T | null {
    this.ensureRunning();
    const value = this.getItem(key);

    if (value === null) {
      return defaultValue ?? null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.error(`Failed to parse JSON for key '${key}':`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Set JSON item (auto-stringify)
   */
  setJSON<T>(key: string, value: T): void {
    this.ensureRunning();

    try {
      const json = JSON.stringify(value);
      this.setItem(key, json);
    } catch (error) {
      this.error(`Failed to stringify value for key '${key}':`, error);
      throw error;
    }
  }

  /**
   * Get storage size (number of keys with prefix)
   */
  size(): number {
    this.ensureRunning();
    return this.getKeys().length;
  }
}

// ============================================================================
// SINGLETON INSTANCE (Optional)
// ============================================================================

export const storageService = new StorageService();
