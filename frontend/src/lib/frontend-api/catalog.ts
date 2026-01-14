import { client } from "./client";
import { PaginatedResult, Result } from "./types";

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
    params?: any
  ): Promise<Result<PaginatedResult<Clause>>> => {
    return client.get<PaginatedResult<Clause>>("/catalog/clauses", params);
  },
  getAllTemplates: async (
    params?: any
  ): Promise<Result<PaginatedResult<Template>>> => {
    return client.get<PaginatedResult<Template>>("/catalog/templates", params);
  },
};
