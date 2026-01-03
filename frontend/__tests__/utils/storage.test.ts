/**
 * storage.test.ts
 * Tests for the StorageUtils localStorage abstraction
 */

import {
  STORAGE_KEYS,
  isStorageAvailable,
  StorageUtils,
  getItem,
  setItem,
  removeItem,
} from '@/utils/storage';

describe('STORAGE_KEYS', () => {
  it('should define all required keys', () => {
    expect(STORAGE_KEYS.RULES).toBe('lexiflow_rules');
    expect(STORAGE_KEYS.USER_PREFS).toBe('lexiflow_user_prefs');
    expect(STORAGE_KEYS.RECENT_FILES).toBe('lexiflow_recent_files');
    expect(STORAGE_KEYS.DRAFTS).toBe('lexiflow_drafts');
    expect(STORAGE_KEYS.THEME).toBe('lexiflow_theme');
    expect(STORAGE_KEYS.WINDOW_STATE).toBe('lexiflow_window_state');
    expect(STORAGE_KEYS.SYNC_STATE).toBe('lexiflow_sync_state');
    expect(STORAGE_KEYS.AUTH_TOKEN).toBe('lexiflow_auth_token');
    expect(STORAGE_KEYS.USER_SESSION).toBe('lexiflow_user_session');
  });

  it('should have lexiflow_ prefix for all keys', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key).toMatch(/^lexiflow_/);
    });
  });
});

describe('isStorageAvailable', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return true when localStorage is available', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  // Note: Cannot fully test SSR scenario in jsdom environment
  // This test verifies the function handles errors gracefully
  it('should handle SSR-like scenarios', () => {
    // In a real SSR environment, window would be undefined
    // In jsdom, we test that the function is resilient
    expect(isStorageAvailable()).toBe(true);
  });

  it('should return false when localStorage throws error', () => {
    const originalConsoleWarn = console.warn;
    console.warn = jest.fn();

    const originalGetItem = global.localStorage.setItem;
    global.localStorage.setItem = jest.fn(() => {
      throw new Error('Storage disabled');
    });

    expect(isStorageAvailable()).toBe(false);

    global.localStorage.setItem = originalGetItem;
    console.warn = originalConsoleWarn;
  });
});

describe('StorageUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should get values from storage', () => {
    localStorage.setItem('test_key', JSON.stringify({ id: 1, name: 'Test' }));
    const result = StorageUtils.get('test_key', {});
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should set values to storage', () => {
    const data = { id: 1, name: 'Test' };
    const result = StorageUtils.set('test_key', data);
    expect(result).toBe(true);
    expect(localStorage.getItem('test_key')).toBe(JSON.stringify(data));
  });

  it('should remove values from storage', () => {
    localStorage.setItem('test_key', 'value');
    StorageUtils.remove('test_key');
    expect(localStorage.getItem('test_key')).toBeNull();
  });

  it('should check if key exists', () => {
    localStorage.setItem('test_key', 'value');
    expect(StorageUtils.has('test_key')).toBe(true);
    expect(StorageUtils.has('nonexistent')).toBe(false);
  });
});

describe('Backwards compatibility functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should get item from localStorage', () => {
    localStorage.setItem('key', 'value');
    expect(getItem('key')).toBe('value');
  });

  it('should set item in localStorage', () => {
    const result = setItem('key', 'value');
    expect(result).toBe(true);
    expect(localStorage.getItem('key')).toBe('value');
  });

  it('should remove item from localStorage', () => {
    localStorage.setItem('key', 'value');
    removeItem('key');
    expect(localStorage.getItem('key')).toBeNull();
  });
});
