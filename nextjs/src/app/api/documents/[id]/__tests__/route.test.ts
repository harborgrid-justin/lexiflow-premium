/**
 * Tests for /api/documents/[id] route
 *
 * This file tests the dynamic document endpoint including:
 * - Dynamic route parameter handling (Next.js 16 async params)
 * - Authentication requirements
 * - CRUD operations for specific documents
 * - Parameter validation
 * - Error handling
 */

import { NextRequest } from "next/server";
import {
  createNextRequest,
  createAuthenticatedRequest,
  mockBackendResponse,
  mockBackendError,
  mockBackendUnavailable,
  expectError,
  expectCorsHeaders,
  expectSecurityHeaders,
  createTestUser,
  mockData,
} from "@/test-utils/api";

// Import the route handlers
import { GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD } from "../route";

describe("/api/documents/[id]", () => {
  const testUser = createTestUser();
  const documentId = "doc-test-123";

  // Helper to create route params (Next.js 16 async params)
  const createParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

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
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "HEAD",
      });
      const response = await HEAD(request);

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.code).toBe("METHOD_NOT_ALLOWED");
      expect(response.headers.get("Allow")).toContain("GET");
    });
  });

  // ==========================================================================
  // Parameter Validation
  // ==========================================================================
  describe("parameter validation", () => {
    it("should reject requests with empty ID parameter", async () => {
      const request = createAuthenticatedRequest(
        "/api/documents/",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(""));

      await expectError(response, 400, "INVALID_ID");
    });

    it("should reject requests with whitespace-only ID", async () => {
      const request = createAuthenticatedRequest(
        "/api/documents/   ",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams("   "));

      await expectError(response, 400, "INVALID_ID");
    });

    it("should accept valid document IDs", async () => {
      mockBackendResponse({
        status: 200,
        body: mockData.document,
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(documentId));

      expect(response.status).toBe(200);
    });

    it("should handle UUID format IDs", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      mockBackendResponse({
        status: 200,
        body: { ...mockData.document, id: uuidId },
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${uuidId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(uuidId));

      expect(response.status).toBe(200);
    });
  });

  // ==========================================================================
  // Authentication Tests
  // ==========================================================================
  describe("authentication", () => {
    it("should reject GET without authentication", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "GET",
      });
      const response = await GET(request, createParams(documentId));

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject PUT without authentication", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: { name: "Updated" },
      });
      const response = await PUT(request, createParams(documentId));

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject PATCH without authentication", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { name: "Patched" },
      });
      const response = await PATCH(request, createParams(documentId));

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject DELETE without authentication", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      const response = await DELETE(request, createParams(documentId));

      await expectError(response, 401, "AUTH_REQUIRED");
    });

    it("should reject POST without authentication", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { title: "Test" },
      });
      const response = await POST(request, createParams(documentId));

      await expectError(response, 401, "AUTH_REQUIRED");
    });
  });

  // ==========================================================================
  // GET - Retrieve Document
  // ==========================================================================
  describe("GET", () => {
    it("should return document for valid ID", async () => {
      mockBackendResponse({
        status: 200,
        body: mockData.document,
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(documentId));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe(mockData.document.id);
      expect(data.name).toBe(mockData.document.name);
    });

    it("should return 404 for non-existent document", async () => {
      mockBackendResponse({
        status: 404,
        body: {
          error: "Not Found",
          message: "Document not found",
        },
      });

      const request = createAuthenticatedRequest(
        "/api/documents/nonexistent-id",
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams("nonexistent-id"));

      expect(response.status).toBe(404);
    });

    it("should forward query parameters to backend", async () => {
      mockBackendResponse({
        status: 200,
        body: mockData.document,
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "GET",
          searchParams: { include: "versions,metadata" },
        }
      );
      const response = await GET(request, createParams(documentId));

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("include="),
        expect.any(Object)
      );
    });
  });

  // ==========================================================================
  // PUT - Update Document
  // ==========================================================================
  describe("PUT", () => {
    it("should update document with valid data", async () => {
      const updatedDoc = { ...mockData.document, name: "Updated.pdf" };
      mockBackendResponse({
        status: 200,
        body: updatedDoc,
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "PUT",
          body: { name: "Updated.pdf" },
        }
      );
      const response = await PUT(request, createParams(documentId));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe("Updated.pdf");
    });

    it("should reject invalid content type", async () => {
      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "PUT",
          headers: { "Content-Type": "text/plain" },
          body: { name: "Test" },
        }
      );
      const response = await PUT(request, createParams(documentId));

      await expectError(response, 400, "INVALID_CONTENT_TYPE");
    });

    it("should reject invalid JSON body", async () => {
      const url = new URL(
        `/api/documents/${documentId}`,
        "http://localhost:3400"
      );
      const request = new NextRequest(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${testUser.token}`,
          "Content-Type": "application/json",
        },
        body: "invalid json {",
      });

      const response = await PUT(request, createParams(documentId));
      await expectError(response, 400, "INVALID_JSON");
    });
  });

  // ==========================================================================
  // PATCH - Partial Update Document
  // ==========================================================================
  describe("PATCH", () => {
    it("should apply partial update", async () => {
      mockBackendResponse({
        status: 200,
        body: { ...mockData.document, type: "application/docx" },
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "PATCH",
          body: { type: "application/docx" },
        }
      );
      const response = await PATCH(request, createParams(documentId));

      expect(response.status).toBe(200);
    });

    it("should reject empty patch body", async () => {
      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "PATCH",
          body: {},
        }
      );
      const response = await PATCH(request, createParams(documentId));

      await expectError(response, 400, "EMPTY_BODY");
    });

    it("should validate ID before processing body", async () => {
      const request = createAuthenticatedRequest(
        "/api/documents/",
        testUser.token,
        {
          method: "PATCH",
          body: { name: "Test" },
        }
      );
      const response = await PATCH(request, createParams(""));

      // Should fail on ID validation before body validation
      await expectError(response, 400, "INVALID_ID");
    });
  });

  // ==========================================================================
  // DELETE - Delete Document
  // ==========================================================================
  describe("DELETE", () => {
    it("should delete document", async () => {
      mockBackendResponse({
        status: 204,
        body: null,
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "DELETE" }
      );
      const response = await DELETE(request, createParams(documentId));

      // 200 or 204 are both acceptable
      expect([200, 204]).toContain(response.status);
    });

    it("should return 404 when deleting non-existent document", async () => {
      mockBackendResponse({
        status: 404,
        body: { error: "Not Found", message: "Document not found" },
      });

      const request = createAuthenticatedRequest(
        "/api/documents/nonexistent",
        testUser.token,
        { method: "DELETE" }
      );
      const response = await DELETE(request, createParams("nonexistent"));

      expect(response.status).toBe(404);
    });

    it("should return 403 when user lacks permission", async () => {
      mockBackendResponse({
        status: 403,
        body: { error: "Forbidden", message: "Not authorized to delete" },
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "DELETE" }
      );
      const response = await DELETE(request, createParams(documentId));

      expect(response.status).toBe(403);
    });
  });

  // ==========================================================================
  // POST - Create Sub-resource
  // ==========================================================================
  describe("POST", () => {
    it("should create resource with valid title", async () => {
      mockBackendResponse({
        status: 201,
        body: { id: "new-123", title: "New Document" },
      });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "POST",
          body: { title: "New Document" },
        }
      );
      const response = await POST(request, createParams(documentId));

      expect(response.status).toBe(201);
    });

    it("should reject missing title", async () => {
      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "POST",
          body: { description: "No title" },
        }
      );
      const response = await POST(request, createParams(documentId));

      await expectError(response, 400, "MISSING_TITLE");
    });

    it("should reject empty title", async () => {
      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        {
          method: "POST",
          body: { title: "" },
        }
      );
      const response = await POST(request, createParams(documentId));

      await expectError(response, 400, "MISSING_TITLE");
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================
  describe("error handling", () => {
    it("should handle backend service unavailable", async () => {
      mockBackendUnavailable();

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(documentId));

      expect(response.status).toBe(503);
    });

    it("should handle unexpected backend errors", async () => {
      mockBackendError("Unexpected database error");

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(documentId));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.code).toBe("INTERNAL_ERROR");
    });

    it("should include security headers on all responses", async () => {
      mockBackendResponse({ status: 200, body: mockData.document });

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, createParams(documentId));

      expectSecurityHeaders(response);
    });

    it("should include CORS headers on error responses", async () => {
      const request = createNextRequest(`/api/documents/${documentId}`, {
        method: "GET",
      });
      const response = await GET(request, createParams(documentId));

      expectCorsHeaders(response);
      expectSecurityHeaders(response);
    });
  });

  // ==========================================================================
  // Async Params Handling (Next.js 16)
  // ==========================================================================
  describe("Next.js 16 async params", () => {
    it("should properly await params before use", async () => {
      mockBackendResponse({ status: 200, body: mockData.document });

      const asyncParams = {
        params: new Promise<{ id: string }>((resolve) => {
          setTimeout(() => resolve({ id: documentId }), 10);
        }),
      };

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );
      const response = await GET(request, asyncParams);

      expect(response.status).toBe(200);
    });

    it("should handle rejected params promise gracefully", async () => {
      const rejectedParams = {
        params: Promise.reject(new Error("Params resolution failed")),
      };

      const request = createAuthenticatedRequest(
        `/api/documents/${documentId}`,
        testUser.token,
        { method: "GET" }
      );

      // The error should be caught and return 500
      const response = await GET(request, rejectedParams);
      expect(response.status).toBe(500);
    });
  });
});
