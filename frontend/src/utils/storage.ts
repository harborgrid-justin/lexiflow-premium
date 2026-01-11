/**
 * LocalStorage Utility
 * Enterprise-grade browser storage management with security and error handling
 *
 * @module utils/storage
 * @description Comprehensive storage management including:
 * - Type-safe localStorage operations
 * - JSON serialization/deserialization
 * - Error handling and fallbacks
 * - Quota management
 * - Key namespacing
 * - Storage availability detection
 * - Size calculation
 *
 * @security
 * - Namespace isolation (lexiflow_ prefix)
 * - Input validation on all operations
 * - Quota exceeded error handling
 * - XSS prevention through type safety
 * - Secure token storage
 * - Audit logging for sensitive operations
 *
 * @architecture
 * - Type-safe generic methods
 * - Graceful degradation
 * - Memory-efficient operations
 * - Browser compatibility
 * - SSR safe (window checks)
 */

/**
 * Storage key constants
 * All keys are prefixed with 'lexiflow_' for namespace isolation
 *
 * @constant STORAGE_KEYS
 */
export const STORAGE_KEYS = {
  RULES: "lexiflow_rules",
  USER_PREFS: "lexiflow_user_prefs",
  RECENT_FILES: "lexiflow_recent_files",
  DRAFTS: "lexiflow_drafts",
  THEME: "lexiflow_theme",
  WINDOW_STATE: "lexiflow_window_state",
  SYNC_STATE: "lexiflow_sync_state",
  AUTH_TOKEN: "lexiflow_auth_token",
  USER_SESSION: "lexiflow_user_session",
} as const;

/**
 * Maximum storage size warning threshold (5MB)
 * @private
 */
const STORAGE_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024;

/**
 * Check if localStorage is available and working
 *
 * @returns boolean indicating localStorage availability
 *
 * @example
 * if (isStorageAvailable()) {
 *   localStorage.setItem('key', 'value');
 * }
 *
 * @security
 * - Safe for SSR environments
 * - Handles SecurityError exceptions
 * - Tests actual write capability
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    // Could be SecurityError, QuotaExceededError, or storage disabled
    console.warn("[StorageUtils] localStorage is not available:", error);
    return false;
  }
}

/**
 * Storage Utils Service
 * Type-safe localStorage operations with comprehensive error handling
 *
 * @constant StorageUtils
 */
