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
} from '../../utils/storage';

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

  it('should return false when window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(isStorageAvailable()).toBe(false);

    global.window = originalWindow;
  });

  it('should return false when localStorage throws error', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(isStorageAvailable()).toBe(false);

    setItemSpy.mockRestore();
  });
});

describe('StorageUtils.get', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return default value when key does not exist', () => {
    const result = StorageUtils.get('nonexistent', { default: 'value' });
    expect(result).toEqual({ default: 'value' });
  });

  it('should return default value for empty storage', () => {
    const result = StorageUtils.get('empty', 'default');
    expect(result).toBe('default');
  });

  it('should parse and return stored JSON value', () => {
    localStorage.setItem('test_key', JSON.stringify({ id: 1, name: 'Test' }));

    const result = StorageUtils.get('test_key', {});
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should return stored array', () => {
    localStorage.setItem('array_key', JSON.stringify([1, 2, 3]));

    const result = StorageUtils.get('array_key', []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return default on JSON parse error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    localStorage.setItem('bad_json', 'not valid json{');

    const result = StorageUtils.get('bad_json', 'default');

    expect(result).toBe('default');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Storage format error'),
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = StorageUtils.get('key', 'default');

    expect(result).toBe('default');
    expect(consoleErrorSpy).toHaveBeenCalled();

    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle null stored value', () => {
    localStorage.setItem('null_key', JSON.stringify(null));

    const result = StorageUtils.get('null_key', 'default');
    expect(result).toBeNull();
  });

  it('should handle boolean values', () => {
    localStorage.setItem('bool_key', JSON.stringify(true));

    const result = StorageUtils.get('bool_key', false);
    expect(result).toBe(true);
  });

  it('should handle number values', () => {
    localStorage.setItem('number_key', JSON.stringify(42));

    const result = StorageUtils.get('number_key', 0);
    expect(result).toBe(42);
  });
});

describe('StorageUtils.getString', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return stored string value', () => {
    localStorage.setItem('string_key', 'test value');

    const result = StorageUtils.getString('string_key');
    expect(result).toBe('test value');
  });

  it('should return default value when key does not exist', () => {
    const result = StorageUtils.getString('nonexistent', 'default');
    expect(result).toBe('default');
  });

  it('should return empty string as default when not specified', () => {
    const result = StorageUtils.getString('nonexistent');
    expect(result).toBe('');
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation(() => {
      throw new Error('Error');
    });

    const result = StorageUtils.getString('key', 'default');

    expect(result).toBe('default');
    expect(consoleErrorSpy).toHaveBeenCalled();

    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.set', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store value as JSON string', () => {
    const data = { id: 1, name: 'Test' };
    const result = StorageUtils.set('test_key', data);

    expect(result).toBe(true);
    expect(localStorage.getItem('test_key')).toBe(JSON.stringify(data));
  });

  it('should store array value', () => {
    const array = [1, 2, 3];
    StorageUtils.set('array_key', array);

    expect(localStorage.getItem('array_key')).toBe(JSON.stringify(array));
  });

  it('should store primitive values', () => {
    StorageUtils.set('string_key', 'value');
    StorageUtils.set('number_key', 42);
    StorageUtils.set('bool_key', true);

    expect(localStorage.getItem('string_key')).toBe('"value"');
    expect(localStorage.getItem('number_key')).toBe('42');
    expect(localStorage.getItem('bool_key')).toBe('true');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = StorageUtils.set('key', 'value');

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle QuotaExceededError', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    setItemSpy.mockImplementation(() => {
      throw quotaError;
    });

    const result = StorageUtils.set('key', 'value');

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('quota exceeded')
    );

    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should return true on successful save', () => {
    const result = StorageUtils.set('key', 'value');
    expect(result).toBe(true);
  });
});

