/**
 * +---------------------------------------------------------------------------+
 * �                    LEXIFLOW RESEARCH DOMAIN SERVICE                       �
 * �                   Enterprise Legal Research Layer v2.0                    �
 * �                       PhD-Level Systems Architecture                      �
 * +---------------------------------------------------------------------------+
 *
 * @module services/domain/ResearchDomain
 * @architecture Backend-First Legal Research with API Integration
 * @author LexiFlow Engineering Team
 * @since 2025-12-22
 * @status PRODUCTION READY
 *
 * Provides case law search, citation validation, and legal research with
 * backend API integration for legal databases.
 */

import { apiClient } from "@/services/infrastructure/apiClient";

interface ResearchResult {
  id: string;
  title: string;
  citation: string;
  snippet: string;
  relevance: number;
  court?: string;
  year?: number;
}

interface CitationValidation {
  valid: boolean;
  citation?: string;
  suggestion?: string;
  format?: "bluebook" | "alwd" | "universal";
}

export const ResearchService = {
  getAll: async () => {
    return apiClient.get("/citations");
  },

  getById: async (id: string) => {
    return apiClient.get(`/citations/${id}`);
  },

  add: async (item: unknown) => {
    return apiClient.post("/citations", {
      ...(item && typeof item === "object" ? item : {}),
      createdAt: new Date().toISOString(),
    });
  },

  update: async (id: string, updates: unknown) => {
    return apiClient.patch(`/citations/${id}`, {
      ...(updates && typeof updates === "object" ? updates : {}),
      updatedAt: new Date().toISOString(),
    });
  },

  delete: async (id: string) => {
    await apiClient.delete(`/citations/${id}`);
  },

  // Research specific methods
  /**
   * Search case law using backend legal database API
   * Integrates with Westlaw, LexisNexis, or other legal databases
   */
  searchCases: async (query: string): Promise<ResearchResult[]> => {
    try {
      return await apiClient.get<ResearchResult[]>("/research/cases", {
        q: query,
      });
    } catch (error) {
      console.error("[ResearchService.searchCases] Backend error:", error);
      return [];
    }
  },

  searchStatutes: async (query: string): Promise<ResearchResult[]> => {
    try {
      return await apiClient.get<ResearchResult[]>("/research/statutes", {
        q: query,
      });
    } catch (error) {
      console.error("[ResearchService.searchStatutes] Backend error:", error);
      return [];
    }
  },

  getCitations: async (documentId: string): Promise<string[]> => {
    try {
      return await apiClient.get<string[]>(`/research/citations/${documentId}`);
    } catch (error) {
      console.error("[ResearchService.getCitations] Backend error:", error);
      return [];
    }
  },

  validateCitation: async (citation: string): Promise<CitationValidation> => {
    try {
      return await apiClient.post<CitationValidation>(
        "/research/validate-citation",
        { citation }
      );
    } catch (error) {
      console.error("[ResearchService.validateCitation] Backend error:", error);
      return {
        valid: false,
        suggestion: "Backend service unavailable",
        format: "universal",
      };
    }
  },

  getRelatedCases: async (caseId: string): Promise<ResearchResult[]> => {
    try {
      return await apiClient.get<ResearchResult[]>(
        `/research/related-cases/${caseId}`
      );
    } catch (error) {
      console.error("[ResearchService.getRelatedCases] Backend error:", error);
      return [];
    }
  },

  getHistory: async (): Promise<unknown[]> => {
    try {
      return await apiClient.get<unknown[]>("/research/history");
    } catch (error) {
      console.error("[ResearchService.getHistory] Backend error:", error);
      return [];
    }
  },
};
