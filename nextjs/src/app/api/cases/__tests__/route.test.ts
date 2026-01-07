/**
 * Tests for /api/cases route
 *
 * This file tests the cases endpoint including:
 * - Authentication requirements
 * - CRUD operations (GET, POST, PUT, PATCH, DELETE)
 * - Input validation
 * - Error handling
 * - CORS and security headers
 */

import {
  createNextRequest,
  createAuthenticatedRequest,
  createJsonRequest,
  mockBackendResponse,
  mockBackendError,
  mockBackendUnavailable,
  expectSuccess,
  expectError,
  expectCorsHeaders,
  expectSecurityHeaders,
  createTestUser,
  createTestAdmin,
  mockData,
} from "@/test-utils/api";

// Import the route handlers
import { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } from "../route";

describe("/api/cases", () => {
  const testUser = createTestUser();
  const adminUser = createTestAdmin();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // OPTIONS - CORS Preflight
  // ==========================================================================
  describe("OPTIONS", () => {
    it("should return 200 with CORS headers", async () => {
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
      const request = createNextRequest("/api/cases", { method: "HEAD" });
      const response = await HEAD(request);

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.code).toBe("METHOD_NOT_ALLOWED");
      expect(response.headers.get("Allow")).toContain("GET");
      expect(response.headers.get("Allow")).toContain("POST");
    });
  });

  // ==========================================================================
  // Authentication Tests
  // ==========================================================================
  describe("authentication", () => {
    it("should reject GET requests without authorization header", async () => {
      const request = createNextRequest("/api/cases", { method: "GET" });
      const response = await GET(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject POST requests without authorization header", async () => {
      const request = createJsonRequest("/api/cases", { title: "Test Case" });
      const response = await POST(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject requests with invalid authorization format", async () => {
      const request = createNextRequest("/api/cases", {
        method: "GET",
        headers: { Authorization: "InvalidFormat token123" },
      });
      const response = await GET(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject requests with empty Bearer token", async () => {
      const request = createNextRequest("/api/cases", {
        method: "GET",
        headers: { Authorization: "Bearer " },
      });
      const response = await GET(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });
  });

  // ==========================================================================
  // GET - List/Retrieve Cases
  // ==========================================================================
  describe("GET", () => {
    it("should return cases list for authenticated user", async () => {
      const mockCases = [mockData.case, { ...mockData.case, id: "case-456" }];
      mockBackendResponse({
        status: 200,
        body: { cases: mockCases, total: 2 },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.cases).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it("should forward query parameters to backend", async () => {
      mockBackendResponse({
        status: 200,
        body: { cases: [], total: 0 },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "GET",
          searchParams: {
            status: "open",
            page: "1",
            limit: "10",
          },
        }
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Verify fetch was called with query params
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=open"),
        expect.any(Object)
      );
    });

    it("should return empty array when no cases exist", async () => {
      mockBackendResponse({
        status: 200,
        body: { cases: [], total: 0 },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.cases).toHaveLength(0);
    });

    it("should handle backend errors gracefully", async () => {
      mockBackendError("Database connection failed");

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.code).toBe("INTERNAL_ERROR");
    });
  });

  // ==========================================================================
  // POST - Create Case
  // ==========================================================================
  describe("POST", () => {
    describe("validation", () => {
      it("should reject requests without content-type header", async () => {
        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: { title: "Test" },
          }
        );
        const response = await POST(request);

        await expectError(response, 400, "INVALID_CONTENT_TYPE");
      });

      it("should reject requests with invalid JSON", async () => {
        const url = new URL("/api/cases", "http://localhost:3400");
        const request = new (await import("next/server")).NextRequest(
          url.toString(),
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${testUser.token}`,
              "Content-Type": "application/json",
            },
            body: "{ invalid json",
          }
        );

        const response = await POST(request);
        await expectError(response, 400, "INVALID_JSON");
      });

      it("should reject requests without title", async () => {
        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            body: { description: "No title provided" },
          }
        );
        const response = await POST(request);

        await expectError(response, 400, "MISSING_TITLE");
      });

      it("should reject requests with empty title", async () => {
        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            body: { title: "" },
          }
        );
        const response = await POST(request);

        await expectError(response, 400, "MISSING_TITLE");
      });

      it("should reject requests with whitespace-only title", async () => {
        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            body: { title: "   " },
          }
        );
        const response = await POST(request);

        await expectError(response, 400, "MISSING_TITLE");
      });
    });

    describe("successful creation", () => {
      it("should create a new case", async () => {
        const newCase = {
          id: "case-new-123",
          title: "New Test Case",
          status: "open",
          createdAt: new Date().toISOString(),
        };
        mockBackendResponse({
          status: 201,
          body: newCase,
        });

        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            body: { title: "New Test Case" },
          }
        );
        const response = await POST(request);

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.title).toBe("New Test Case");
        expect(data.id).toBeDefined();
      });

      it("should accept additional case properties", async () => {
        mockBackendResponse({
          status: 201,
          body: { ...mockData.case, title: "Full Case" },
        });

        const request = createAuthenticatedRequest(
          "/api/cases",
          testUser.token,
          {
            method: "POST",
            body: {
              title: "Full Case",
              description: "A comprehensive test case",
              clientId: "client-123",
              priority: "high",
            },
          }
        );
        const response = await POST(request);

        expect(response.status).toBe(201);
      });
    });
  });

  // ==========================================================================
  // PUT - Update Case
  // ==========================================================================
  describe("PUT", () => {
    it("should reject unauthenticated requests", async () => {
      const request = createJsonRequest("/api/cases", {
        id: "case-123",
        title: "Updated",
      });
      // Override method
      const putRequest = createNextRequest("/api/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: { id: "case-123", title: "Updated" },
      });

      const response = await PUT(putRequest);
      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should update an existing case", async () => {
      mockBackendResponse({
        status: 200,
        body: { ...mockData.case, title: "Updated Title" },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "PUT",
          body: { id: "case-123", title: "Updated Title" },
        }
      );
      const response = await PUT(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.title).toBe("Updated Title");
    });

    it("should reject invalid content type", async () => {
      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "PUT",
          headers: { "Content-Type": "text/plain" },
          body: { title: "Test" },
        }
      );
      const response = await PUT(request);

      await expectError(response, 400, "INVALID_CONTENT_TYPE");
    });
  });

  // ==========================================================================
  // PATCH - Partial Update
  // ==========================================================================
  describe("PATCH", () => {
    it("should reject empty patch body", async () => {
      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "PATCH",
          body: {},
        }
      );
      const response = await PATCH(request);

      await expectError(response, 400, "EMPTY_BODY");
    });

    it("should apply partial updates", async () => {
      mockBackendResponse({
        status: 200,
        body: { ...mockData.case, status: "closed" },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "PATCH",
          body: { status: "closed" },
        }
      );
      const response = await PATCH(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("closed");
    });

    it("should reject unauthenticated requests", async () => {
      const request = createNextRequest("/api/cases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status: "closed" },
      });
      const response = await PATCH(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });
  });

  // ==========================================================================
  // DELETE - Delete Case
  // ==========================================================================
  describe("DELETE", () => {
    it("should reject unauthenticated requests", async () => {
      const request = createNextRequest("/api/cases", {
        method: "DELETE",
        searchParams: { id: "case-123" },
      });
      const response = await DELETE(request);

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should delete a case", async () => {
      mockBackendResponse({
        status: 204,
        body: null,
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "DELETE",
          searchParams: { id: "case-123" },
        }
      );
      const response = await DELETE(request);

      // Backend returns 204, but our proxy may normalize this
      expect([200, 204]).toContain(response.status);
    });

    it("should handle case not found", async () => {
      mockBackendResponse({
        status: 404,
        body: { error: "Not Found", message: "Case not found" },
      });

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        {
          method: "DELETE",
          searchParams: { id: "nonexistent" },
        }
      );
      const response = await DELETE(request);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================
  describe("error handling", () => {
    it("should handle backend timeout", async () => {
      const timeoutError = new Error("Request timeout");
      timeoutError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValue(timeoutError);

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request);

      expect(response.status).toBe(504);
    });

    it("should handle backend service unavailable", async () => {
      mockBackendUnavailable();

      const request = createAuthenticatedRequest(
        "/api/cases",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request);

      expect(response.status).toBe(503);
    });

    it("should include security headers on all error responses", async () => {
      const request = createNextRequest("/api/cases", { method: "GET" });
      const response = await GET(request);

      expectSecurityHeaders(response);
      expectCorsHeaders(response);
    });
  });
});
