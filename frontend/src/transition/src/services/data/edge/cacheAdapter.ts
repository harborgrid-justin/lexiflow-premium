/**
 * Edge cache adapter
 * Uses Cache API when available in edge runtime
 */

export class EdgeCacheAdapter {
  private cacheName = "edge-data-cache";

  async get<T>(key: string): Promise<T | null> {
    if (typeof caches === "undefined") return null;

    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(key);

      if (!response) return null;

      return await response.json();
    } catch (error) {
      console.error("Edge cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (typeof caches === "undefined") return;

    try {
      const cache = await caches.open(this.cacheName);

      const response = new Response(JSON.stringify(value), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": ttl ? `max-age=${ttl}` : "no-cache",
        },
      });

      await cache.put(key, response);
    } catch (error) {
      console.error("Edge cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    if (typeof caches === "undefined") return;

    try {
      const cache = await caches.open(this.cacheName);
      await cache.delete(key);
    } catch (error) {
      console.error("Edge cache delete error:", error);
    }
  }

  async clear(): Promise<void> {
    if (typeof caches === "undefined") return;

    try {
      await caches.delete(this.cacheName);
    } catch (error) {
      console.error("Edge cache clear error:", error);
    }
  }
}

export const edgeCacheAdapter = new EdgeCacheAdapter();
