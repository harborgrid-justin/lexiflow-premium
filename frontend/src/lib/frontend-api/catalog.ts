import { client } from "./client";
import { toRecord } from "./guards";
import { type PaginatedResult, type Result } from "./types";

export interface Clause {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const catalogApi = {
  getAllClauses: async (
    params?: unknown
  ): Promise<Result<PaginatedResult<Clause>>> => {
    return client.get<PaginatedResult<Clause>>("/catalog/clauses", {
      params: toRecord(params),
    });
  },
  getAllTemplates: async (
    params?: unknown
  ): Promise<Result<PaginatedResult<Template>>> => {
    return client.get<PaginatedResult<Template>>("/catalog/templates", {
      params: toRecord(params),
    });
  },
};
