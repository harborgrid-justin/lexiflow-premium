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
      // Handle quota exceeded errors
      this.error("Failed to set item", key, error);
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
   * Check if item exists
   */
  hasItem(key: string): boolean {
    this.ensureRunning();
    const prefixedKey = this.prefix + key;
    return this.adapter.getItem(prefixedKey) !== null;
  }

  /**
   * Get all keys with current prefix
   * Only returns keys matching this service's prefix
   */
  getKeys(): string[] {
    this.ensureRunning();
    const allKeys = this.adapter.keys();

    if (!this.prefix) {
      return allKeys;
    }

    return allKeys
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.slice(this.prefix.length));
  }

  /**
   * Clear all items with current prefix
   * If no prefix, clears all storage (dangerous!)
   */
  clear(): void {
    this.ensureRunning();

    if (!this.prefix) {
      // No prefix - clear all (DANGEROUS)
      this.log("Clearing ALL storage (no prefix)");
      this.adapter.clear();
      return;
    }

    // Clear only prefixed items
    const keys = this.adapter.keys().filter((key) => key.startsWith(this.prefix));
    keys.forEach((key) => this.adapter.removeItem(key));
    this.log(`Cleared ${keys.length} items with prefix '${this.prefix}'`);
  }

  /**
   * Get storage size (approximate)
   * Returns total bytes used by all keys with current prefix
   */
  getSize(): number {
    this.ensureRunning();
    const keys = this.getKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = this.getItem(key);
      if (value !== null) {
        // Approximate: key + value + overhead
        totalSize += key.length + value.length;
      }
    }

    return totalSize;
  }
}

/**
 * Browser storage service alias for enterprise naming
 */
export class BrowserStorageService extends StorageService {}

/**
 * Storage options type alias
 */
export type StorageOptions = StorageServiceConfig;

