/**
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * Template management service - focused on template CRUD operations
 */

import { type ApiClient } from "@/services/infrastructure/api-client.service";

import { buildFilterQuery } from "./utils";

import type {
  CreateTemplateDto,
  DraftingTemplate,
  UpdateTemplateDto,
} from "./types";

export class TemplateService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async create(dto: CreateTemplateDto): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>("/drafting/templates", dto);
  }

  async getAll(filters?: {
    category?: string;
    jurisdiction?: string;
    practiceArea?: string;
    search?: string;
  }): Promise<DraftingTemplate[]> {
    const query = buildFilterQuery(filters);
    return this.client.get<DraftingTemplate[]>(
      `/drafting/templates/all${query}`
    );
  }

  async getById(id: string): Promise<DraftingTemplate> {
    return this.client.get<DraftingTemplate>(`/drafting/templates/${id}`);
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<DraftingTemplate> {
    return this.client.put<DraftingTemplate>(`/drafting/templates/${id}`, dto);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete(`/drafting/templates/${id}`);
  }

  async archive(id: string): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>(
      `/drafting/templates/${id}/archive`,
      {}
    );
  }

  async duplicate(id: string): Promise<DraftingTemplate> {
    return this.client.post<DraftingTemplate>(
      `/drafting/templates/${id}/duplicate`,
      {}
    );
  }

  async getRecent(limit: number = 10): Promise<DraftingTemplate[]> {
    return this.client.get<DraftingTemplate[]>(
      `/drafting/templates?limit=${limit}`
    );
  }
}
