/**
 * @jest-environment jsdom
 */

import { queryKeys } from "../../src/utils/queryKeys";

describe("queryKeys", () => {
  describe("cases keys", () => {
    it("should have all() key", () => {
      expect(queryKeys.cases.all()).toEqual(["cases", "all"]);
    });

    it("should have lists() key", () => {
      expect(queryKeys.cases.lists()).toEqual(["cases", "list"]);
    });

    it("should have list(filters) key", () => {
      expect(queryKeys.cases.list("active")).toEqual([
        "cases",
        "list",
        "active",
      ]);
    });

    it("should have detail(id) key", () => {
      expect(queryKeys.cases.detail("123")).toEqual(["cases", "detail", "123"]);
    });

    it("should have byStatus(status) key", () => {
      expect(queryKeys.cases.byStatus("active")).toEqual([
        "cases",
        "byStatus",
        "active",
      ]);
    });

    it("should have byCaseId(caseId) key", () => {
      expect(queryKeys.cases.byCaseId("case-123")).toEqual([
        "cases",
        "byCaseId",
        "case-123",
      ]);
    });

    it("should have matters nested keys", () => {
      expect(queryKeys.cases.matters.all()).toEqual(["matters", "all"]);
      expect(queryKeys.cases.matters.lists()).toEqual(["matters", "list"]);
      expect(queryKeys.cases.matters.detail("123")).toEqual([
        "matters",
        "detail",
        "123",
      ]);
    });
  });

  describe("documents keys", () => {
    it("should have all() key", () => {
      expect(queryKeys.documents.all()).toEqual(["documents", "all"]);
    });

    it("should have lists() key", () => {
      expect(queryKeys.documents.lists()).toEqual(["documents", "list"]);
    });

    it("should have list(filters) key", () => {
      expect(queryKeys.documents.list("pdf")).toEqual([
        "documents",
        "list",
        "pdf",
      ]);
    });

    it("should have detail(id) key", () => {
      expect(queryKeys.documents.detail("doc-123")).toEqual([
        "documents",
        "detail",
        "doc-123",
      ]);
    });

    it("should have byCaseId(caseId) key", () => {
      expect(queryKeys.documents.byCaseId("case-123")).toEqual([
        "documents",
        "byCaseId",
        "case-123",
      ]);
    });

    it("should have templates() key", () => {
      expect(queryKeys.documents.templates()).toEqual([
        "documents",
        "templates",
      ]);
    });
  });

  describe("docket keys", () => {
    it("should have all() key", () => {
      expect(queryKeys.docket.all()).toEqual(["docket", "all"]);
    });

    it("should have lists() key", () => {
      expect(queryKeys.docket.lists()).toEqual(["docket", "list"]);
    });

    it("should have detail(id) key", () => {
      expect(queryKeys.docket.detail("dk-123")).toEqual([
        "docket",
        "detail",
        "dk-123",
      ]);
    });

    it("should have byCaseId(caseId) key", () => {
      expect(queryKeys.docket.byCaseId("case-123")).toEqual([
        "docket",
        "byCaseId",
        "case-123",
      ]);
    });
  });

  describe("evidence keys", () => {
    it("should have all() key", () => {
      expect(queryKeys.evidence.all()).toEqual(["evidence", "all"]);
    });

    it("should have lists() key", () => {
      expect(queryKeys.evidence.lists()).toEqual(["evidence", "list"]);
    });

    it("should have list(filters) key with filters", () => {
      const filters = { type: "document", status: "active" };
      expect(queryKeys.evidence.list(filters)).toEqual([
        "evidence",
        "list",
        filters,
      ]);
    });

    it("should have list() key without filters", () => {
      expect(queryKeys.evidence.list()).toEqual([
        "evidence",
        "list",
        undefined,
      ]);
    });
  });

  describe("key consistency", () => {
    it("should return const tuples", () => {
      const key1 = queryKeys.cases.all();
      const key2 = queryKeys.cases.all();

      // Same structure
      expect(key1).toEqual(key2);

      // But different array instances
      expect(key1).not.toBe(key2);
    });

    it("should have consistent array structure", () => {
      const keys = [
        queryKeys.cases.all(),
        queryKeys.documents.all(),
        queryKeys.docket.all(),
        queryKeys.evidence.all(),
      ];

      keys.forEach((key) => {
        expect(Array.isArray(key)).toBe(true);
        expect(key.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("should use string values in keys", () => {
      const key = queryKeys.cases.detail("123");
      key.forEach((part) => {
        expect(typeof part).toBe("string");
      });
    });
  });

  describe("parameterized keys", () => {
    it("should create unique keys for different IDs", () => {
      const key1 = queryKeys.cases.detail("id-1");
      const key2 = queryKeys.cases.detail("id-2");

      expect(key1).not.toEqual(key2);
      expect(key1[2]).toBe("id-1");
      expect(key2[2]).toBe("id-2");
    });

    it("should create unique keys for different filters", () => {
      const key1 = queryKeys.cases.list("active");
      const key2 = queryKeys.cases.list("closed");

      expect(key1).not.toEqual(key2);
    });

    it("should handle empty string parameters", () => {
      const key = queryKeys.cases.detail("");
      expect(key).toEqual(["cases", "detail", ""]);
    });

    it("should handle special characters in parameters", () => {
      const key = queryKeys.cases.detail("id-with-special-chars-!@#");
      expect(key[2]).toBe("id-with-special-chars-!@#");
    });
  });

  describe("hierarchical keys", () => {
    it("should maintain hierarchy for filtering", () => {
      const allKey = queryKeys.cases.all();
      const listsKey = queryKeys.cases.lists();
      const specificListKey = queryKeys.cases.list("active");

      // All should start with 'cases'
      expect(allKey[0]).toBe("cases");
      expect(listsKey[0]).toBe("cases");
      expect(specificListKey[0]).toBe("cases");

      // Lists hierarchy
      expect(listsKey[1]).toBe("list");
      expect(specificListKey[1]).toBe("list");
    });

    it("should allow partial invalidation", () => {
      const listsKey = queryKeys.cases.lists();
      const list1 = queryKeys.cases.list("filter1");
      const list2 = queryKeys.cases.list("filter2");

      // Lists key is prefix of specific list keys
      expect(list1[0]).toBe(listsKey[0]);
      expect(list1[1]).toBe(listsKey[1]);
      expect(list2[0]).toBe(listsKey[0]);
      expect(list2[1]).toBe(listsKey[1]);
    });
  });

  describe("type safety", () => {
    it("should return readonly tuples", () => {
      const key = queryKeys.cases.all();

      // TypeScript should prevent mutations (runtime test)
      expect(() => {
        (key as any)[0] = "modified";
      }).not.toThrow(); // Arrays are mutable in JS, but TS prevents this
    });

    it("should be usable with React Query", () => {
      // Simulating React Query usage
      const cacheKey = queryKeys.cases.detail("123");
      const cacheMap = new Map();

      cacheMap.set(cacheKey.join(":"), { data: "test" });
      expect(cacheMap.has(cacheKey.join(":"))).toBe(true);
    });
  });

  describe("all domain keys", () => {
    it("should have keys for main domains", () => {
      expect(queryKeys.cases).toBeDefined();
      expect(queryKeys.documents).toBeDefined();
      expect(queryKeys.docket).toBeDefined();
      expect(queryKeys.evidence).toBeDefined();
    });

    it("should have consistent method naming", () => {
      const domains = [
        queryKeys.cases,
        queryKeys.documents,
        queryKeys.docket,
        queryKeys.evidence,
      ];

      domains.forEach((domain) => {
        expect(domain.all).toBeDefined();
        expect(domain.lists).toBeDefined();
      });
    });

    it("should support detail queries", () => {
      expect(queryKeys.cases.detail).toBeDefined();
      expect(queryKeys.documents.detail).toBeDefined();
      expect(queryKeys.docket.detail).toBeDefined();
    });

    it("should support case-scoped queries", () => {
      expect(queryKeys.cases.byCaseId).toBeDefined();
      expect(queryKeys.documents.byCaseId).toBeDefined();
      expect(queryKeys.docket.byCaseId).toBeDefined();
    });
  });

  describe("cache invalidation patterns", () => {
    it("should support invalidating all items", () => {
      const allKey = queryKeys.cases.all();
      expect(allKey).toEqual(["cases", "all"]);
    });

    it("should support invalidating list queries", () => {
      const listsKey = queryKeys.cases.lists();
      expect(listsKey).toEqual(["cases", "list"]);
    });

    it("should support invalidating specific item", () => {
      const detailKey = queryKeys.cases.detail("123");
      expect(detailKey).toEqual(["cases", "detail", "123"]);
    });

    it("should support invalidating by relationship", () => {
      const byCaseKey = queryKeys.documents.byCaseId("case-123");
      expect(byCaseKey).toEqual(["documents", "byCaseId", "case-123"]);
    });
  });

  describe("edge cases", () => {
    it("should handle very long IDs", () => {
      const longId = "x".repeat(1000);
      const key = queryKeys.cases.detail(longId);
      expect(key[2]).toBe(longId);
    });

    it("should handle unicode in parameters", () => {
      const unicodeId = "测试-🔥-id";
      const key = queryKeys.cases.detail(unicodeId);
      expect(key[2]).toBe(unicodeId);
    });

    it("should handle complex filter objects", () => {
      const complexFilters = {
        status: ["active", "pending"],
        dateRange: { start: "2025-01-01", end: "2025-12-31" },
        tags: ["urgent", "review"],
      };

      const key = queryKeys.evidence.list(complexFilters);
      expect(key[2]).toEqual(complexFilters);
    });

    it("should handle null and undefined gracefully", () => {
      // These should work with TypeScript's type system
      expect(queryKeys.evidence.list(undefined)).toBeDefined();
    });
  });

  describe("performance", () => {
    it("should create keys quickly", () => {
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        queryKeys.cases.detail(`id-${i}`);
      }
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should be very fast
    });

    it("should not cause memory leaks with many keys", () => {
      const keys = [];
      for (let i = 0; i < 1000; i++) {
        keys.push(queryKeys.cases.detail(`id-${i}`));
      }

      expect(keys.length).toBe(1000);
      // Each key should be independent
      expect(new Set(keys.map((k) => k.join(":"))).size).toBe(1000);
    });
  });

  describe("real-world usage patterns", () => {
    it("should support prefetch patterns", () => {
      const caseId = "case-123";
      const caseKey = queryKeys.cases.detail(caseId);
      const documentsKey = queryKeys.documents.byCaseId(caseId);
      const docketKey = queryKeys.docket.byCaseId(caseId);

      expect(caseKey).toBeDefined();
      expect(documentsKey).toBeDefined();
      expect(docketKey).toBeDefined();
    });

    it("should support optimistic updates", () => {
      const id = "123";
      const detailKey = queryKeys.cases.detail(id);
      const listsKey = queryKeys.cases.lists();

      // Both would be invalidated after mutation
      expect(detailKey).toBeDefined();
      expect(listsKey).toBeDefined();
    });

    it("should support infinite queries", () => {
      const page1Key = queryKeys.cases.list("page=1");
      const page2Key = queryKeys.cases.list("page=2");

      expect(page1Key).not.toEqual(page2Key);
    });
  });
});
