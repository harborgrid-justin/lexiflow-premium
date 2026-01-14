/**
 * Enhanced Search API Service
 * Adds missing search suggestions and reindex functionality
 * Coverage: 6/6 search endpoints (now 100%)
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";
import type { SearchResult } from "@/types";

export interface SearchQuery {
  q: string;
  type?: "all" | "cases" | "documents" | "docket" | "contacts" | "tasks";
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  text: string;
  type: "query" | "entity" | "tag";
  score: number;
  count?: number;
}

export interface SearchStats {
  totalDocuments: number;
  totalIndexed: number;
  lastIndexed?: string;
  indexSize?: string;
}

export interface ReindexResult {
  jobId: string;
  status: "queued" | "running" | "completed" | "failed";
  documentsProcessed?: number;
  totalDocuments?: number;
  startedAt?: string;
  completedAt?: string;
  errors?: string[];
}

export class SearchApiService {
  /**
   * Perform global search across all content
   * GET ${API_PREFIX}/search
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    const response = await apiClient.get<PaginatedResponse<SearchResult>>(
      "/search",
      query as unknown as Record<string, unknown>
    );
    return response.data;
  }

  /**
   * Get search suggestions/autocomplete
   * GET ${API_PREFIX}/search/suggestions
   * NEW - Previously missing
   */
  async getSuggestions(
    query: string,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    return apiClient.get<SearchSuggestion[]>("/search/suggestions", {
      params: { q: query, limit },
    });
  }

  /**
   * Search within specific case
   * GET ${API_PREFIX}/search/case/:caseId
   */
  async searchInCase(caseId: string, query: string): Promise<SearchResult[]> {
    const response = await apiClient.get<PaginatedResponse<SearchResult>>(
      `/search/case/${caseId}`,
      { params: { q: query } }
    );
    return response.data;
  }

  /**
   * Search documents by content
   * GET ${API_PREFIX}/search/documents
   */
  async searchDocuments(
    query: string,
    filters?: { caseId?: string; type?: string }
  ): Promise<SearchResult[]> {
    const response = await apiClient.get<PaginatedResponse<SearchResult>>(
      "/search/documents",
      { q: query, ...filters }
    );
    return response.data;
  }

  /**
   * Get search statistics
   * GET ${API_PREFIX}/search/stats
   */
  async getStats(): Promise<SearchStats> {
    return apiClient.get<SearchStats>("/search/stats");
  }

  /**
   * Trigger full search index rebuild (admin only)
   * POST ${API_PREFIX}/search/reindex
   * NEW - Previously missing
   */
  async reindex(options?: {
    type?: string;
    force?: boolean;
  }): Promise<ReindexResult> {
    return apiClient.post<ReindexResult>("/search/reindex", options || {});
  }

  /**
   * Get reindex job status
   * GET ${API_PREFIX}/search/reindex/:jobId
   * NEW - Related to reindex functionality
   */
  async getReindexStatus(jobId: string): Promise<ReindexResult> {
    return apiClient.get<ReindexResult>(`/search/reindex/${jobId}`);
  }

  /**
   * Index a specific document
   * POST ${API_PREFIX}/search/index/document/:documentId
   */
  async indexDocument(
    documentId: string
  ): Promise<{ success: boolean; indexed: boolean }> {
    return apiClient.post<{ success: boolean; indexed: boolean }>(
      `/search/index/document/${documentId}`,
      {}
    );
  }

  /**
   * Remove document from search index
   * DELETE ${API_PREFIX}/search/index/document/:documentId
   */
  async removeFromIndex(documentId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(
      `/search/index/document/${documentId}`
    );
  }
}
