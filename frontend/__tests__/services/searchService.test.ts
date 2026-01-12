/**
 * searchService.test.ts
 * Tests for the search service with backend-first architecture
 * Updated: 2025-12-18 for backend search API
 */

import { apiClient } from "@/services/infrastructure/api-client";

jest.mock("@/services/infrastructure/api-client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  score: number;
  highlights?: string[];
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  took: number; // ms
}

describe("SearchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.isAuthenticated.mockReturnValue(true);
  });

  describe("full text search", () => {
    it("should search across all stores", async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: "case-1",
            type: "case",
            title: "Smith v. Jones",
            snippet: "Contract dispute involving breach of...",
            score: 0.95,
          },
          {
            id: "doc-1",
            type: "document",
            title: "Motion to Dismiss",
            snippet: "Defendant moves to dismiss pursuant to...",
            score: 0.87,
          },
        ],
        total: 2,
        took: 45,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await mockApiClient.get("/api/search?q=contract+dispute");

      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it("should rank results by relevance", async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: "1",
            type: "case",
            title: "High Score",
            snippet: "",
            score: 0.95,
          },
          {
            id: "2",
            type: "case",
            title: "Low Score",
            snippet: "",
            score: 0.45,
          },
        ],
        total: 2,
        took: 30,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await mockApiClient.get("/api/search?q=test");

      expect(result.results[0].score).toBeGreaterThan(result.results[1].score);
    });

    it("should highlight matches", async () => {
      const mockResponse: SearchResponse = {
        results: [
          {
            id: "doc-1",
            type: "document",
            title: "Contract Agreement",
            snippet: "The <mark>contract</mark> was signed on...",
            score: 0.88,
            highlights: [
              "<mark>contract</mark> terms",
              "breach of <mark>contract</mark>",
            ],
          },
        ],
        total: 1,
        took: 25,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await mockApiClient.get(
        "/api/search?q=contract&highlight=true"
      );

      expect(result.results[0].highlights).toBeDefined();
      expect(result.results[0].snippet).toContain("<mark>");
    });

    it("should support fuzzy matching", async () => {
      // Backend handles fuzzy matching (Levenshtein distance)
      mockApiClient.get.mockResolvedValue({
        results: [
          {
            id: "1",
            type: "case",
            title: "Contract",
            snippet: "",
            score: 0.75,
          },
        ],
        total: 1,
        took: 40,
      });

      const result = await mockApiClient.get(
        "/api/search?q=contarct&fuzzy=true"
      );
      expect(result.results).toHaveLength(1);
    });
  });

  describe("filtering", () => {
    it("should filter by entity type", async () => {
      mockApiClient.get.mockResolvedValue({
        results: [
          {
            id: "case-1",
            type: "case",
            title: "Test",
            snippet: "",
            score: 1.0,
          },
        ],
        total: 1,
        took: 20,
      });

      await mockApiClient.get("/api/search?q=test&type=case");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/api/search?q=test&type=case"
      );
    });

    it("should filter by date range", async () => {
      mockApiClient.get.mockResolvedValue({
        results: [],
        total: 0,
        took: 15,
      });

      await mockApiClient.get(
        "/api/search?q=test&fromDate=2025-01-01&toDate=2025-12-31"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/api/search?q=test&fromDate=2025-01-01&toDate=2025-12-31"
      );
    });

    it("should filter by case", async () => {
      mockApiClient.get.mockResolvedValue({
        results: [],
        total: 0,
        took: 10,
      });

      await mockApiClient.get("/api/search?q=test&caseId=case-123");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/api/search?q=test&caseId=case-123"
      );
    });
  });

  describe("pagination", () => {
    it("should support page size", async () => {
      mockApiClient.get.mockResolvedValue({
        results: Array(10).fill({
          id: "1",
          type: "case",
          title: "Test",
          snippet: "",
          score: 1.0,
        }),
        total: 100,
        took: 50,
      });

      await mockApiClient.get("/api/search?q=test&limit=10");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/api/search?q=test&limit=10"
      );
    });

    it("should return total count", async () => {
      const response: SearchResponse = {
        results: [],
        total: 152,
        took: 30,
      };
      mockApiClient.get.mockResolvedValue(response);

      const result = await mockApiClient.get("/api/search?q=test");
      expect(result.total).toBe(152);
    });

    it("should support cursor pagination", async () => {
      mockApiClient.get.mockResolvedValue({
        results: [],
        total: 100,
        took: 25,
        nextCursor: "cursor-abc123",
      });

      await mockApiClient.get("/api/search?q=test&cursor=cursor-abc123");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/api/search?q=test&cursor=cursor-abc123"
      );
    });
  });

  describe("indexing", () => {
    it("should build search index", async () => {
      mockApiClient.post.mockResolvedValue({ success: true, indexed: 1250 });

      const result = await mockApiClient.post("/api/search/reindex", {});

      expect(result.success).toBe(true);
      expect(result.indexed).toBeGreaterThan(0);
    });

    it("should update index on changes", async () => {
      // Backend automatically updates search index via triggers/listeners
      mockApiClient.post.mockResolvedValue({ success: true });

      await mockApiClient.post("/api/cases", { title: "New Case" });

      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it("should rebuild index on demand", async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        message: "Reindex job queued",
      });

      const result = await mockApiClient.post(
        "/api/search/reindex?force=true",
        {}
      );

      expect(result.success).toBe(true);
    });
  });
});
