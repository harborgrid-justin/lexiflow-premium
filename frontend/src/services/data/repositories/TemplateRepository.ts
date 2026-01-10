/**
 * Template Repository
 * Enterprise-grade repository for workflow template management
 */

import { WorkflowTemplateService } from "@/api/workflow/core/template.service";
import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { WorkflowTemplateData } from "@/types";

export const TEMPLATE_QUERY_KEYS = {
  all: () => ["templates"] as const,
  byId: (id: string) => ["templates", id] as const,
  byCategory: (category: string) =>
    ["templates", "category", category] as const,
} as const;

export class TemplateRepository extends Repository<WorkflowTemplateData> {
  private templateService: WorkflowTemplateService;

  constructor() {
    super("templates");
    this.templateService = new WorkflowTemplateService();
    console.log(`[TemplateRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || id.trim() === "") {
      throw new Error(
        `[TemplateRepository.${methodName}] Invalid id parameter`
      );
    }
  }

  override async getAll(): Promise<WorkflowTemplateData[]> {
    try {
      const templates = await this.templateService.getTemplates();
      return templates as unknown as WorkflowTemplateData[];
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  override async getById(
    id: string
  ): Promise<WorkflowTemplateData | undefined> {
    this.validateId(id, "getById");
    try {
      const template = await this.templateService.getTemplateById(id);
      return template as unknown as WorkflowTemplateData;
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  override async add(
    item: WorkflowTemplateData
  ): Promise<WorkflowTemplateData> {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        "[TemplateRepository.add] Invalid template data"
      );
    }
    try {
      const template = await this.templateService.createTemplate(
        item as unknown as CreateTemplateDto
      );
      return template as unknown as WorkflowTemplateData;
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  override async update(
    id: string,
    updates: Partial<WorkflowTemplateData>
  ): Promise<WorkflowTemplateData> {
    this.validateId(id, "update");
    try {
      const template = await this.templateService.updateTemplate(
        id,
        updates as unknown as UpdateTemplateDto
      );
      return template as unknown as WorkflowTemplateData;
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.templateService.deleteTemplate(id);
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  async getByCategory(category: string): Promise<WorkflowTemplateData[]> {
    try {
      const templates = await this.getAll();
      return templates.filter((t) => t.category === category);
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }

  async search(query: string): Promise<WorkflowTemplateData[]> {
    if (!query) return [];
    try {
      const templates = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return templates.filter(
        (t) =>
          ((t as Record<string, unknown>).name as string | undefined)
            ?.toLowerCase()
            .includes(lowerQuery) ||
          ((t as Record<string, unknown>).description as string | undefined)
            ?.toLowerCase()
            .includes(lowerQuery) ||
          t.id?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }
}
