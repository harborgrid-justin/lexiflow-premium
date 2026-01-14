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
    params?: any
  ): Promise<Result<PaginatedResult<ResearchItem>>> => {
    return client.get<PaginatedResult<ResearchItem>>(
      "/research/history",
      params
    );
  },
  getResearchById: async (id: string): Promise<Result<ResearchItem>> => {
    return client.get<ResearchItem>(`/research/${id}`);
  },
  getAllCitations: async (
    params?: any
  ): Promise<Result<PaginatedResult<Citation>>> => {
    return client.get<PaginatedResult<Citation>>("/citations", params);
  },
  getAllKnowledge: async (
    params?: any
  ): Promise<Result<PaginatedResult<KnowledgeItem>>> => {
    return client.get<PaginatedResult<KnowledgeItem>>("/knowledge", params);
  },
};
