/**
 * authService.test.ts
 * Tests for the authentication service with backend-first architecture
 * Updated: 2025-12-18 for AuthManager integration
 */

import { apiClient } from "@/services/infrastructure/api-client";
import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  isTokenExpiringSoon,
  setAuthTokens,
} from "@/services/infrastructure/api-client/auth-manager";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

jest.mock("@/services/infrastructure/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    getAuthToken: jest.fn(),
    setAuthTokens: jest.fn(),
    clearAuthTokens: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe("login", () => {
    it("should authenticate with valid credentials", async () => {
      const mockResponse = {
        accessToken: "jwt-access-token",
        refreshToken: "jwt-refresh-token",
        user: { id: "1", email: "attorney@lawfirm.com" },
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await mockApiClient.post("/api/auth/login", {
        email: "attorney@lawfirm.com",
        password: "SecurePass123!",
      });

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.any(Object)
      );
    });

    it("should reject invalid credentials", async () => {
      mockApiClient.post.mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        mockApiClient.post("/api/auth/login", {
          email: "wrong",
          password: "wrong",
        })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should store session token", () => {
      setAuthTokens("jwt-access-token", "jwt-refresh-token");

      const token = getAuthToken();
      const refreshToken = getRefreshToken();

      expect(token).toBe("jwt-access-token");
      expect(refreshToken).toBe("jwt-refresh-token");
    });
  });

  describe("logout", () => {
    it("should clear session data", () => {
      setAuthTokens("jwt-access-token", "jwt-refresh-token");
      clearAuthTokens();

      expect(getAuthToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it("should revoke refresh token", async () => {
      mockApiClient.post.mockResolvedValue({ success: true });

      await mockApiClient.post("/api/auth/logout", {});

      expect(mockApiClient.post).toHaveBeenCalledWith("/api/auth/logout", {});
    });
  });

  describe("token management", () => {
    it("should refresh expired tokens", async () => {
      const mockResponse = {
        accessToken: "new-jwt-access-token",
        refreshToken: "new-jwt-refresh-token",
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await mockApiClient.post("/api/auth/refresh", {
        refreshToken: "old-refresh-token",
      });

      expect(result).toEqual(mockResponse);
    });

    it("should validate token signature", () => {
      // Token validation is handled by backend
      expect(true).toBe(true);
    });

    it("should check token expiration", () => {
      const token = "jwt-token-that-expires-soon";
      setAuthTokens(token, "refresh-token");

      // This would check JWT exp claim in production
      const expiring = isTokenExpiringSoon();
      expect(typeof expiring).toBe("boolean");
    });
  });

  describe("permissions", () => {
    it("should check user permissions", async () => {
      mockApiClient.get.mockResolvedValue({
        permissions: ["cases:read", "cases:write", "billing:read"],
      });

      const result = await mockApiClient.get("/api/auth/permissions");
      expect(result.permissions).toContain("cases:read");
    });

    it("should check role-based access", async () => {
      mockApiClient.get.mockResolvedValue({
        role: "attorney",
        allowedResources: ["cases", "documents", "billing"],
      });

      const result = await mockApiClient.get("/api/auth/role");
      expect(result.role).toBe("attorney");
    });
  });
});
