/**
 * Contract test for Identity Gateway
 * Verifies the API contract with the backend
 */

import { authGateway } from "@/services/data/api/gateways/authGateway";
import { describe, expect, it, vi } from "vitest";

describe("Identity Gateway Contract", () => {
  it("login returns success", async () => {
    // Mock API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    const response = await authGateway.login({
      email: "test@example.com",
      password: "password",
    });

    // Verify contract
    expect(response.success).toBe(true);
  });
});
