import { client } from "./client";
import { type PaginatedResult, type Result } from "./types";

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
    params?: unknown,
  ): Promise<Result<PaginatedResult<ResearchItem>>> => {
    return client.get<PaginatedResult<ResearchItem>>("/research/history", {
      params: params as Record<string, unknown>,
    });
  },
  getResearchById: async (id: string): Promise<Result<ResearchItem>> => {
    return client.get<ResearchItem>(`/research/${id}`);
  },
  createResearch: async (
    payload: Partial<ResearchItem> & Record<string, unknown>,
  ): Promise<Result<ResearchItem>> => {
    return client.post<ResearchItem>("/research", payload);
  },
  deleteResearch: async (id: string): Promise<Result<void>> => {
    return client.delete<void>(`/research/${id}`);
  },
  getAllCitations: async (
    params?: unknown,
  ): Promise<Result<PaginatedResult<Citation>>> => {
    return client.get<PaginatedResult<Citation>>("/citations", {
      params: params as Record<string, unknown>,
    });
  },
  createCitation: async (
    payload: Partial<Citation> & Record<string, unknown>,
  ): Promise<Result<Citation>> => {
    return client.post<Citation>("/citations", payload);
  },
  updateCitation: async (
    id: string,
    payload: Partial<Citation> & Record<string, unknown>,
  ): Promise<Result<Citation>> => {
    return client.patch<Citation>(`/citations/${id}`, payload);
  },
  deleteCitation: async (id: string): Promise<Result<void>> => {
    return client.delete<void>(`/citations/${id}`);
  },
  getAllKnowledge: async (
    params?: unknown,
  ): Promise<Result<PaginatedResult<KnowledgeItem>>> => {
    // Backend endpoint is /knowledge/articles not /knowledge
    const paramsObj = params as Record<string, unknown> | undefined;
    const page = typeof paramsObj?.page === "number" ? paramsObj.page : 1;
    const limit = typeof paramsObj?.limit === "number" ? paramsObj.limit : 50;

    const result = await client.get<{ data: KnowledgeItem[]; total: number }>(
      "/knowledge/articles",
      {
        params: paramsObj,
      },
    );

    // Transform backend response to PaginatedResult format
    if (result.ok) {
      const { data, total } = result.data;
      return {
        ok: true,
        data: {
          data,
          total,
          page,
          pageSize: limit,
          hasMore: page * limit < total,
        },
      };
    }

    return result as Result<PaginatedResult<KnowledgeItem>>;
  },
  deleteKnowledge: async (id: string): Promise<Result<void>> => {
    return client.delete<void>(`/knowledge/articles/${id}`);
  },
};
