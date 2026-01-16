import { client } from "./client";
import { PaginatedResult, Result } from "./types";

export interface ResearchItem {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  tags: string[];
}

export interface Citation {
  id: string;
  citation: string;
  source: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
}

export const knowledgeApi = {
  getResearchHistory: async (
    params?: unknown
  ): Promise<Result<PaginatedResult<ResearchItem>>> => {
    return client.get<PaginatedResult<ResearchItem>>("/research/history", {
      params: params as Record<string, unknown>,
    });
  },
  getResearchById: async (id: string): Promise<Result<ResearchItem>> => {
    return client.get<ResearchItem>(`/research/${id}`);
  },
  getAllCitations: async (
    params?: unknown
  ): Promise<Result<PaginatedResult<Citation>>> => {
    return client.get<PaginatedResult<Citation>>("/citations", {
      params: params as Record<string, unknown>,
    });
  },
  createCitation: async (
    payload: Partial<Citation> & Record<string, unknown>
  ): Promise<Result<Citation>> => {
    return client.post<Citation>("/citations", payload);
  },
  updateCitation: async (
    id: string,
    payload: Partial<Citation> & Record<string, unknown>
  ): Promise<Result<Citation>> => {
    return client.patch<Citation>(`/citations/${id}`, payload);
  },
  deleteCitation: async (id: string): Promise<Result<void>> => {
    return client.delete<void>(`/citations/${id}`);
  },
  getAllKnowledge: async (
    params?: unknown
  ): Promise<Result<PaginatedResult<KnowledgeItem>>> => {
    return client.get<PaginatedResult<KnowledgeItem>>("/knowledge", {
      params: params as Record<string, unknown>,
    });
  },
};
