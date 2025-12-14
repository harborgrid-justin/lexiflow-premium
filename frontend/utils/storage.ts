
export const STORAGE_KEYS = {
    RULES: 'lexiflow_rules',
    USER_PREFS: 'lexiflow_user_prefs',
    RECENT_FILES: 'lexiflow_recent_files',
    DRAFTS: 'lexiflow_drafts'
};

export const StorageUtils = {
  get: <T>(key: string, defaultData: T): T => {
    try {
      if (typeof window === 'undefined') return defaultData;
      const item = window.localStorage.getItem(key);
      if (!item) return defaultData;

      try {
          return JSON.parse(item);
      } catch (e) {
          console.error(`Storage format error for ${key}`, e);
          return defaultData;
      }
    } catch (error) {
      console.error(`Error reading ${key} from storage`, error);
      return defaultData;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return;
      const stringified = JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
    } catch (error) {
      console.error(`Error saving ${key} to storage`, error);
    }
  },

  clearAll: (): void => {
    try {
      if (typeof window === 'undefined') return;
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('lexiflow_')) {
          window.localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
};
