
/**
 * LocalStorage utility constants and helpers
 *
 * Provides a safe, type-safe interface for localStorage operations
 * with error handling and fallbacks.
 */

export const STORAGE_KEYS = {
    RULES: 'lexiflow_rules',
    USER_PREFS: 'lexiflow_user_prefs',
    RECENT_FILES: 'lexiflow_recent_files',
    DRAFTS: 'lexiflow_drafts',
    THEME: 'lexiflow_theme',
    WINDOW_STATE: 'lexiflow_window_state',
    SYNC_STATE: 'lexiflow_sync_state',
    AUTH_TOKEN: 'lexiflow_auth_token',
    USER_SESSION: 'lexiflow_user_session'
};

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Safe localStorage wrapper with type safety and error handling
 */
export const StorageUtils = {
  /**
   * Get a value from localStorage with type safety
   *
   * @param key - Storage key
   * @param defaultData - Default value if key doesn't exist or parse fails
   * @returns Parsed value or default
   */
  get: <T>(key: string, defaultData: T): T => {
    try {
      if (!isStorageAvailable()) return defaultData;
      const item = window.localStorage.getItem(key);
      if (!item) return defaultData;

      try {
          return JSON.parse(item) as T;
      } catch (e) {
          console.error(`Storage format error for ${key}`, e);
          return defaultData;
      }
    } catch (error) {
      console.error(`Error reading ${key} from storage`, error);
      return defaultData;
    }
  },

  /**
   * Get a raw string value from localStorage (no JSON parsing)
   *
   * @param key - Storage key
   * @param defaultValue - Default value if key doesn't exist
   * @returns String value or default
   */
  getString: (key: string, defaultValue: string = ''): string => {
    try {
      if (!isStorageAvailable()) return defaultValue;
      return window.localStorage.getItem(key) ?? defaultValue;
    } catch (error) {
      console.error(`Error reading string ${key} from storage`, error);
      return defaultValue;
    }
  },

  /**
   * Set a value in localStorage with JSON serialization
   *
   * @param key - Storage key
   * @param value - Value to store
   * @returns Success boolean
   */
  set: <T>(key: string, value: T): boolean => {
    try {
      if (!isStorageAvailable()) return false;
      const stringified = JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
      return true;
    } catch (error) {
      console.error(`Error saving ${key} to storage`, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded. Consider clearing old data.');
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
   */
  setString: (key: string, value: string): boolean => {
    try {
      if (!isStorageAvailable()) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error saving string ${key} to storage`, error);
      return false;
    }
  },

  /**
   * Remove a specific key from localStorage
   *
   * @param key - Storage key to remove
   */
  remove: (key: string): void => {
    try {
      if (!isStorageAvailable()) return;
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage`, error);
    }
  },

  /**
   * Check if a key exists in localStorage
   *
   * @param key - Storage key to check
   * @returns True if key exists
   */
  has: (key: string): boolean => {
    try {
      if (!isStorageAvailable()) return false;
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking ${key} in storage`, error);
      return false;
    }
  },

  /**
   * Clear all LexiFlow-specific keys from localStorage
   */
  clearAll: (): void => {
    try {
      if (!isStorageAvailable()) return;
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('lexiflow_')) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  },

  /**
   * Get all LexiFlow keys from localStorage
   *
   * @returns Array of storage keys
   */
  getAllKeys: (): string[] => {
    try {
      if (!isStorageAvailable()) return [];
      return Object.keys(window.localStorage).filter(key =>
        key.startsWith('lexiflow_')
      );
    } catch (error) {
      console.error('Error getting storage keys', error);
      return [];
    }
  },

  /**
   * Get the total size of localStorage in bytes (approximate)
   *
   * @returns Size in bytes
   */
  getSize: (): number => {
    try {
      if (!isStorageAvailable()) return 0;
      let size = 0;
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          const item = window.localStorage.getItem(key);
          if (item) {
            size += key.length + item.length;
          }
        }
      }
      return size;
    } catch (error) {
      console.error('Error calculating storage size', error);
      return 0;
    }
  }
};

/**
 * Direct localStorage wrappers (for backwards compatibility)
 * Use StorageUtils for better error handling
 */
export const getItem = (key: string): string | null => {
  try {
    if (!isStorageAvailable()) return null;
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting item ${key}`, error);
    return null;
  }
};

export const setItem = (key: string, value: string): boolean => {
  try {
    if (!isStorageAvailable()) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key}`, error);
    return false;
  }
};

export const removeItem = (key: string): void => {
  try {
    if (!isStorageAvailable()) return;
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item ${key}`, error);
  }
};
