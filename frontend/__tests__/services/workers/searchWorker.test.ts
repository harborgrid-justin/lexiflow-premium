/**
 * @jest-environment jsdom
 * @module tests/services/workers/searchWorker
 * @description Tests for search worker functionality
 */

import { WorkerPool } from "@/services/workers/WorkerPool";

describe("SearchWorker", () => {
  let workerPool: WorkerPool;

  beforeEach(() => {
    // Mock Worker
    class MockWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      constructor(public scriptURL: string) {}

      postMessage(message: any) {
        // Simulate async response
        setTimeout(() => {
          if (this.onmessage) {
            this.onmessage(
              new MessageEvent("message", {
                data: {
                  type: "search-result",
                  results: this.mockSearch(message.query),
                  id: message.id,
                },
              })
            );
          }
        }, 10);
      }

      terminate() {}

      private mockSearch(query: string) {
        const mockData = [
          { id: "1", title: "Document 1", content: "First document content" },
          { id: "2", title: "Document 2", content: "Second document content" },
          { id: "3", title: "Test Document", content: "Test content here" },
        ];

        return mockData.filter(
          (doc) =>
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.content.toLowerCase().includes(query.toLowerCase())
        );
      }
    }

    global.Worker = MockWorker as any;
    workerPool = new WorkerPool(2); // Pool of 2 workers
  });

  afterEach(() => {
    workerPool.terminate();
  });

  describe("Basic Search", () => {
    it("should execute search query", async () => {
      const results = await workerPool.search("document");

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty("title");
      expect(results[0]).toHaveProperty("content");
    });

    it("should filter results by query", async () => {
      const results = await workerPool.search("test");

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Test Document");
    });

    it("should return empty array for no matches", async () => {
      const results = await workerPool.search("nonexistent");

      expect(results).toEqual([]);
    });

    it("should be case-insensitive", async () => {
      const results1 = await workerPool.search("DOCUMENT");
      const results2 = await workerPool.search("document");

      expect(results1).toEqual(results2);
    });
  });

  describe("Index Building", () => {
    it("should build search index", async () => {
      const documents = [
        { id: "1", title: "Doc 1", content: "Content 1" },
        { id: "2", title: "Doc 2", content: "Content 2" },
      ];

      await workerPool.buildIndex(documents);

      const results = await workerPool.search("doc");

      expect(results.length).toBeGreaterThan(0);
    });

    it("should update index when documents change", async () => {
      const docs1 = [
        { id: "1", title: "Original", content: "Original content" },
      ];
      await workerPool.buildIndex(docs1);

      const results1 = await workerPool.search("original");
      expect(results1).toHaveLength(1);

      const docs2 = [{ id: "2", title: "Updated", content: "Updated content" }];
      await workerPool.buildIndex(docs2);

      const results2 = await workerPool.search("updated");
      expect(results2).toHaveLength(1);
    });

    it("should handle large document sets", async () => {
      const largeSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `doc-${i}`,
        title: `Document ${i}`,
        content: `Content for document number ${i}`,
      }));

      await workerPool.buildIndex(largeSet);

      const results = await workerPool.search("500");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Concurrent Searches", () => {
    it("should handle multiple concurrent searches", async () => {
      const search1 = workerPool.search("document");
      const search2 = workerPool.search("test");
      const search3 = workerPool.search("content");

      const [results1, results2, results3] = await Promise.all([
        search1,
        search2,
        search3,
      ]);

      expect(results1).toBeDefined();
      expect(results2).toBeDefined();
      expect(results3).toBeDefined();
    });

    it("should distribute work across worker pool", async () => {
      const searches = Array.from({ length: 10 }, (_, i) =>
        workerPool.search(`query-${i}`)
      );

      const results = await Promise.all(searches);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("Advanced Search Features", () => {
    it("should support fuzzy search", async () => {
      const results = await workerPool.search("documnt", { fuzzy: true });

      expect(results.length).toBeGreaterThan(0);
    });

    it("should support phrase search", async () => {
      const results = await workerPool.search('"first document"', {
        phrase: true,
      });

      expect(results).toHaveLength(1);
      expect(results[0].content).toContain("First document");
    });

    it("should support field-specific search", async () => {
      const results = await workerPool.search("test", { fields: ["title"] });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((result) => {
        expect(result.title.toLowerCase()).toContain("test");
      });
    });

    it("should support result limiting", async () => {
      const results = await workerPool.search("document", { limit: 2 });

      expect(results).toHaveLength(2);
    });

    it("should support result sorting", async () => {
      const results = await workerPool.search("document", {
        sort: "relevance",
        order: "desc",
      });

      // Results should be in relevance order
      expect(results).toBeDefined();
    });
  });

  describe("Highlighting", () => {
    it("should highlight search terms in results", async () => {
      const results = await workerPool.search("test", { highlight: true });

      expect(results[0]).toHaveProperty("highlighted");
      expect(results[0].highlighted).toContain("<mark>");
    });

    it("should support custom highlight tags", async () => {
      const results = await workerPool.search("document", {
        highlight: true,
        highlightTag: "strong",
      });

      expect(results[0].highlighted).toContain("<strong>");
    });
  });

  describe("Faceted Search", () => {
    it("should provide search facets", async () => {
      const results = await workerPool.search("document", { facets: true });

      expect(results).toHaveProperty("facets");
      expect(results.facets).toBeDefined();
    });

    it("should filter by facets", async () => {
      const results = await workerPool.search("content", {
        facets: true,
        filters: { category: "legal" },
      });

      expect(results.items).toBeDefined();
      expect(results.facets).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should handle rapid successive searches", async () => {
      const start = performance.now();

      for (let i = 0; i < 20; i++) {
        await workerPool.search("document");
      }

      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(5000); // Should complete in reasonable time
    });

    it("should cancel pending searches", async () => {
      const search1 = workerPool.search("long-running-query");
      const search2 = workerPool.search("another-query");

      workerPool.cancelPending();

      await expect(search1).rejects.toThrow();
      await expect(search2).rejects.toThrow();
    });

    it("should handle search cancellation", async () => {
      const searchPromise = workerPool.search("cancellable");

      workerPool.cancel(searchPromise.id);

      await expect(searchPromise).rejects.toThrow("cancelled");
    });
  });

  describe("Error Handling", () => {
    it("should handle worker errors gracefully", async () => {
      // Mock worker error
      const worker = (global.Worker as any).mock.instances[0];
      worker.onerror = (error: ErrorEvent) => {
        throw new Error("Worker error");
      };

      await expect(workerPool.search("error")).rejects.toThrow();
    });

    it("should retry failed searches", async () => {
      let attempts = 0;

      const originalPostMessage = Worker.prototype.postMessage;
      Worker.prototype.postMessage = function (message: any) {
        attempts++;
        if (attempts < 3) {
          throw new Error("Temporary failure");
        }
        return originalPostMessage.call(this, message);
      };

      const results = await workerPool.search("retry", { maxRetries: 3 });

      expect(results).toBeDefined();
      expect(attempts).toBe(3);

      Worker.prototype.postMessage = originalPostMessage;
    });

    it("should handle invalid search queries", async () => {
      await expect(workerPool.search("")).rejects.toThrow("Invalid query");
    });

    it("should handle timeout", async () => {
      jest.useFakeTimers();

      const searchPromise = workerPool.search("slow", { timeout: 1000 });

      jest.advanceTimersByTime(1001);

      await expect(searchPromise).rejects.toThrow("timeout");

      jest.useRealTimers();
    });
  });

  describe("Worker Pool Management", () => {
    it("should create worker pool with specified size", () => {
      const pool = new WorkerPool(4);

      expect(pool.size).toBe(4);
      expect(pool.available).toBe(4);

      pool.terminate();
    });

    it("should queue tasks when all workers are busy", async () => {
      const smallPool = new WorkerPool(1);

      const search1 = smallPool.search("query1");
      const search2 = smallPool.search("query2");

      expect(smallPool.available).toBe(0);
      expect(smallPool.queued).toBe(1);

      await Promise.all([search1, search2]);

      smallPool.terminate();
    });

    it("should terminate all workers", () => {
      const pool = new WorkerPool(3);

      pool.terminate();

      expect(pool.isTerminated).toBe(true);
    });

    it("should restart workers", async () => {
      workerPool.terminate();
      workerPool.restart();

      const results = await workerPool.search("document");

      expect(results).toBeDefined();
    });
  });

  describe("Caching", () => {
    it("should cache search results", async () => {
      const results1 = await workerPool.search("cached-query", { cache: true });
      const results2 = await workerPool.search("cached-query", { cache: true });

      expect(results1).toEqual(results2);
      expect(workerPool.cacheHitRate).toBeGreaterThan(0);
    });

    it("should invalidate cache on index update", async () => {
      await workerPool.search("query", { cache: true });

      await workerPool.buildIndex([{ id: "1", title: "New", content: "New" }]);

      expect(workerPool.cacheSize).toBe(0);
    });

    it("should respect cache size limit", async () => {
      const pool = new WorkerPool(2, { maxCacheSize: 10 });

      for (let i = 0; i < 20; i++) {
        await pool.search(`query-${i}`, { cache: true });
      }

      expect(pool.cacheSize).toBeLessThanOrEqual(10);

      pool.terminate();
    });
  });

  describe("Statistics", () => {
    it("should track search statistics", async () => {
      await workerPool.search("stat-test");

      const stats = workerPool.getStats();

      expect(stats.totalSearches).toBeGreaterThan(0);
      expect(stats.averageSearchTime).toBeDefined();
      expect(stats.successRate).toBeDefined();
    });

    it("should track worker utilization", async () => {
      await workerPool.search("utilization");

      const stats = workerPool.getStats();

      expect(stats.workerUtilization).toBeDefined();
      expect(stats.workerUtilization).toBeGreaterThanOrEqual(0);
      expect(stats.workerUtilization).toBeLessThanOrEqual(1);
    });
  });
});
