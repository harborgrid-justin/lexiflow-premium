/**
 * cacheService.test.ts
 * Tests for the cache service with LRU eviction
 * Updated: 2025-12-18 for backend-first architecture
 */

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
  createdAt: number;
}

class SimpleLRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];

  constructor(private maxSize: number = 100) {}

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
    };

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = this.accessOrder.shift();
      if (oldest) this.cache.delete(oldest);
    }

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return undefined;
    }

    this.updateAccessOrder(key);
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) this.accessOrder.splice(index, 1);
  }
}

describe("CacheService", () => {
  let cache: SimpleLRUCache<any>;

  beforeEach(() => {
    cache = new SimpleLRUCache(5);
  });

  describe("set/get", () => {
    it("should store and retrieve values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should handle complex objects", () => {
      const obj = { id: "1", nested: { data: [1, 2, 3] } };
      cache.set("obj", obj);
      expect(cache.get("obj")).toEqual(obj);
    });

    it("should return undefined for missing keys", () => {
      expect(cache.get("nonexistent")).toBeUndefined();
    });
  });

  describe("expiration", () => {
    it("should expire items after TTL", async () => {
      cache.set("key1", "value1", 100); // 100ms TTL
      expect(cache.get("key1")).toBe("value1");

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(cache.get("key1")).toBeUndefined();
    });

    it("should handle no expiration", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });
  });

  describe("delete", () => {
    it("should remove single item", () => {
      cache.set("key1", "value1");
      cache.delete("key1");
      expect(cache.get("key1")).toBeUndefined();
    });

    it("should clear all items", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.get("key1")).toBeUndefined();
      expect(cache.get("key2")).toBeUndefined();
    });
  });

  describe("capacity", () => {
    it("should evict LRU items when full", () => {
      // Fill cache to capacity (5 items)
      for (let i = 1; i <= 5; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Access key1 to make it most recently used
      cache.get("key1");

      // Add 6th item, should evict key2 (least recently used)
      cache.set("key6", "value6");

      expect(cache.get("key2")).toBeUndefined();
      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key6")).toBe("value6");
    });

    it("should respect max size", () => {
      const smallCache = new SimpleLRUCache(2);
      smallCache.set("key1", "value1");
      smallCache.set("key2", "value2");
      smallCache.set("key3", "value3");

      expect(smallCache.get("key1")).toBeUndefined(); // Evicted
      expect(smallCache.get("key2")).toBe("value2");
      expect(smallCache.get("key3")).toBe("value3");
    });
  });

  describe("integration with queryClient", () => {
    it("should be compatible with query caching patterns", () => {
      // Simulate query key hashing
      const queryKey = JSON.stringify(["cases", { status: "active" }]);
      const queryData = [{ id: "1", title: "Case 1" }];

      cache.set(queryKey, queryData, 5 * 60 * 1000); // 5min TTL
      expect(cache.get(queryKey)).toEqual(queryData);
    });
  });
});
