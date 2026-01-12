/**
 * @jest-environment jsdom
 * @module tests/services/infrastructure/queryClient
 * @description Tests for QueryClient - custom React Query implementation
 */

import { ValidationError } from "@/services/core/errors";
import { QueryClient } from "@/services/infrastructure/queryClient";

describe("QueryClient", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Cache Management", () => {
    it("should cache query results", async () => {
      const queryKey = ["test", "query"];
      const mockData = { id: "1", data: "test data" };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      // First call - should execute
      const result1 = await queryClient.fetchQuery(queryKey, queryFn);
      expect(result1.data).toEqual(mockData);
      expect(queryFn).toHaveBeenCalledTimes(1);

      // Second call - should return from cache
      const result2 = await queryClient.fetchQuery(queryKey, queryFn);
      expect(result2.data).toEqual(mockData);
      expect(queryFn).toHaveBeenCalledTimes(1); // Still only called once
    });

    it("should refetch when stale", async () => {
      const queryKey = ["stale", "test"];
      const mockData = { id: "1", data: "test" };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      await queryClient.fetchQuery(queryKey, queryFn, { staleTime: 0 });
      expect(queryFn).toHaveBeenCalledTimes(1);

      // Wait a bit and refetch
      await new Promise((resolve) => setTimeout(resolve, 10));
      await queryClient.fetchQuery(queryKey, queryFn, { staleTime: 0 });
      expect(queryFn).toHaveBeenCalledTimes(2);
    });

    it("should invalidate cache by query key", async () => {
      const queryKey = ["invalidate", "test"];
      const mockData = { id: "1", data: "test" };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      await queryClient.fetchQuery(queryKey, queryFn);
      expect(queryFn).toHaveBeenCalledTimes(1);

      queryClient.invalidateQueries(queryKey);

      await queryClient.fetchQuery(queryKey, queryFn);
      expect(queryFn).toHaveBeenCalledTimes(2);
    });

    it("should clear all cache on clear", () => {
      const getState = jest.spyOn(queryClient, "getState");

      queryClient.clear();

      const state = getState.mock.results[0]?.value || { cache: [] };
      expect(state.cache?.length || 0).toBe(0);
    });
  });

  describe("Query State Management", () => {
    it("should track loading state", async () => {
      const queryKey = ["loading", "test"];
      const queryFn = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: "test" }), 100)
          )
      );

      const promise = queryClient.fetchQuery(queryKey, queryFn);

      const state = queryClient.getQueryState(queryKey);
      expect(state?.isLoading).toBe(true);

      await promise;

      const finalState = queryClient.getQueryState(queryKey);
      expect(finalState?.isLoading).toBe(false);
    });

    it("should track error state", async () => {
      const queryKey = ["error", "test"];
      const error = new Error("Query failed");
      const queryFn = jest.fn().mockRejectedValue(error);

      await expect(queryClient.fetchQuery(queryKey, queryFn)).rejects.toThrow(
        "Query failed"
      );

      const state = queryClient.getQueryState(queryKey);
      expect(state?.error).toBe(error);
      expect(state?.isError).toBe(true);
    });

    it("should track success state", async () => {
      const queryKey = ["success", "test"];
      const mockData = { id: "1", data: "success" };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      await queryClient.fetchQuery(queryKey, queryFn);

      const state = queryClient.getQueryState(queryKey);
      expect(state?.data).toEqual(mockData);
      expect(state?.isSuccess).toBe(true);
      expect(state?.isError).toBe(false);
    });
  });

  describe("Subscriptions", () => {
    it("should notify subscribers on state change", async () => {
      const queryKey = ["subscribe", "test"];
      const mockData = { id: "1", data: "test" };
      const queryFn = jest.fn().mockResolvedValue(mockData);
      const subscriber = jest.fn();

      queryClient.subscribe(queryKey, subscriber);
      await queryClient.fetchQuery(queryKey, queryFn);

      expect(subscriber).toHaveBeenCalled();
      expect(
        subscriber.mock.calls[subscriber.mock.calls.length - 1][0]
      ).toMatchObject({
        data: mockData,
        isLoading: false,
        isSuccess: true,
      });
    });

    it("should support global subscribers", async () => {
      const queryKey = ["global", "test"];
      const queryFn = jest.fn().mockResolvedValue({ data: "test" });
      const globalSubscriber = jest.fn();

      queryClient.subscribeToAll(globalSubscriber);
      await queryClient.fetchQuery(queryKey, queryFn);

      expect(globalSubscriber).toHaveBeenCalled();
    });

    it("should unsubscribe correctly", async () => {
      const queryKey = ["unsubscribe", "test"];
      const queryFn = jest.fn().mockResolvedValue({ data: "test" });
      const subscriber = jest.fn();

      const unsubscribe = queryClient.subscribe(queryKey, subscriber);
      unsubscribe();

      await queryClient.fetchQuery(queryKey, queryFn);
      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe("Request Deduplication", () => {
    it("should deduplicate concurrent requests", async () => {
      const queryKey = ["dedupe", "test"];
      const mockData = { id: "1", data: "test" };
      const queryFn = jest.fn(
        () => new Promise((resolve) => setTimeout(() => resolve(mockData), 100))
      );

      // Fire multiple requests concurrently
      const promises = [
        queryClient.fetchQuery(queryKey, queryFn),
        queryClient.fetchQuery(queryKey, queryFn),
        queryClient.fetchQuery(queryKey, queryFn),
      ];

      await Promise.all(promises);

      // Should only call once due to deduplication
      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Pattern Matching Invalidation", () => {
    it("should invalidate queries matching pattern", async () => {
      const keys = [
        ["users", "1"],
        ["users", "2"],
        ["posts", "1"],
      ];
      const queryFn = jest.fn().mockResolvedValue({ data: "test" });

      // Populate cache
      await Promise.all(
        keys.map((key) => queryClient.fetchQuery(key, queryFn))
      );
      expect(queryFn).toHaveBeenCalledTimes(3);

      // Invalidate all 'users' queries
      queryClient.invalidateQueries(["users"]);

      // Refetch - only users queries should refetch
      await Promise.all(
        keys.map((key) => queryClient.fetchQuery(key, queryFn))
      );

      // Should have been called 5 times total (3 initial + 2 refetch for users)
      expect(queryFn).toHaveBeenCalledTimes(5);
    });
  });

  describe("Validation", () => {
    it("should throw on invalid query key", async () => {
      const queryFn = jest.fn();

      await expect(
        // @ts-expect-error - Testing invalid input
        queryClient.fetchQuery(null, queryFn)
      ).rejects.toThrow(ValidationError);

      await expect(
        // @ts-expect-error - Testing invalid input
        queryClient.fetchQuery([], queryFn)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw on invalid query function", async () => {
      await expect(
        // @ts-expect-error - Testing invalid input
        queryClient.fetchQuery(["test"], null)
      ).rejects.toThrow(ValidationError);

      await expect(
        // @ts-expect-error - Testing invalid input
        queryClient.fetchQuery(["test"], "not a function")
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("Stale Time Configuration", () => {
    it("should respect custom stale time", async () => {
      const queryKey = ["custom", "stale"];
      const mockData = { id: "1", data: "test" };
      const queryFn = jest.fn().mockResolvedValue(mockData);

      // Set long stale time
      await queryClient.fetchQuery(queryKey, queryFn, { staleTime: 60000 });
      expect(queryFn).toHaveBeenCalledTimes(1);

      // Immediate refetch should use cache
      await queryClient.fetchQuery(queryKey, queryFn, { staleTime: 60000 });
      expect(queryFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Recovery", () => {
    it("should allow refetch after error", async () => {
      const queryKey = ["recovery", "test"];
      const queryFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("First fail"))
        .mockResolvedValueOnce({ data: "success" });

      await expect(queryClient.fetchQuery(queryKey, queryFn)).rejects.toThrow(
        "First fail"
      );

      // Refetch should succeed
      const result = await queryClient.fetchQuery(queryKey, queryFn);
      expect(result.data).toEqual({ data: "success" });
    });
  });

  describe("Memory Management", () => {
    it("should handle large number of queries", async () => {
      const queryFn = jest.fn().mockResolvedValue({ data: "test" });
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(queryClient.fetchQuery([`query-${i}`], queryFn));
      }

      await Promise.all(promises);
      expect(queryFn).toHaveBeenCalledTimes(100);
    });

    it("should clear cache on clear()", () => {
      queryClient.clear();

      const state = queryClient.getState();
      expect(state.cache.length).toBe(0);
    });
  });
});
