/**
 * @jest-environment jsdom
 */

import { LRUCache } from "../../src/utils/LRUCache";

describe("LRUCache", () => {
  describe("constructor", () => {
    it("should create cache with specified capacity", () => {
      const cache = new LRUCache<string>(5);
      expect(cache).toBeInstanceOf(LRUCache);
    });

    it("should accept different capacities", () => {
      expect(() => new LRUCache<string>(1)).not.toThrow();
      expect(() => new LRUCache<string>(100)).not.toThrow();
      expect(() => new LRUCache<string>(1000)).not.toThrow();
    });
  });

  describe("put and get", () => {
    it("should store and retrieve values", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return undefined for non-existent keys", () => {
      const cache = new LRUCache<string>(5);
      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should update existing values", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      cache.put("key1", "value2");
      expect(cache.get("key1")).toBe("value2");
    });

    it("should handle multiple key-value pairs", () => {
      const cache = new LRUCache<number>(5);
      cache.put("one", 1);
      cache.put("two", 2);
      cache.put("three", 3);

      expect(cache.get("one")).toBe(1);
      expect(cache.get("two")).toBe(2);
      expect(cache.get("three")).toBe(3);
    });

    it("should store complex objects", () => {
      interface User {
        name: string;
        age: number;
      }

      const cache = new LRUCache<User>(5);
      const user = { name: "John", age: 30 };
      cache.put("user1", user);

      expect(cache.get("user1")).toEqual(user);
    });
  });

  describe("LRU eviction", () => {
    it("should evict least recently used item when capacity exceeded", () => {
      const cache = new LRUCache<string>(3);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");
      cache.put("d", "4"); // Should evict 'a'

      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe("2");
      expect(cache.get("c")).toBe("3");
      expect(cache.get("d")).toBe("4");
    });

    it("should update LRU order on access", () => {
      const cache = new LRUCache<string>(3);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");

      cache.get("a"); // Access 'a', making it most recent

      cache.put("d", "4"); // Should evict 'b', not 'a'

      expect(cache.get("a")).toBe("1");
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe("3");
      expect(cache.get("d")).toBe("4");
    });

    it("should update LRU order on put of existing key", () => {
      const cache = new LRUCache<string>(3);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");

      cache.put("a", "1-updated"); // Update 'a', making it most recent

      cache.put("d", "4"); // Should evict 'b'

      expect(cache.get("a")).toBe("1-updated");
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBe("3");
    });

    it("should handle capacity of 1", () => {
      const cache = new LRUCache<string>(1);
      cache.put("a", "1");
      cache.put("b", "2"); // Should evict 'a'

      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBe("2");
    });
  });

  describe("delete", () => {
    it("should remove item from cache", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      cache.delete("key1");

      expect(cache.get("key1")).toBeUndefined();
    });

    it("should not throw when deleting non-existent key", () => {
      const cache = new LRUCache<string>(5);
      expect(() => cache.delete("nonexistent")).not.toThrow();
    });

    it("should allow re-adding deleted key", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      cache.delete("key1");
      cache.put("key1", "value2");

      expect(cache.get("key1")).toBe("value2");
    });
  });

  describe("clear", () => {
    it("should remove all items", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");

      cache.clear();

      expect(cache.get("a")).toBeUndefined();
      expect(cache.get("b")).toBeUndefined();
      expect(cache.get("c")).toBeUndefined();
    });

    it("should allow adding items after clear", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.clear();
      cache.put("b", "2");

      expect(cache.get("b")).toBe("2");
    });

    it("should work on empty cache", () => {
      const cache = new LRUCache<string>(5);
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe("has", () => {
    it("should return true for existing keys", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      expect(cache.has("key1")).toBe(true);
    });

    it("should return false for non-existent keys", () => {
      const cache = new LRUCache<string>(5);
      expect(cache.has("nonexistent")).toBe(false);
    });

    it("should return false after deletion", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key1", "value1");
      cache.delete("key1");
      expect(cache.has("key1")).toBe(false);
    });

    it("should return false after eviction", () => {
      const cache = new LRUCache<string>(2);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3"); // Evicts 'a'

      expect(cache.has("a")).toBe(false);
    });
  });

  describe("size", () => {
    it("should return 0 for empty cache", () => {
      const cache = new LRUCache<string>(5);
      expect(cache.size()).toBe(0);
    });

    it("should return correct size", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      expect(cache.size()).toBe(1);

      cache.put("b", "2");
      expect(cache.size()).toBe(2);
    });

    it("should not exceed capacity", () => {
      const cache = new LRUCache<string>(3);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");
      cache.put("d", "4");

      expect(cache.size()).toBe(3);
    });

    it("should decrease on delete", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.put("b", "2");
      expect(cache.size()).toBe(2);

      cache.delete("a");
      expect(cache.size()).toBe(1);
    });

    it("should be 0 after clear", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.clear();

      expect(cache.size()).toBe(0);
    });
  });

  describe("keys", () => {
    it("should return all keys", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");

      const keys = cache.keys();
      expect(keys).toContain("a");
      expect(keys).toContain("b");
      expect(keys).toContain("c");
    });

    it("should return empty array for empty cache", () => {
      const cache = new LRUCache<string>(5);
      expect(cache.keys()).toEqual([]);
    });

    it("should reflect deletions", () => {
      const cache = new LRUCache<string>(5);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.delete("a");

      const keys = cache.keys();
      expect(keys).not.toContain("a");
      expect(keys).toContain("b");
    });

    it("should return keys in LRU order", () => {
      const cache = new LRUCache<string>(3);
      cache.put("a", "1");
      cache.put("b", "2");
      cache.put("c", "3");
      cache.get("a"); // Access 'a'

      const keys = cache.keys();
      // 'a' should be at the end (most recent)
      expect(keys[keys.length - 1]).toBe("a");
    });
  });

  describe("values", () => {
    it("should return all values", () => {
      const cache = new LRUCache<number>(5);
      cache.put("a", 1);
      cache.put("b", 2);
      cache.put("c", 3);

      const values = cache.values();
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });

    it("should return empty array for empty cache", () => {
      const cache = new LRUCache<string>(5);
      expect(cache.values()).toEqual([]);
    });

    it("should reflect updates", () => {
      const cache = new LRUCache<number>(5);
      cache.put("a", 1);
      cache.put("a", 10);

      const values = cache.values();
      expect(values).toContain(10);
      expect(values).not.toContain(1);
    });
  });

  describe("type safety", () => {
    it("should work with strings", () => {
      const cache = new LRUCache<string>(5);
      cache.put("key", "value");
      const value: string | undefined = cache.get("key");
      expect(value).toBe("value");
    });

    it("should work with numbers", () => {
      const cache = new LRUCache<number>(5);
      cache.put("key", 42);
      const value: number | undefined = cache.get("key");
      expect(value).toBe(42);
    });

    it("should work with complex types", () => {
      interface Data {
        id: number;
        name: string;
        nested: { value: boolean };
      }

      const cache = new LRUCache<Data>(5);
      const data: Data = {
        id: 1,
        name: "test",
        nested: { value: true },
      };

      cache.put("key", data);
      const retrieved = cache.get("key");
      expect(retrieved).toEqual(data);
    });
  });

  describe("edge cases", () => {
    it("should handle very large capacity", () => {
      const cache = new LRUCache<string>(10000);
      for (let i = 0; i < 5000; i++) {
        cache.put(`key${i}`, `value${i}`);
      }
      expect(cache.size()).toBe(5000);
    });

    it("should handle rapid put/get operations", () => {
      const cache = new LRUCache<number>(100);
      for (let i = 0; i < 1000; i++) {
        cache.put(`key${i % 50}`, i);
        cache.get(`key${(i - 10) % 50}`);
      }
      expect(cache.size()).toBeLessThanOrEqual(100);
    });

    it("should handle special characters in keys", () => {
      const cache = new LRUCache<string>(5);
      const specialKeys = ["key!@#", "key 空格", "key🔥", "key\n\t"];

      specialKeys.forEach((key, i) => {
        cache.put(key, `value${i}`);
        expect(cache.get(key)).toBe(`value${i}`);
      });
    });

    it("should handle null values", () => {
      const cache = new LRUCache<string | null>(5);
      cache.put("key", null);
      expect(cache.get("key")).toBeNull();
    });

    it("should handle undefined values", () => {
      const cache = new LRUCache<string | undefined>(5);
      cache.put("key", undefined);
      expect(cache.has("key")).toBe(true);
      expect(cache.get("key")).toBeUndefined();
    });
  });

  describe("performance", () => {
    it("should handle 1000 operations quickly", () => {
      const cache = new LRUCache<number>(100);
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        cache.put(`key${i}`, i);
        cache.get(`key${i - 50}`);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should have O(1) get operations", () => {
      const cache = new LRUCache<number>(1000);

      // Fill cache
      for (let i = 0; i < 1000; i++) {
        cache.put(`key${i}`, i);
      }

      // Measure get operations
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it("should have O(1) put operations", () => {
      const cache = new LRUCache<number>(1000);

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        cache.put(`key${i}`, i);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe("concurrent access patterns", () => {
    it("should handle interleaved put and get", () => {
      const cache = new LRUCache<number>(10);

      for (let i = 0; i < 20; i++) {
        cache.put(`key${i}`, i);
        if (i > 5) {
          cache.get(`key${i - 5}`);
        }
      }

      expect(cache.size()).toBe(10);
    });

    it("should maintain consistency with updates", () => {
      const cache = new LRUCache<number>(5);

      cache.put("a", 1);
      cache.put("b", 2);
      cache.put("a", 10); // Update
      cache.put("c", 3);

      expect(cache.get("a")).toBe(10);
      expect(cache.size()).toBe(3);
    });
  });
});
