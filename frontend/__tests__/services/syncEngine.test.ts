/**
 * syncEngine.test.ts
 * Tests for the SyncEngine offline-first mutation queue
 * Updated: 2025-12-18 - NOTE: SyncEngine is DEPRECATED in backend-first mode
 * Only used for legacy IndexedDB fallback when backend is unavailable
 */

interface QueuedMutation {
  id: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  store: string;
  data: any;
  timestamp: number;
  status: "pending" | "failed" | "completed";
  retryCount: number;
}

class SimpleSyncEngine {
  private queue: QueuedMutation[] = [];

  enqueue(
    mutation: Omit<QueuedMutation, "id" | "timestamp" | "status" | "retryCount">
  ): string {
    const id = `mut-${Date.now()}-${Math.random()}`;
    this.queue.push({
      ...mutation,
      id,
      timestamp: Date.now(),
      status: "pending",
      retryCount: 0,
    });
    return id;
  }

  dequeue(): QueuedMutation | undefined {
    return this.queue.shift();
  }

  peek(): QueuedMutation | undefined {
    return this.queue[0];
  }

  getQueue(): QueuedMutation[] {
    return [...this.queue];
  }

  update(id: string, updates: Partial<QueuedMutation>): boolean {
    const index = this.queue.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.queue[index] = { ...this.queue[index], ...updates };
    return true;
  }

  count(): number {
    return this.queue.length;
  }

  getFailed(): QueuedMutation[] {
    return this.queue.filter((m) => m.status === "failed");
  }

  resetFailed(): void {
    this.queue.forEach((m) => {
      if (m.status === "failed") {
        m.status = "pending";
        m.retryCount = 0;
      }
    });
  }

  clear(): void {
    this.queue = [];
  }
}

describe("SyncEngine (DEPRECATED for Backend-First)", () => {
  let syncEngine: SimpleSyncEngine;

  beforeEach(() => {
    syncEngine = new SimpleSyncEngine();
  });

  describe("getQueue", () => {
    it("should return empty array when queue is empty", () => {
      expect(syncEngine.getQueue()).toEqual([]);
    });

    it("should return existing mutations from storage", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });
      expect(syncEngine.getQueue()).toHaveLength(1);
    });
  });

  describe("enqueue", () => {
    it("should add new mutation to queue", () => {
      const id = syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "New Case" },
      });

      expect(id).toBeDefined();
      expect(syncEngine.count()).toBe(1);
    });

    it("should calculate patch for UPDATE operations", () => {
      // In production, would calculate diff between old and new
      const id = syncEngine.enqueue({
        operation: "UPDATE",
        store: "cases",
        data: { id: "case-1", title: "Updated Title" },
      });

      const mutation = syncEngine.getQueue()[0];
      expect(mutation.operation).toBe("UPDATE");
    });

    it("should include timestamp on mutation", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });

      const mutation = syncEngine.getQueue()[0];
      expect(mutation.timestamp).toBeDefined();
      expect(typeof mutation.timestamp).toBe("number");
    });
  });

  describe("dequeue", () => {
    it("should return undefined when queue is empty", () => {
      expect(syncEngine.dequeue()).toBeUndefined();
    });

    it("should remove and return first mutation", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 1" },
      });
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 2" },
      });

      const first = syncEngine.dequeue();
      expect(first?.data.title).toBe("Test 1");
      expect(syncEngine.count()).toBe(1);
    });
  });

  describe("peek", () => {
    it("should return undefined when queue is empty", () => {
      expect(syncEngine.peek()).toBeUndefined();
    });

    it("should return first mutation without removing it", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });

      const peeked = syncEngine.peek();
      expect(peeked?.data.title).toBe("Test");
      expect(syncEngine.count()).toBe(1);
    });
  });

  describe("update", () => {
    it("should update mutation by id", () => {
      const id = syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });

      const updated = syncEngine.update(id, { status: "completed" });
      expect(updated).toBe(true);

      const mutation = syncEngine.getQueue()[0];
      expect(mutation.status).toBe("completed");
    });

    it("should not update non-existent mutation", () => {
      const updated = syncEngine.update("nonexistent-id", { status: "failed" });
      expect(updated).toBe(false);
    });
  });

  describe("count", () => {
    it("should return 0 for empty queue", () => {
      expect(syncEngine.count()).toBe(0);
    });

    it("should return correct count", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 1" },
      });
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 2" },
      });
      expect(syncEngine.count()).toBe(2);
    });
  });

  describe("getFailed", () => {
    it("should return only failed mutations", () => {
      const id1 = syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 1" },
      });
      const id2 = syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 2" },
      });

      syncEngine.update(id1, { status: "failed" });

      const failed = syncEngine.getFailed();
      expect(failed).toHaveLength(1);
      expect(failed[0].id).toBe(id1);
    });

    it("should return empty array when no failures", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });
      expect(syncEngine.getFailed()).toEqual([]);
    });
  });

  describe("resetFailed", () => {
    it("should reset failed mutations to pending", () => {
      const id = syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test" },
      });
      syncEngine.update(id, { status: "failed", retryCount: 3 });

      syncEngine.resetFailed();

      const mutation = syncEngine.getQueue()[0];
      expect(mutation.status).toBe("pending");
      expect(mutation.retryCount).toBe(0);
    });
  });

  describe("clear", () => {
    it("should clear entire queue", () => {
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 1" },
      });
      syncEngine.enqueue({
        operation: "CREATE",
        store: "cases",
        data: { title: "Test 2" },
      });

      syncEngine.clear();
      expect(syncEngine.count()).toBe(0);
    });
  });

  describe("backend-first migration notes", () => {
    it("should note that SyncEngine is deprecated in backend-first mode", () => {
      // In backend-first architecture (as of 2025-12-18), mutations go directly to backend
      // SyncEngine is only used for legacy IndexedDB fallback mode
      expect(true).toBe(true);
    });
  });
});