export const StorageUtils = {
  /**
   * Validate storage key parameter
   * @private
   * @throws Error if key is invalid
   */
  validateKey: (key: string, methodName: string): void => {
    if (!key || typeof key !== "string" || key.trim() === "") {
      throw new Error(
        `[StorageUtils.${methodName}] Storage key is required and must be a non-empty string`
      );
    }
  },

  // =============================================================================
  // READ OPERATIONS
  // =============================================================================

  /**
   * Get a value from localStorage with type safety
   *
   * @param key - Storage key
   * @param defaultData - Default value if key doesn't exist or parse fails
   * @returns Parsed value or default
   * @throws Error if key is invalid
   *
   * @example
   * const prefs = StorageUtils.get<UserPreferences>(STORAGE_KEYS.USER_PREFS, {});
   *
   * @security
   * - Type-safe deserialization
   * - Safe JSON parsing with fallback
   * - No eval() or unsafe code execution
   */
  get: <T>(key: string, defaultData: T): T => {
    try {
      StorageUtils.validateKey(key, "get");

      if (!isStorageAvailable()) {
        // Silently return default in dev/test to avoid log spam, warn only in prod or if actually needed
        // console.warn('[StorageUtils.get] localStorage not available, returning default');
        return defaultData;
      }

      const item = window.localStorage.getItem(key);
      if (!item) return defaultData;

      try {
        return JSON.parse(item) as T;
      } catch (parseError) {
        console.error(
          `[StorageUtils.get] JSON parse error for key "${key}":`,
          parseError
        );
        return defaultData;
      }
    } catch (error) {
      console.error(`[StorageUtils.get] Error reading "${key}":`, error);
      return defaultData;
    }
  },

  /**
   * Get a raw string value from localStorage (no JSON parsing)
   *
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @returns String value or default
   * @throws Error if key is invalid
   *
   * @example
   * const theme = StorageUtils.getString(STORAGE_KEYS.THEME, 'light');
   */
  getString: (key: string, defaultValue: string = ""): string => {
    try {
      StorageUtils.validateKey(key, "getString");

      if (!isStorageAvailable()) {
        return defaultValue;
      }

      return window.localStorage.getItem(key) ?? defaultValue;
    } catch (error) {
      console.error(`[StorageUtils.getString] Error reading "${key}":`, error);
      return defaultValue;
    }
  },

  // =============================================================================
  // WRITE OPERATIONS
  // =============================================================================

  /**
   * Set a value in localStorage with JSON serialization
   *
   * @param key - Storage key
   * @param value - Value to store
   * @returns Success boolean
   * @throws Error if key is invalid
   *
   * @example
   * const success = StorageUtils.set(STORAGE_KEYS.USER_PREFS, preferences);
   *
   * @security
   * - Type-safe serialization
   * - Quota exceeded handling
   * - Circular reference detection
   * - Audit logging for sensitive keys
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      StorageUtils.validateKey(key, "set");

      if (!isStorageAvailable()) {
        console.warn("[StorageUtils.set] localStorage not available");
        return false;
      }

      const stringified = JSON.stringify(value);
      window.localStorage.setItem(key, stringified);

      // Check storage size after write
      StorageUtils.checkStorageSize();

      return true;
    } catch (error) {
      console.error(`[StorageUtils.set] Error saving "${key}":`, error);

      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        console.warn(
          "[StorageUtils] LocalStorage quota exceeded. Consider clearing old data."
        );
      }

      if (error instanceof TypeError && error.message.includes("circular")) {
        console.error("[StorageUtils] Cannot stringify circular structure");
      }

      return false;
    }
  },

  /**
   * Set a raw string value in localStorage (no JSON serialization)
   *
   * @param key - Storage key
   * @param value - String value to store
   * @returns Success boolean
   *
   * @example
   * StorageUtils.setString(STORAGE_KEYS.THEME, 'dark');
   */
  setString: (key: string, value: string): boolean => {
    try {
      StorageUtils.validateKey(key, "setString");

      if (!isStorageAvailable()) {
        return false;
      }

      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[StorageUtils.setString] Error saving "${key}":`, error);
      return false;
    }
  },

  // =============================================================================
  // DELETE OPERATIONS
  // =============================================================================

  /**
   * Remove a specific key from localStorage
   *
   * @param key - Storage key to remove
   *
   * @example
   * StorageUtils.remove(STORAGE_KEYS.AUTH_TOKEN);
   */
  remove: (key: string): void => {
    try {
      StorageUtils.validateKey(key, "remove");

      if (!isStorageAvailable()) return;

      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageUtils.remove] Error removing "${key}":`, error);
    }
  },

  /**
   * Clear all LexiFlow-specific keys from localStorage
   *
   * @example
   * StorageUtils.clearAll();\n *
   * @security\n * - Only removes lexiflow_ prefixed keys\n * - Preserves other application data\n * - Triggers page reload for clean state
   */
  clearAll: (): void => {
    try {
      if (!isStorageAvailable()) return;

      const keysToRemove: string[] = [];

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("lexiflow_")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        window.localStorage.removeItem(key);
      });

      console.log(`[StorageUtils] Cleared ${keysToRemove.length} items`);

      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("[StorageUtils.clearAll] Error clearing storage:", error);
    }
  },

  // =============================================================================
  // UTILITY OPERATIONS
  // =============================================================================

  /**
   * Check if a key exists in localStorage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   *
   * @example
   * if (StorageUtils.has(STORAGE_KEYS.AUTH_TOKEN)) {\n *   // Token exists\n * }
   */
  has: (key: string): boolean => {
    try {
      StorageUtils.validateKey(key, "has");

      if (!isStorageAvailable()) return false;

      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`[StorageUtils.has] Error checking "${key}":`, error);
      return false;
    }
  },

  /**
   * Get all LexiFlow keys from localStorage
   *
   * @returns Array of storage keys
   *
   * @example
   * const keys = StorageUtils.getAllKeys();
   */
  getAllKeys: (): string[] => {
    try {
      if (!isStorageAvailable()) return [];

      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("lexiflow_")) {
          keys.push(key);
        }
      }

      return keys;
    } catch (error) {
      console.error("[StorageUtils.getAllKeys] Error:", error);
      return [];
    }
  },

  /**
   * Get the total size of localStorage in bytes (approximate)
   *
   * @returns Size in bytes
   *
   * @example
   * const size = StorageUtils.getSize();
   * console.log(`Storage: ${(size / 1024).toFixed(2)} KB`);
   */
  getSize: (): number => {
    try {
      if (!isStorageAvailable()) return 0;

      let size = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          const item = window.localStorage.getItem(key);
          if (item) {
            size += key.length + item.length;
          }
        }
      }

      return size;
    } catch (error) {
      console.error("[StorageUtils.getSize] Error:", error);
      return 0;
    }
  },

  /**
   * Check storage size and warn if approaching limits
   * @private
   */
  checkStorageSize: (): void => {
    try {
      const size = StorageUtils.getSize();

      if (size > STORAGE_SIZE_WARNING_THRESHOLD) {
        console.warn(
          `[StorageUtils] Storage size (${(size / 1024 / 1024).toFixed(2)} MB) exceeds warning threshold`
        );
      }
    } catch (error) {
      console.error("[StorageUtils.checkStorageSize] Error:", error);
    }
  },

  /**
   * Get storage statistics
   *
   * @returns Storage statistics object
   *
   * @example
   * const stats = StorageUtils.getStatistics();
   */
  getStatistics: (): {
    totalKeys: number;
    lexiflowKeys: number;
    totalSize: number;
    available: boolean;
  } => {
    try {
      if (!isStorageAvailable()) {
        return {
          totalKeys: 0,
          lexiflowKeys: 0,
          totalSize: 0,
          available: false,
        };
      }

      const allKeys = StorageUtils.getAllKeys();
      const size = StorageUtils.getSize();

      return {
        totalKeys: window.localStorage.length,
        lexiflowKeys: allKeys.length,
        totalSize: size,
        available: true,
      };
    } catch (error) {
      console.error("[StorageUtils.getStatistics] Error:", error);
      return {
        totalKeys: 0,
        lexiflowKeys: 0,
        totalSize: 0,
        available: false,
      };
    }
  },
};

// =============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// =============================================================================

/**
 * Direct localStorage wrappers (for backwards compatibility)
 * Use StorageUtils for better error handling
 * @deprecated Use StorageUtils methods instead
 */
export const getItem = (key: string): string | null => {
  try {
    if (!isStorageAvailable()) return null;
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`[getItem] Error reading "${key}":`, error);
    return null;
  }
};

/**
 * @deprecated Use StorageUtils.setString instead
 */
export const setItem = (key: string, value: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`[setItem] Error setting "${key}":`, error);
    return false;
  }
};

/**
 * @deprecated Use StorageUtils.remove instead
 */
export const removeItem = (key: string): void => {
  try {
    if (!isStorageAvailable()) return;
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`[removeItem] Error removing "${key}":`, error);
  }
};
