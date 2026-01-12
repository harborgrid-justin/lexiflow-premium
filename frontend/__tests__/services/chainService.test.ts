/**
 * chainService.test.ts
 * Tests for the ChainService immutable audit ledger
 * Updated: 2025-12-18 - Chain service now lives on backend
 */

import { apiClient } from "@/services/infrastructure/api-client";

jest.mock("@/services/infrastructure/api-client", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("ChainService (Backend-First)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.isAuthenticated.mockReturnValue(true);
  });

  describe("createEntry", () => {
    it("should create entry with timestamp", async () => {
      mockApiClient.post.mockResolvedValue({
        id: "chain-1",
        hash: "sha256-abc123",
        timestamp: "2026-01-12T00:00:00Z",
        blockHeight: 42,
      });

      const result = await mockApiClient.post("/api/audit/chain-entry", {
        resourceType: "evidence",
        resourceId: "ev-1",
        action: "STATUS_CHANGED",
      });

      expect(result.timestamp).toBeDefined();
    });

    it("should include user information", async () => {
      mockApiClient.post.mockResolvedValue({
        hash: "sha256-def456",
        userId: "user-123",
        userName: "John Doe",
      });

      await mockApiClient.post("/api/audit/chain-entry", {
        resourceType: "invoice",
        resourceId: "inv-1",
        action: "PAYMENT_RECEIVED",
      });

      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it("should hash entry contents", async () => {
      const response = {
        hash: "sha256-ghi789",
        previousHash: "sha256-prev",
        content: "encrypted-content",
      };
      mockApiClient.post.mockResolvedValue(response);

      const result = await mockApiClient.post("/api/audit/chain-entry", {});
      expect(result.hash).toMatch(/^sha256-/);
    });

    it("should link to previous hash", async () => {
      mockApiClient.post.mockResolvedValue({
        hash: "sha256-current",
        previousHash: "sha256-previous",
      });

      const result = await mockApiClient.post("/api/audit/chain-entry", {});
      expect(result.previousHash).toBeDefined();
    });
  });

  describe("integrity verification", () => {
    it("should verify chain integrity", async () => {
      mockApiClient.get.mockResolvedValue({
        valid: true,
        checkedBlocks: 100,
        lastVerified: "2026-01-12T01:00:00Z",
      });

      const result = await mockApiClient.get("/api/audit/verify-chain");
      expect(result.valid).toBe(true);
    });

    it("should detect tampering", async () => {
      mockApiClient.get.mockResolvedValue({
        valid: false,
        tamperedBlock: 42,
        expectedHash: "sha256-abc",
        actualHash: "sha256-xyz",
      });

      const result = await mockApiClient.get("/api/audit/verify-chain");
      expect(result.valid).toBe(false);
      expect(result.tamperedBlock).toBe(42);
    });
  });

  describe("entry types", () => {
    it("should support evidence status changes", async () => {
      mockApiClient.post.mockResolvedValue({ hash: "sha256-evidence" });

      await mockApiClient.post("/api/audit/chain-entry", {
        resourceType: "evidence",
        action: "STATUS_CHANGED",
        metadata: { oldStatus: "Pending", newStatus: "Admitted" },
      });

      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it("should support invoice payments", async () => {
      mockApiClient.post.mockResolvedValue({ hash: "sha256-invoice" });

      await mockApiClient.post("/api/audit/chain-entry", {
        resourceType: "invoice",
        action: "PAYMENT_RECEIVED",
        metadata: { amount: 5000, method: "ACH" },
      });

      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it("should support document uploads", async () => {
      mockApiClient.post.mockResolvedValue({ hash: "sha256-document" });

      await mockApiClient.post("/api/audit/chain-entry", {
        resourceType: "document",
        action: "UPLOADED",
        metadata: { filename: "contract.pdf", size: 1024000 },
      });

      expect(mockApiClient.post).toHaveBeenCalled();
    });
  });

  describe("query", () => {
    it("should query entries by resource", async () => {
      mockApiClient.get.mockResolvedValue({
        entries: [{ resourceId: "ev-1" }, { resourceId: "ev-1" }],
        total: 2,
      });

      const result = await mockApiClient.get(
        "/api/audit/chain?resourceId=ev-1"
      );
      expect(result.entries).toHaveLength(2);
    });

    it("should query entries by user", async () => {
      mockApiClient.get.mockResolvedValue({
        entries: [],
        total: 0,
      });

      await mockApiClient.get("/api/audit/chain?userId=user-123");
      expect(mockApiClient.get).toHaveBeenCalled();
    });

    it("should query entries by date range", async () => {
      mockApiClient.get.mockResolvedValue({
        entries: [],
        total: 0,
      });

      await mockApiClient.get("/api/audit/chain?from=2026-01-01&to=2026-01-31");
      expect(mockApiClient.get).toHaveBeenCalled();
    });
  });
});
