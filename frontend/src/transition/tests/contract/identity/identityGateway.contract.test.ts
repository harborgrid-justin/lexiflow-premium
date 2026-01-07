/**
 * Contract test for Identity Gateway
 * Verifies the API contract with the backend
 */

import { describe, expect, it } from "vitest";
import { identityGateway } from "../../../services/identity/api/identityGateway";

describe("Identity Gateway Contract", () => {
  it("login returns user with required fields", async () => {
    // Mock API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      }),
    });

    const user = await identityGateway.login({
      email: "test@example.com",
      password: "password",
    });

    // Verify contract
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("roles");
    expect(user).toHaveProperty("permissions");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("updatedAt");

    // Verify types
    expect(typeof user.id).toBe("string");
    expect(typeof user.email).toBe("string");
    expect(Array.isArray(user.roles)).toBe(true);
    expect(Array.isArray(user.permissions)).toBe(true);
  });

  it("getCurrentUser returns user or throws", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(identityGateway.getCurrentUser()).rejects.toThrow();
  });
});
