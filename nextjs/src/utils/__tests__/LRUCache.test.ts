import { LRUCache } from '../LRUCache';

describe('LRUCache', () => {
  describe('Constructor', () => {
    it('should create cache with specified capacity', () => {
      const cache = new LRUCache<string>(5);
      expect(cache.size()).toBe(0);
    });

    it('should create cache with capacity 1', () => {
      const cache = new LRUCache<string>(1);
      expect(cache.size()).toBe(0);
    });
  });

  describe('put and get', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent key', () => {
      const cache = new LRUCache<string>(3);
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should update existing key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
      expect(cache.size()).toBe(1);
    });

    it('should store complex objects', () => {
      interface User {
        id: string;
        name: string;
      }

      const cache = new LRUCache<User>(3);
      const user = { id: '1', name: 'John' };

      cache.put('user1', user);
      expect(cache.get('user1')).toEqual(user);
    });

    it('should handle null values', () => {
      const cache = new LRUCache<string | null>(3);

      cache.put('key1', null);
      expect(cache.get('key1')).toBeNull();
    });

    it('should handle undefined values', () => {
      const cache = new LRUCache<string | undefined>(3);

      cache.put('key1', undefined);
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('Eviction', () => {
    it('should evict oldest entry when capacity is reached', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.put('key4', 'value4'); // Should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
      expect(cache.size()).toBe(3);
    });

    it('should evict correct entry with capacity 1', () => {
      const cache = new LRUCache<string>(1);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2'); // Should evict key1

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.size()).toBe(1);
    });

    it('should evict oldest after multiple operations', () => {
      const cache = new LRUCache<string>(2);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3'); // Evicts key1
      cache.put('key4', 'value4'); // Evicts key2

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('LRU Behavior', () => {
    it('should update access order on get', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      // Access key1 to make it most recently used
      cache.get('key1');

      // Adding key4 should evict key2 (oldest), not key1
      cache.put('key4', 'value4');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update access order on put for existing key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      // Update key1 to make it most recently used
      cache.put('key1', 'updated1');

      // Adding key4 should evict key2 (oldest)
      cache.put('key4', 'value4');

      expect(cache.get('key1')).toBe('updated1');
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should maintain correct order with mixed operations', () => {
      const cache = new LRUCache<number>(3);

      cache.put('a', 1);
      cache.put('b', 2);
      cache.put('c', 3);
      cache.get('a'); // a is now most recent
      cache.get('b'); // b is now most recent
      cache.put('d', 4); // Should evict c (oldest)

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
      expect(cache.get('d')).toBe(4);
    });
  });

  describe('delete', () => {
    it('should delete specific key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.size()).toBe(1);
    });

    it('should handle deleting non-existent key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.delete('nonexistent');

      expect(cache.size()).toBe(1);
    });

    it('should allow re-adding deleted key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.delete('key1');
      cache.put('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBeUndefined();
    });

    it('should allow adding entries after clear', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.clear();
      cache.put('key2', 'value2');

      expect(cache.size()).toBe(1);
      expect(cache.get('key2')).toBe('value2');
    });

    it('should handle clearing empty cache', () => {
      const cache = new LRUCache<string>(3);
      expect(() => cache.clear()).not.toThrow();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const cache = new LRUCache<string>(5);

      expect(cache.size()).toBe(0);

      cache.put('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.put('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.delete('key1');
      expect(cache.size()).toBe(1);

      cache.clear();
      expect(cache.size()).toBe(0);
    });

    it('should not exceed capacity', () => {
      const cache = new LRUCache<string>(3);

      for (let i = 0; i < 10; i++) {
        cache.put(`key${i}`, `value${i}`);
      }

      expect(cache.size()).toBe(3);
    });
  });

  describe('has', () => {
    it('should return true for existing keys', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      const cache = new LRUCache<string>(3);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false after deletion', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should return false after eviction', () => {
      const cache = new LRUCache<string>(2);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3'); // Evicts key1

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
    });
  });

  describe('keys and values', () => {
    it('should return all keys in order', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      const keys = Array.from(cache.keys());
      expect(keys).toEqual(['key1', 'key2', 'key3']);
    });

    it('should return all values in order', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      const values = Array.from(cache.values());
      expect(values).toEqual(['value1', 'value2', 'value3']);
    });

    it('should reflect access order after get', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');
      cache.get('key1'); // Moves key1 to end

      const keys = Array.from(cache.keys());
      expect(keys).toEqual(['key2', 'key3', 'key1']);
    });

    it('should return empty iterators for empty cache', () => {
      const cache = new LRUCache<string>(3);

      expect(Array.from(cache.keys())).toEqual([]);
      expect(Array.from(cache.values())).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle string keys with special characters', () => {
      const cache = new LRUCache<string>(3);

      cache.put('key:with:colons', 'value1');
      cache.put('key/with/slashes', 'value2');
      cache.put('key-with-dashes_and_underscores', 'value3');

      expect(cache.get('key:with:colons')).toBe('value1');
      expect(cache.get('key/with/slashes')).toBe('value2');
      expect(cache.get('key-with-dashes_and_underscores')).toBe('value3');
    });

    it('should handle empty string as key', () => {
      const cache = new LRUCache<string>(3);

      cache.put('', 'empty key');
      expect(cache.get('')).toBe('empty key');
    });

    it('should handle numeric string keys', () => {
      const cache = new LRUCache<string>(3);

      cache.put('123', 'value1');
      expect(cache.get('123')).toBe('value1');
    });

    it('should handle large capacity', () => {
      const cache = new LRUCache<number>(10000);

      for (let i = 0; i < 5000; i++) {
        cache.put(`key${i}`, i);
      }

      expect(cache.size()).toBe(5000);
    });

    it('should handle rapid put/get operations', () => {
      const cache = new LRUCache<number>(100);

      for (let i = 0; i < 1000; i++) {
        cache.put(`key${i % 100}`, i);
        cache.get(`key${i % 50}`);
      }

      expect(cache.size()).toBe(100);
    });
  });

  describe('Type Safety', () => {
    it('should work with number type', () => {
      const cache = new LRUCache<number>(3);

      cache.put('key1', 42);
      expect(cache.get('key1')).toBe(42);
    });

    it('should work with boolean type', () => {
      const cache = new LRUCache<boolean>(3);

      cache.put('key1', true);
      cache.put('key2', false);

      expect(cache.get('key1')).toBe(true);
      expect(cache.get('key2')).toBe(false);
    });

    it('should work with array type', () => {
      const cache = new LRUCache<number[]>(3);

      cache.put('key1', [1, 2, 3]);
      expect(cache.get('key1')).toEqual([1, 2, 3]);
    });

    it('should work with union types', () => {
      const cache = new LRUCache<string | number>(3);

      cache.put('key1', 'string value');
      cache.put('key2', 42);

      expect(cache.get('key1')).toBe('string value');
      expect(cache.get('key2')).toBe(42);
    });
  });
});
