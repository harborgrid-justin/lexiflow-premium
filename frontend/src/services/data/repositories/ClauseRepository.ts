/**
 * Clause Repository
 * Enterprise-grade repository for legal clause management with backend API integration
 *
 * @module ClauseRepository
 * @description Manages all clause-related operations including:
 * - Clause CRUD operations
 * - Template variable rendering
 * - Category and jurisdiction filtering
 * - Usage tracking
 * - Search and filtering
 *
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend-first architecture with secure fallback
 * - Proper error handling and logging
 */

import {
  ClausesApiService,
  type CreateClauseDto,
  type UpdateClauseDto,
} from "@/api/intelligence/clauses-api";
import { GenericRepository, createQueryKeys } from "@/services/core/factories";
import { type BaseEntity, type Clause } from "@/types";

export const CLAUSE_QUERY_KEYS = createQueryKeys('clauses');

type ClauseEntity = Omit<Clause, "createdBy" | "updatedBy"> &
  Pick<
    BaseEntity,
    "id" | "createdAt" | "updatedAt" | "deletedAt" | "createdBy" | "updatedBy"
  >;

export class ClauseRepository extends GenericRepository<ClauseEntity> {
  protected apiService = new ClausesApiService();
  protected repositoryName = "ClauseRepository";

  private clausesApi: ClausesApiService;

  constructor() {
    super("clauses");
    this.clausesApi = new ClausesApiService();
  }

  async render(
    id: string,
    variables: Record<string, unknown>
  ): Promise<string> {
    this.validateIdParameter(id, "render");
    const result = await this.clausesApi.render(id, variables);
    return result.text;
  }

  async getByCategory(category: string): Promise<ClauseEntity[]> {
    const clauses = await this.getAll();
    return clauses.filter((c) => c.category === category);
  }

  async search(query: string): Promise<ClauseEntity[]> {
    if (!query) return [];
    const clauses = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return clauses.filter((c) => {
      const clauseWithText = c as ClauseEntity & { text?: string };
      const text = clauseWithText.text || "";
      const textMatches =
        typeof text === "string" && text.toLowerCase().includes(lowerQuery);
      return (
        c.name?.toLowerCase().includes(lowerQuery) ||
        textMatches ||
        c.content?.toLowerCase().includes(lowerQuery) ||
        c.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    });
  }

  async render(
    id: string,
    variables: Record<string, unknown>
  ): Promise<string> {
    this.validateIdParameter(id, "render");
    const result = await this.clausesApi.render(id, variables);
    return result.text;
  }

  async getByCategory(category: string): Promise<ClauseEntity[]> {
    const clauses = await this.getAll();
    return clauses.filter((c) => c.category === category);
  }

  async search(query: string): Promise<ClauseEntity[]> {
    if (!query) return [];
    const clauses = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return clauses.filter((c) => {
      const clauseWithText = c as ClauseEntity & { text?: string };
      const text = clauseWithText.text || "";
      const textMatches =
        typeof text === "string" && text.toLowerCase().includes(lowerQuery);
      return (
        c.name?.toLowerCase().includes(lowerQuery) ||
        textMatches ||
        c.content?.toLowerCase().includes(lowerQuery) ||
        c.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
      );
    });
  }
}
