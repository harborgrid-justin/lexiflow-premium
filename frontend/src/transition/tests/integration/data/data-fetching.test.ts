/**
 * Integration test example - Data fetching
 */

import { describe, expect, it, vi } from "vitest";
import { queryClient } from "../../../services/data/client/queryClient";

describe("Data Fetching Integration", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("caches query results", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: "test" });

    // First call - should fetch
    const result1 = await queryClient.query(["test"], fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result1).toEqual({ data: "test" });

    // Second call - should use cache
    const result2 = await queryClient.query(["test"], fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1); // No additional call
    expect(result2).toEqual({ data: "test" });
  });

  it("handles query invalidation", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: "test" });

    await queryClient.query(["test"], fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Invalidate cache
    queryClient.invalidate(["test"]);

    // Next call should fetch again
    await queryClient.query(["test"], fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
