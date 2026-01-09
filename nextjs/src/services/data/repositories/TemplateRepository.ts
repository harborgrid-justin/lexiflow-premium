/**
 * Template Repository
 * Enterprise-grade repository for workflow template management
 */

import { WorkflowTemplateData } from "@/types";
import { Repository } from "@/services/core/Repository";
import { ValidationError } from "@/services/core/errors";
import { STORES } from "@/services/data/db";
import { isBackendApiEnabled } from "@/config/network/api.config";
import { WorkflowApiService } from "@/api/workflow/workflow-api";

export const TEMPLATE_QUERY_KEYS = {
  all: () => ["templates"] as const,
  byId: (id: string) => ["templates", id] as const,
  byCategory: (category: string) =>
    ["templates", "category", category] as const,
} as const;

export class TemplateRepository extends Repository<WorkflowTemplateData> {
  private readonly useBackend: boolean;
  private workflowApi: WorkflowApiService;

  constructor() {
    super(STORES.TEMPLATES);
    this.useBackend = isBackendApiEnabled();
    this.workflowApi = new WorkflowApiService();
    console.log(
      `[TemplateRepository] Initialized with ${this.useBackend ? "Backend API" : "IndexedDB"}`
    );
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(
        `[TemplateRepository.${methodName}] Invalid id parameter`
      );
    }
  }

  override async getAll(options?: {
    includeDeleted?: boolean;
  }): Promise<WorkflowTemplateData[]> {
    if (this.useBackend) {
      // Need mapping if types differ
      const templates = await this.workflowApi.getTemplates();
      return templates as unknown as WorkflowTemplateData[];
    }
    return super.getAll(options);
  }

  override async getById(
    id: string
  ): Promise<WorkflowTemplateData | undefined> {
    if (this.useBackend) {
      try {
        const tpl = await this.workflowApi.getTemplateById(id);
        return tpl as unknown as WorkflowTemplateData;
      } catch (error) {
        console.warn("[TemplateRepository] Backend fetch failed", error);
        return undefined;
      }
    }
    return super.getById(id);
  }

  override async add(
    item: WorkflowTemplateData
  ): Promise<WorkflowTemplateData> {
    if (!item || typeof item !== "object") {
      throw new ValidationError(
        "[TemplateRepository.add] Invalid template data"
      );
    }

    if (this.useBackend) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = await this.workflowApi.createTemplate(item as any);
      return created as unknown as WorkflowTemplateData;
    }

    await super.add(item);
    return item;
  }

  override async update(
    id: string,
    updates: Partial<WorkflowTemplateData>
  ): Promise<WorkflowTemplateData> {
    this.validateId(id, "update");
    if (this.useBackend) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await this.workflowApi.updateTemplate(id, updates as any);
      return updated as unknown as WorkflowTemplateData;
    }
    return await super.update(id, updates);
  }

  override async delete(id: string): Promise<void> {
    if (this.useBackend) {
      await this.workflowApi.deleteTemplate(id);
      return;
    }
    return super.delete(id);
  }

  async getByCategory(category: string): Promise<WorkflowTemplateData[]> {
    if (this.useBackend) {
      const templates = await this.workflowApi.getTemplates({ category });
      return templates as unknown as WorkflowTemplateData[];
    }

    const templates = await this.getAll();
    return templates.filter((t) => t.category === category);
  }

  async search(query: string): Promise<WorkflowTemplateData[]> {
    if (!query) return [];
    // Backend text search if available, else client filter on getAll
    // WorkflowApi.getTemplates supports filters but maybe not full text search query in filters
    // Let's use getAll and filter for simplicity unless we see search endpoint
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
  }
}
