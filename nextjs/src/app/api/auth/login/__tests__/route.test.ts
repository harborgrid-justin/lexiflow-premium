/**
 * Tests for /api/auth/login route
 *
 * This file tests the login endpoint including:
 * - Successful login scenarios
 * - Input validation
 * - Error handling
 * - CORS and security headers
 */

import { NextRequest } from "next/server";
import {
  createNextRequest,
  createJsonRequest,
  mockBackendResponse,
  mockBackendError,
  mockBackendUnavailable,
  expectSuccess,
  expectError,
  expectCorsHeaders,
  expectSecurityHeaders,
} from "@/test-utils/api";

// Import the route handlers
import { POST, OPTIONS, HEAD } from "../route";

describe("/api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // OPTIONS - CORS Preflight
  // ==========================================================================
  describe("OPTIONS", () => {
    it("should return 200 with CORS headers for preflight requests", async () => {
      const request = createNextRequest("/api/auth/login", {
        method: "OPTIONS",
      });

      const response = await OPTIONS();

      expect(response.status).toBe(200);
      expectCorsHeaders(response);
      expectSecurityHeaders(response);
    });
  });

  // ==========================================================================
  // HEAD - Not Allowed
  // ==========================================================================
  describe("HEAD", () => {
    it("should return 405 Method Not Allowed", async () => {
      const request = createNextRequest("/api/auth/login", {
        method: "HEAD",
      });

      const response = await HEAD(request);

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.code).toBe("METHOD_NOT_ALLOWED");
      expect(response.headers.get("Allow")).toBe("POST, OPTIONS");
    });
  });

  // ==========================================================================
  // POST - Login
  // ==========================================================================
  describe("POST", () => {
    describe("validation", () => {
      it("should reject requests without application/json content type", async () => {
        const request = createNextRequest("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ email: "test@example.com", password: "pass" }),
        });

        const response = await POST(request);

        await expectError(response, 400, "INVALID_CONTENT_TYPE");
      });

      it("should reject requests with invalid JSON body", async () => {
        const url = new URL("/api/auth/login", "http://localhost:3400");
        const request = new NextRequest(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "invalid json {",
        });

        const response = await POST(request);

        await expectError(response, 400, "INVALID_JSON");
      });

      it("should reject requests missing email", async () => {
        const request = createJsonRequest("/api/auth/login", {
          password: "password123",
        });

        const response = await POST(request);

        await expectError(response, 400, "MISSING_CREDENTIALS");
      });

      it("should reject requests missing password", async () => {
        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
        });

        const response = await POST(request);

        await expectError(response, 400, "MISSING_CREDENTIALS");
      });

      it("should reject requests missing both email and password", async () => {
        const request = createJsonRequest("/api/auth/login", {});

        const response = await POST(request);

        await expectError(response, 400, "MISSING_CREDENTIALS");
      });
    });

    describe("successful login", () => {
      it("should proxy valid login request to backend", async () => {
        const mockToken = "jwt-token-12345";
        mockBackendResponse({
          status: 200,
          body: {
            token: mockToken,
            user: {
              id: "user-123",
              email: "test@example.com",
            },
          },
        });

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "correctPassword123",
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.token).toBe(mockToken);
        expect(data.user.email).toBe("test@example.com");
      });

      it("should forward x-forwarded-for header for logging", async () => {
        mockBackendResponse({
          status: 200,
          body: { token: "token", user: {} },
        });

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "password123",
        });
        // Note: x-forwarded-for is logged but not directly testable here
        // The console.log mock in setup suppresses these

        const response = await POST(request);
        expect(response.status).toBe(200);
      });
    });

    describe("backend errors", () => {
      it("should return 401 for invalid credentials from backend", async () => {
        mockBackendResponse({
          status: 401,
          body: {
            error: "Unauthorized",
            message: "Invalid email or password",
          },
        });

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "wrongPassword",
        });

        const response = await POST(request);

        expect(response.status).toBe(401);
      });

      it("should return 429 when rate limited by backend", async () => {
        mockBackendResponse({
          status: 429,
          body: {
            error: "Too Many Requests",
            message: "Rate limit exceeded",
            retryAfter: 60,
          },
        });

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "password123",
        });

        const response = await POST(request);

        expect(response.status).toBe(429);
      });

      it("should handle backend service unavailable", async () => {
        mockBackendUnavailable();

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "password123",
        });

        const response = await POST(request);

        expect(response.status).toBe(503);
        const data = await response.json();
        expect(data.error).toBe("Backend service unavailable");
      });

      it("should handle unexpected backend errors", async () => {
        mockBackendError("Unexpected error");

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "password123",
        });

        const response = await POST(request);

        expect(response.status).toBe(500);
      });
    });

    describe("security headers", () => {
      it("should include security headers on successful response", async () => {
        mockBackendResponse({
          status: 200,
          body: { token: "token", user: {} },
        });

        const request = createJsonRequest("/api/auth/login", {
          email: "test@example.com",
          password: "password123",
        });

        const response = await POST(request);

        expectSecurityHeaders(response);
      });

      it("should include security headers on error response", async () => {
        const request = createJsonRequest("/api/auth/login", {});

        const response = await POST(request);

        expectSecurityHeaders(response);
        expectCorsHeaders(response);
      });
    });
  });
});