describe('StorageUtils.setString', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store raw string value', () => {
    const result = StorageUtils.setString('key', 'raw value');

    expect(result).toBe(true);
    expect(localStorage.getItem('key')).toBe('raw value');
  });

  it('should not JSON stringify the value', () => {
    StorageUtils.setString('key', 'test');
    expect(localStorage.getItem('key')).toBe('test');
    expect(localStorage.getItem('key')).not.toBe('"test"');
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('Error');
    });

    const result = StorageUtils.setString('key', 'value');

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    setItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.remove', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should remove specific key', () => {
    localStorage.setItem('key1', 'value1');
    localStorage.setItem('key2', 'value2');

    StorageUtils.remove('key1');

    expect(localStorage.getItem('key1')).toBeNull();
    expect(localStorage.getItem('key2')).toBe('value2');
  });

  it('should handle removing non-existent key', () => {
    expect(() => StorageUtils.remove('nonexistent')).not.toThrow();
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    removeItemSpy.mockImplementation(() => {
      throw new Error('Error');
    });

    expect(() => StorageUtils.remove('key')).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();

    removeItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.has', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return true for existing key', () => {
    localStorage.setItem('existing', 'value');
    expect(StorageUtils.has('existing')).toBe(true);
  });

  it('should return false for non-existent key', () => {
    expect(StorageUtils.has('nonexistent')).toBe(false);
  });

  it('should return false on error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation(() => {
      throw new Error('Error');
    });

    expect(StorageUtils.has('key')).toBe(false);

    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.clearAll', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should remove all lexiflow prefixed keys', () => {
    localStorage.setItem('lexiflow_key1', 'value1');
    localStorage.setItem('lexiflow_key2', 'value2');
    localStorage.setItem('other_key', 'value3');

    // Mock window.location.reload to prevent actual reload
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    StorageUtils.clearAll();

    expect(localStorage.getItem('lexiflow_key1')).toBeNull();
    expect(localStorage.getItem('lexiflow_key2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('value3');
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock Object.keys to throw an error
    const originalKeys = Object.keys;
    Object.keys = jest.fn(() => {
      throw new Error('Error');
    });

    expect(() => StorageUtils.clearAll()).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();

    Object.keys = originalKeys;
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.getAllKeys', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return all lexiflow keys', () => {
    localStorage.setItem('lexiflow_key1', 'value1');
    localStorage.setItem('lexiflow_key2', 'value2');
    localStorage.setItem('other_key', 'value3');

    const keys = StorageUtils.getAllKeys();

    expect(keys).toContain('lexiflow_key1');
    expect(keys).toContain('lexiflow_key2');
    expect(keys).not.toContain('other_key');
  });

  it('should return empty array when no lexiflow keys', () => {
    localStorage.setItem('other_key', 'value');

    const keys = StorageUtils.getAllKeys();

    expect(keys).toEqual([]);
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const originalKeys = Object.keys;
    Object.keys = jest.fn(() => {
      throw new Error('Error');
    });

    const keys = StorageUtils.getAllKeys();

    expect(keys).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();

    Object.keys = originalKeys;
    consoleErrorSpy.mockRestore();
  });
});

describe('StorageUtils.getSize', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return approximate storage size', () => {
    localStorage.setItem('key1', 'value1'); // 4 + 6 = 10 chars
    localStorage.setItem('key2', 'value2'); // 4 + 6 = 10 chars

    const size = StorageUtils.getSize();

    expect(size).toBeGreaterThanOrEqual(20);
  });

  it('should return 0 for empty storage', () => {
    const size = StorageUtils.getSize();
    expect(size).toBe(0);
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    getItemSpy.mockImplementation(() => {
      throw new Error('Error');
    });

    const size = StorageUtils.getSize();

    expect(size).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalled();

    getItemSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});

describe('Backwards compatibility functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getItem', () => {
    it('should get item from localStorage', () => {
      localStorage.setItem('key', 'value');
      expect(getItem('key')).toBe('value');
    });

    it('should return null for non-existent key', () => {
      expect(getItem('nonexistent')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('Error');
      });

      expect(getItem('key')).toBeNull();

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('should set item in localStorage', () => {
      const result = setItem('key', 'value');

      expect(result).toBe(true);
      expect(localStorage.getItem('key')).toBe('value');
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Error');
      });

      const result = setItem('key', 'value');

      expect(result).toBe(false);

      setItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('key', 'value');
      removeItem('key');

      expect(localStorage.getItem('key')).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Error');
      });

      expect(() => removeItem('key')).not.toThrow();

      removeItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('Server-side rendering safety', () => {
  it('should handle window being undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(isStorageAvailable()).toBe(false);
    expect(StorageUtils.get('key', 'default')).toBe('default');
    expect(StorageUtils.set('key', 'value')).toBe(false);
    expect(StorageUtils.has('key')).toBe(false);

    global.window = originalWindow;
  });
});

describe('Integration tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should handle complete workflow', () => {
    // Check key doesn't exist
    expect(StorageUtils.has('workflow_key')).toBe(false);

    // Set a value
    expect(StorageUtils.set('workflow_key', { data: 'test' })).toBe(true);

    // Check key exists
    expect(StorageUtils.has('workflow_key')).toBe(true);

    // Get the value
    const value = StorageUtils.get('workflow_key', {});
    expect(value).toEqual({ data: 'test' });

    // Remove the value
    StorageUtils.remove('workflow_key');

    // Check key no longer exists
    expect(StorageUtils.has('workflow_key')).toBe(false);
  });

  it('should handle multiple keys simultaneously', () => {
    const data1 = { id: 1, name: 'Test 1' };
    const data2 = { id: 2, name: 'Test 2' };
    const data3 = { id: 3, name: 'Test 3' };

    StorageUtils.set('key1', data1);
    StorageUtils.set('key2', data2);
    StorageUtils.set('key3', data3);

    expect(StorageUtils.get('key1', {})).toEqual(data1);
    expect(StorageUtils.get('key2', {})).toEqual(data2);
    expect(StorageUtils.get('key3', {})).toEqual(data3);
  });
});
