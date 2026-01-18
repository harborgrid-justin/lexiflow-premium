/**
 * Template Repository
 * Enterprise-grade repository for workflow template management
 */

import { WorkflowTemplateService } from "@/api/workflow/core/template.service";
import { GenericRepository } from "@/services/core/factories";
import { type WorkflowTemplateData } from "@/types";

export const TEMPLATE_QUERY_KEYS = {
  all: () => ["templates"] as const,
  byId: (id: string) => ["templates", id] as const,
  byCategory: (category: string) =>
    ["templates", "category", category] as const,
} as const;

export class TemplateRepository extends GenericRepository<WorkflowTemplateData> {
  private templateService: WorkflowTemplateService;
  protected apiService: WorkflowTemplateService;
  protected repositoryName = "TemplateRepository";

  constructor() {
    super("templates");
    this.templateService = new WorkflowTemplateService();
    this.apiService = this.templateService;
    console.log(`[TemplateRepository] Initialized with Backend API`);
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

  override async search(query: string): Promise<WorkflowTemplateData[]> {
    if (!query) return [];
    try {
      const templates = await this.getAll();
      const lowerQuery = query.toLowerCase();
      return templates.filter(
        (t) =>
          ((t as Record<string, unknown>)["name"] as string | undefined)
            ?.toLowerCase()
            .includes(lowerQuery) ||
          ((t as Record<string, unknown>)["description"] as string | undefined)
            ?.toLowerCase()
            .includes(lowerQuery) ||
          t.id?.toLowerCase().includes(lowerQuery),
      );
    } catch (error) {
      console.error("[TemplateRepository] Backend API error", error);
      throw error;
    }
  }
}
