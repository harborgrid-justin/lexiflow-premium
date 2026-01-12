/**
 * @jest-environment jsdom
 * @module tests/services/infrastructure/blobManager
 * @description Tests for BlobManager - file and binary data management
 */

import { BlobManager } from "@/services/infrastructure/blobManager";

describe("BlobManager", () => {
  beforeEach(() => {
    BlobManager.revokeAll();
  });

  afterEach(() => {
    BlobManager.revokeAll();
  });

  describe("Blob URL Creation", () => {
    it("should create and track blob URLs", () => {
      const data = new Blob(["test data"], { type: "text/plain" });
      const url = BlobManager.create(data, "test-context");

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(1);
    });

    it("should create blob URLs without context", () => {
      const data = new Blob(["test"], { type: "text/plain" });
      const url = BlobManager.create(data);

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);
    });

    it("should track multiple blob URLs", () => {
      const blob1 = new Blob(["data 1"], { type: "text/plain" });
      const blob2 = new Blob(["data 2"], { type: "text/plain" });
      const blob3 = new Blob(["data 3"], { type: "text/plain" });

      BlobManager.create(blob1);
      BlobManager.create(blob2);
      BlobManager.create(blob3);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(3);
    });
  });

  describe("Context-based Management", () => {
    it("should track blob URLs by context", () => {
      const data1 = new Blob(["data 1"], { type: "text/plain" });
      const data2 = new Blob(["data 2"], { type: "text/plain" });

      BlobManager.create(data1, "context-1");
      BlobManager.create(data2, "context-1");

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byContext["context-1"]).toBe(2);
    });

    it("should revoke all blobs by context", () => {
      const data1 = new Blob(["data 1"], { type: "text/plain" });
      const data2 = new Blob(["data 2"], { type: "text/plain" });
      const data3 = new Blob(["data 3"], { type: "text/plain" });

      BlobManager.create(data1, "context-1");
      BlobManager.create(data2, "context-1");
      BlobManager.create(data3, "context-2");

      const revoked = BlobManager.revokeByContext("context-1");
      expect(revoked).toBe(2);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(1);
      expect(stats.byContext["context-2"]).toBe(1);
    });

    it("should track multiple contexts independently", () => {
      BlobManager.create(new Blob(["1"]), "context-a");
      BlobManager.create(new Blob(["2"]), "context-a");
      BlobManager.create(new Blob(["3"]), "context-b");

      const stats = BlobManager.getStats();
      expect(stats.byContext["context-a"]).toBe(2);
      expect(stats.byContext["context-b"]).toBe(1);
    });
  });

  describe("Revocation", () => {
    it("should revoke single blob URL", () => {
      const data = new Blob(["test"], { type: "text/plain" });
      const url = BlobManager.create(data);

      BlobManager.revoke(url);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(0);
    });

    it("should handle revoking non-existent URL gracefully", () => {
      expect(() => {
        BlobManager.revoke("blob:nonexistent");
      }).not.toThrow();
    });

    it("should revoke all URLs", () => {
      BlobManager.create(new Blob(["1"]));
      BlobManager.create(new Blob(["2"]));
      BlobManager.create(new Blob(["3"]));

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(3);

      const revoked = BlobManager.revokeAll();
      expect(revoked).toBe(3);

      const newStats = BlobManager.getStats();
      expect(newStats.total).toBe(0);
    });
  });

  describe("Old URL Cleanup", () => {
    it("should revoke old URLs", () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      // Create URL
      const url = BlobManager.create(new Blob(["test"]));

      // Advance time by 6 minutes
      jest.setSystemTime(now + 6 * 60 * 1000);

      // Revoke URLs older than 5 minutes
      const revoked = BlobManager.revokeOld(5 * 60 * 1000);
      expect(revoked).toBe(1);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(0);

      jest.useRealTimers();
    });

    it("should not revoke recent URLs", () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      BlobManager.create(new Blob(["test"]));

      // Advance time by 1 minute
      jest.setSystemTime(now + 1 * 60 * 1000);

      // Try to revoke URLs older than 5 minutes
      const revoked = BlobManager.revokeOld(5 * 60 * 1000);
      expect(revoked).toBe(0);

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(1);

      jest.useRealTimers();
    });
  });

  describe("Statistics", () => {
    it("should provide storage statistics", () => {
      const stats = BlobManager.getStats();

      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("byContext");
      expect(stats).toHaveProperty("oldestAge");
    });

    it("should calculate oldest age correctly", () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      BlobManager.create(new Blob(["test"]));

      jest.setSystemTime(now + 2 * 60 * 1000); // 2 minutes later

      const stats = BlobManager.getStats();
      expect(stats.oldestAge).toBeGreaterThanOrEqual(2 * 60 * 1000);

      jest.useRealTimers();
    });

    it("should show zero total when empty", () => {
      const stats = BlobManager.getStats();
      expect(stats.total).toBe(0);
      expect(stats.oldestAge).toBe(0);
    });
  });

  describe("File Types", () => {
    it("should handle various MIME types", () => {
      const types = [
        "text/plain",
        "application/json",
        "image/png",
        "application/pdf",
        "video/mp4",
      ];

      types.forEach((type) => {
        const blob = new Blob(["test"], { type });
        const url = BlobManager.create(blob);
        expect(url).toBeDefined();
      });

      const stats = BlobManager.getStats();
      expect(stats.total).toBe(types.length);
    });

    it("should handle binary data", () => {
      const array = new Uint8Array([1, 2, 3, 4, 5]);
      const blob = new Blob([array], { type: "application/octet-stream" });
      const url = BlobManager.create(blob);

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);
    });

    it("should handle File objects", () => {
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const url = BlobManager.create(file);

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty blobs", () => {
      const blob = new Blob([], { type: "text/plain" });
      const url = BlobManager.create(blob);

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);
    });

    it("should handle large blobs", () => {
      const largeData = new Blob(["x".repeat(1024 * 100)], {
        type: "text/plain",
      }); // 100KB
      const url = BlobManager.create(largeData);

      expect(url).toBeDefined();
      expect(url.startsWith("blob:")).toBe(true);
    });
  });
});
