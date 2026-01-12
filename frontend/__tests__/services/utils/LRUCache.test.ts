/**
 * @jest-environment jsdom
 * @module tests/services/utils/LRUCache
 * @description Tests for LRU Cache implementation
 */

import { LRUCache } from "@/utils/LRUCache";

describe("LRUCache", () => {
  describe("Basic Operations", () => {
    it("should create cache with specified capacity", () => {
      const cache = new LRUCache<string>(3);
      expect(cache.size).toBe(0);
      expect(cache.capacity).toBe(3);
    });

    it("should get and set values", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return undefined for missing keys", () => {
      const cache = new LRUCache<string>(5);

      expect(cache.get("nonexistent")).toBeUndefined();
    });

    it("should check if key exists", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
      expect(cache.has("key2")).toBe(false);
    });

    it("should delete entries", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);

      cache.delete("key1");
      expect(cache.has("key1")).toBe(false);
      expect(cache.get("key1")).toBeUndefined();
    });

    it("should track size correctly", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      expect(cache.size).toBe(1);

      cache.set("key2", "value2");
      expect(cache.size).toBe(2);

      cache.delete("key1");
      expect(cache.size).toBe(1);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict least recently used item when capacity is reached", () => {
      const cache = new LRUCache<number>(3);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // 'a' is least recently used
      cache.set("d", 4); // Should evict 'a'

      expect(cache.has("a")).toBe(false);
      expect(cache.has("b")).toBe(true);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
    });

    it("should update access order on get", () => {
      const cache = new LRUCache<number>(3);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // Access 'a' to make it most recently used
      cache.get("a");

      cache.set("d", 4); // Should evict 'b', not 'a'

      expect(cache.has("a")).toBe(true);
      expect(cache.has("b")).toBe(false);
      expect(cache.has("c")).toBe(true);
      expect(cache.has("d")).toBe(true);
    });

    it("should update access order on set", () => {
      const cache = new LRUCache<number>(3);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      // Update 'a' to make it most recently used
      cache.set("a", 10);

      cache.set("d", 4); // Should evict 'b', not 'a'

      expect(cache.has("a")).toBe(true);
      expect(cache.get("a")).toBe(10);
      expect(cache.has("b")).toBe(false);
    });
  });

  describe("Clear Operation", () => {
    it("should clear all entries", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(false);
      expect(cache.has("key3")).toBe(false);
    });

    it("should allow adding after clear", () => {
      const cache = new LRUCache<string>(5);

      cache.set("key1", "value1");
      cache.clear();
      cache.set("key2", "value2");

      expect(cache.size).toBe(1);
      expect(cache.get("key2")).toBe("value2");
    });
  });

  describe("Iterator Support", () => {
    it("should iterate over entries", () => {
      const cache = new LRUCache<number>(5);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      const entries = Array.from(cache.entries());

      expect(entries).toHaveLength(3);
      expect(entries).toContainEqual(["a", 1]);
      expect(entries).toContainEqual(["b", 2]);
      expect(entries).toContainEqual(["c", 3]);
    });

    it("should iterate over keys", () => {
      const cache = new LRUCache<number>(5);

      cache.set("a", 1);
      cache.set("b", 2);

      const keys = Array.from(cache.keys());

      expect(keys).toEqual(["a", "b"]);
    });

    it("should iterate over values", () => {
      const cache = new LRUCache<number>(5);

      cache.set("a", 1);
      cache.set("b", 2);

      const values = Array.from(cache.values());

      expect(values).toEqual([1, 2]);
    });

    it("should support forEach", () => {
      const cache = new LRUCache<number>(5);

      cache.set("a", 1);
      cache.set("b", 2);

      const results: [string, number][] = [];
      cache.forEach((value, key) => {
        results.push([key, value]);
      });

      expect(results).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle capacity of 1", () => {
      const cache = new LRUCache<number>(1);

      cache.set("a", 1);
      expect(cache.get("a")).toBe(1);

      cache.set("b", 2);
      expect(cache.has("a")).toBe(false);
      expect(cache.get("b")).toBe(2);
    });

    it("should handle large capacity", () => {
      const cache = new LRUCache<number>(10000);

      for (let i = 0; i < 10000; i++) {
        cache.set(`key-${i}`, i);
      }

      expect(cache.size).toBe(10000);

      cache.set("new-key", 99999);
      expect(cache.size).toBe(10000); // Should evict one
    });

    it("should handle updating same key multiple times", () => {
      const cache = new LRUCache<number>(3);

      cache.set("a", 1);
      cache.set("a", 2);
      cache.set("a", 3);

      expect(cache.size).toBe(1);
      expect(cache.get("a")).toBe(3);
    });

    it("should handle null and undefined values", () => {
      const cache = new LRUCache<any>(5);

      cache.set("null", null);
      cache.set("undefined", undefined);

      expect(cache.get("null")).toBeNull();
      expect(cache.get("undefined")).toBeUndefined();
      expect(cache.has("null")).toBe(true);
      expect(cache.has("undefined")).toBe(true);
    });

    it("should handle different data types", () => {
      const cache = new LRUCache<any>(5);

      cache.set("string", "value");
      cache.set("number", 42);
      cache.set("boolean", true);
      cache.set("object", { key: "value" });
      cache.set("array", [1, 2, 3]);

      expect(cache.get("string")).toBe("value");
      expect(cache.get("number")).toBe(42);
      expect(cache.get("boolean")).toBe(true);
      expect(cache.get("object")).toEqual({ key: "value" });
      expect(cache.get("array")).toEqual([1, 2, 3]);
    });
  });

  describe("Performance", () => {
    it("should handle rapid access patterns", () => {
      const cache = new LRUCache<number>(100);

      // Fill cache
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, i);
      }

      // Rapid access
      for (let i = 0; i < 1000; i++) {
        const key = `key-${i % 100}`;
        cache.get(key);
      }

      expect(cache.size).toBe(100);
    });

    it("should maintain O(1) operations", () => {
      const cache = new LRUCache<number>(1000);

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, i);
      }

      const setTime = performance.now() - start;

      const getStart = performance.now();

      for (let i = 0; i < 1000; i++) {
        cache.get(`key-${i}`);
      }

      const getTime = performance.now() - getStart;

      // Both should complete quickly
      expect(setTime).toBeLessThan(100);
      expect(getTime).toBeLessThan(100);
    });
  });

  describe("Statistics", () => {
    it("should provide cache statistics", () => {
      const cache = new LRUCache<number>(10);

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3);

      const stats = cache.getStats();

      expect(stats.size).toBe(3);
      expect(stats.capacity).toBe(10);
      expect(stats.hitRate).toBeDefined();
    });

    it("should track hit rate", () => {
      const cache = new LRUCache<number>(5);

      cache.set("a", 1);
      cache.set("b", 2);

      cache.get("a"); // Hit
      cache.get("a"); // Hit
      cache.get("c"); // Miss

      const stats = cache.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.67, 1);
    });
  });

  describe("Eviction Callback", () => {
    it("should call eviction callback when item is evicted", () => {
      const onEvict = jest.fn();
      const cache = new LRUCache<number>(2, { onEvict });

      cache.set("a", 1);
      cache.set("b", 2);
      cache.set("c", 3); // Should evict 'a'

      expect(onEvict).toHaveBeenCalledWith("a", 1);
    });

    it("should call eviction callback on delete", () => {
      const onEvict = jest.fn();
      const cache = new LRUCache<number>(5, { onEvict });

      cache.set("a", 1);
      cache.delete("a");

      expect(onEvict).toHaveBeenCalledWith("a", 1);
    });

    it("should call eviction callback on clear", () => {
      const onEvict = jest.fn();
      const cache = new LRUCache<number>(5, { onEvict });

      cache.set("a", 1);
      cache.set("b", 2);
      cache.clear();

      expect(onEvict).toHaveBeenCalledTimes(2);
      expect(onEvict).toHaveBeenCalledWith("a", 1);
      expect(onEvict).toHaveBeenCalledWith("b", 2);
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory on repeated operations", () => {
      const cache = new LRUCache<number>(100);

      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        cache.set(`key-${i}`, i);
        if (i % 2 === 0) {
          cache.get(`key-${i - 50}`);
        }
      }

      // Size should not exceed capacity
      expect(cache.size).toBeLessThanOrEqual(100);
    });

    it("should properly cleanup on clear", () => {
      const cache = new LRUCache<{ large: number[] }>(10);

      for (let i = 0; i < 10; i++) {
        cache.set(`key-${i}`, { large: new Array(1000).fill(i) });
      }

      cache.clear();

      expect(cache.size).toBe(0);
    });
  });

  describe("TTL Support", () => {
    it("should expire entries after TTL", async () => {
      jest.useFakeTimers();

      const cache = new LRUCache<number>(5, { ttl: 1000 });

      cache.set("a", 1);
      expect(cache.get("a")).toBe(1);

      jest.advanceTimersByTime(1001);

      expect(cache.get("a")).toBeUndefined();
      expect(cache.has("a")).toBe(false);

      jest.useRealTimers();
    });

    it("should not expire entries before TTL", () => {
      jest.useFakeTimers();

      const cache = new LRUCache<number>(5, { ttl: 5000 });

      cache.set("a", 1);

      jest.advanceTimersByTime(4999);

      expect(cache.get("a")).toBe(1);

      jest.useRealTimers();
    });

    it("should reset TTL on access", () => {
      jest.useFakeTimers();

      const cache = new LRUCache<number>(5, {
        ttl: 1000,
        resetTTLOnAccess: true,
      });

      cache.set("a", 1);

      jest.advanceTimersByTime(500);
      cache.get("a"); // Reset TTL

      jest.advanceTimersByTime(600);

      expect(cache.get("a")).toBe(1); // Should still exist

      jest.useRealTimers();
    });
  });
});
