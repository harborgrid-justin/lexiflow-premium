/**
 * Template CRUD API
 * Create, read, update, delete operations for templates
 */

import { ApiClient } from "@/services/infrastructure/api-client.service";
import type {
  DraftingTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
} from "./types";

/**
 * Create new template
 */
export async function createTemplate(
  client: ApiClient,
  dto: CreateTemplateDto
): Promise<DraftingTemplate> {
  return client.post<DraftingTemplate>("/drafting/templates", dto);
}

/**
 * Get all templates with optional filters
 */
export async function getAllTemplates(
  client: ApiClient,
  filters?: {
    category?: string;
    jurisdiction?: string;
    practiceArea?: string;
    search?: string;
  }
): Promise<DraftingTemplate[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.jurisdiction)
    params.append("jurisdiction", filters.jurisdiction);
  if (filters?.practiceArea)
    params.append("practiceArea", filters.practiceArea);
  if (filters?.search) params.append("search", filters.search);

  const query = params.toString();
  return client.get<DraftingTemplate[]>(
    `/drafting/templates/all${query ? `?${query}` : ""}`
  );
}

/**
 * Get template by ID
 */
export async function getTemplateById(
  client: ApiClient,
  id: string
): Promise<DraftingTemplate> {
  return client.get<DraftingTemplate>(`/drafting/templates/${id}`);
}

/**
 * Update template
 */
export async function updateTemplate(
  client: ApiClient,
  id: string,
  dto: UpdateTemplateDto
): Promise<DraftingTemplate> {
  return client.put<DraftingTemplate>(`/drafting/templates/${id}`, dto);
}

/**
 * Delete template
 */
export async function deleteTemplate(
  client: ApiClient,
  id: string
): Promise<void> {
  return client.delete(`/drafting/templates/${id}`);
}

/**
 * Archive template
 */
export async function archiveTemplate(
  client: ApiClient,
  id: string
): Promise<DraftingTemplate> {
  return client.post<DraftingTemplate>(
    `/drafting/templates/${id}/archive`,
    {}
  );
}

/**
 * Duplicate template
 */
export async function duplicateTemplate(
  client: ApiClient,
  id: string
): Promise<DraftingTemplate> {
  return client.post<DraftingTemplate>(
    `/drafting/templates/${id}/duplicate`,
    {}
  );
}
