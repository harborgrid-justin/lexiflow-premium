"use client";

/**
 * Storage Adapter Interfaces
 * Browser-agnostic storage abstractions for service layer portability
 *
 * Next.js 16: Client-only (uses window.localStorage, SSR adapter available for server)
 *
 * @module services/infrastructure/adapters/StorageAdapter
 * @description Provides storage interfaces that services can depend on
 * without direct browser API coupling. Enables:
 * - Server-side rendering (SSR)
 * - Web worker execution
 * - Unit testing with mock storage
 * - Future migration to different storage backends
 *
 * @architecture
 * - Pattern: Adapter + Interface Segregation
 * - Implementations: LocalStorageAdapter, MemoryStorageAdapter, SSRStorageAdapter
 * - Injection: Services receive IStorageAdapter via constructor
 *
 * @usage
 * ```typescript
 * // In service
 * export class ApiConfigService {
 *   constructor(private readonly storage: IStorageAdapter) {}
 *
 *   isBackendEnabled(): boolean {
 *     return this.storage.getItem('VITE_USE_BACKEND_API') !== 'false';
 *   }
 * }
 *
 * // In app initialization
 * const storage = new LocalStorageAdapter();
 * const apiConfig = new ApiConfigService(storage);
 * ```
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Storage adapter interface for key-value storage operations
 * Abstracts localStorage, sessionStorage, or any other storage mechanism
 */
export interface IStorageAdapter {
  /**
   * Get value by key
   * @returns Value if exists, null otherwise
   */
  getItem(key: string): string | null;

  /**
   * Set key-value pair
   * @throws StorageQuotaExceededError if storage is full
   */
  setItem(key: string, value: string): void;

  /**
   * Remove item by key
   * No-op if key doesn't exist
   */
  removeItem(key: string): void;

  /**
   * Clear all storage
   * Use with caution - affects all keys
   */
  clear(): void;

  /**
   * Get all keys in storage
   * @returns Array of keys (empty if no keys)
   */
  keys(): string[];

  /**
   * Check if key exists
   */
  hasKey(key: string): boolean;

  /**
   * Get number of items in storage
   */
  length(): number;
}

// ============================================================================
// BROWSER IMPLEMENTATION
// ============================================================================

/**
 * LocalStorage adapter implementation
 * Uses browser's localStorage API when available
 * Falls back to memory storage in non-browser environments
 */
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly isAvailable: boolean;
  private readonly fallback: Map<string, string>;

  constructor() {
    this.isAvailable = this.checkAvailability();
    this.fallback = new Map();
  }

  /**
   * Check if localStorage is available
   * @private
   */
  private checkAvailability(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      // Test write/read/delete
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      return localStorage.getItem(key);
    }
    return this.fallback.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        if (err instanceof DOMException && err.name === "QuotaExceededError") {
          throw new StorageQuotaExceededError(key);
        }
        throw err;
      }
    } else {
      this.fallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      localStorage.removeItem(key);
    } else {
      this.fallback.delete(key);
    }
  }

  clear(): void {
    if (this.isAvailable) {
      localStorage.clear();
    } else {
      this.fallback.clear();
    }
  }

  keys(): string[] {
    if (this.isAvailable) {
      return Object.keys(localStorage);
    }
    return Array.from(this.fallback.keys());
  }

  hasKey(key: string): boolean {
    return this.getItem(key) !== null;
  }

  length(): number {
    if (this.isAvailable) {
      return localStorage.length;
    }
    return this.fallback.size;
  }
}

// ============================================================================
// SESSION STORAGE IMPLEMENTATION
// ============================================================================

/**
 * SessionStorage adapter implementation
 * Uses browser's sessionStorage API (cleared on tab close)
 */
export class SessionStorageAdapter implements IStorageAdapter {
  private readonly isAvailable: boolean;
  private readonly fallback: Map<string, string>;

  constructor() {
    this.isAvailable = this.checkAvailability();
    this.fallback = new Map();
  }

  private checkAvailability(): boolean {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return false;
      }
      const testKey = "__session_test__";
      window.sessionStorage.setItem(testKey, "test");
      window.sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      return sessionStorage.getItem(key);
    }
    return this.fallback.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      sessionStorage.setItem(key, value);
    } else {
      this.fallback.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      sessionStorage.removeItem(key);
    } else {
      this.fallback.delete(key);
    }
  }

  clear(): void {
    if (this.isAvailable) {
      sessionStorage.clear();
    } else {
      this.fallback.clear();
    }
  }

  keys(): string[] {
    if (this.isAvailable) {
      return Object.keys(sessionStorage);
    }
    return Array.from(this.fallback.keys());
  }

  hasKey(key: string): boolean {
    return this.getItem(key) !== null;
  }

  length(): number {
    if (this.isAvailable) {
      return sessionStorage.length;
    }
    return this.fallback.size;
  }
}

// ============================================================================
// MEMORY IMPLEMENTATION (Testing)
// ============================================================================

/**
 * In-memory storage adapter for testing
 * No browser dependencies, purely in-memory Map
 */
export class MemoryStorageAdapter implements IStorageAdapter {
  private readonly storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  keys(): string[] {
    return Array.from(this.storage.keys());
  }

  hasKey(key: string): boolean {
    return this.storage.has(key);
  }

  length(): number {
    return this.storage.size;
  }
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

/**
 * Thrown when storage quota is exceeded
 */
export class StorageQuotaExceededError extends Error {
  constructor(key: string) {
    super(`Storage quota exceeded when setting key: ${key}`);
    this.name = "StorageQuotaExceededError";
  }
}

// ============================================================================
// SINGLETON INSTANCES (Convenience)
// ============================================================================

/**
 * Default localStorage adapter instance
 * Use this for most cases unless you need dependency injection
 */
export const defaultStorage: IStorageAdapter = new LocalStorageAdapter();

/**
 * Default sessionStorage adapter instance
 */
export const defaultSessionStorage: IStorageAdapter =
  new SessionStorageAdapter();
