/**
 * Example unit test for HTTP utilities
 */

import { describe, expect, it, vi } from "vitest";
import { HttpError, httpGet, httpPost } from "../../../lib/http";

describe("HTTP utilities", () => {
  it("makes GET requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: "test" }),
    });

    const result = await httpGet("/api/test");
    expect(result).toEqual({ data: "test" });
  });

  it("throws HttpError on failed requests", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(httpGet("/api/missing")).rejects.toThrow(HttpError);
  });

  it("makes POST requests with body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "123" }),
    });

    const result = await httpPost("/api/items", { name: "Test" });
    expect(result).toEqual({ id: "123" });
  });
});
