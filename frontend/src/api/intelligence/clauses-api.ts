/**
 * Clauses API Service
 * Legal clause library and templates
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

export interface Clause {
  id: string;
  name: string;
  category: "boilerplate" | "custom" | "standard" | "statutory" | "contractual";
  clauseType: string;
  text: string;
  variables?: {
    name: string;
    type: string;
    defaultValue?: string;
  }[];
  jurisdiction?: string;
  tags?: string[];
  isPublic: boolean;
  usageCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClauseDto extends Omit<
  Clause,
  "id" | "createdAt" | "updatedAt" | "usageCount"
> {
  // Optional fields during creation
}

export interface UpdateClauseDto extends Partial<
  Omit<Clause, "id" | "createdAt" | "updatedAt">
> {}

export interface ClauseFilters {
  category?: Clause["category"];
  clauseType?: string;
  jurisdiction?: string;
  search?: string;
}

export class ClausesApiService {
  private readonly baseUrl = "/clauses";

  async getAll(filters?: ClauseFilters): Promise<Clause[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.clauseType) params.append("clauseType", filters.clauseType);
    if (filters?.jurisdiction)
      params.append("jurisdiction", filters.jurisdiction);
    if (filters?.search) params.append("search", filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await apiClient.get<Clause[] | { data: Clause[] }>(url);

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      "data" in response &&
      Array.isArray((response as { data: Clause[] }).data)
    ) {
      return (response as { data: Clause[] }).data;
    }

    return [];
  }

  async getById(id: string): Promise<Clause> {
    const response = await apiClient.get<Clause | { data: Clause }>(
      `${this.baseUrl}/${id}`
    );
    if (response && "data" in response) {
      return (response as { data: Clause }).data;
    }
    return response as Clause;
  }

  async create(data: CreateClauseDto): Promise<Clause> {
    const response = await apiClient.post<Clause | { data: Clause }>(
      this.baseUrl,
      data
    );
    if (response && "data" in response) {
      return (response as { data: Clause }).data;
    }
    return response as Clause;
  }

  async update(id: string, data: UpdateClauseDto): Promise<Clause> {
    const response = await apiClient.put<Clause | { data: Clause }>(
      `${this.baseUrl}/${id}`,
      data
    );
    if (response && "data" in response) {
      return (response as { data: Clause }).data;
    }
    return response as Clause;
  }

  async render(
    id: string,
    variables: Record<string, unknown>
  ): Promise<{ text: string }> {
    const response = await apiClient.post<
      { text: string } | { data: { text: string } }
    >(`${this.baseUrl}/${id}/render`, { variables });
    if (response && "data" in response) {
      return (response as { data: { text: string } }).data;
    }
    return response as { text: string };
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
