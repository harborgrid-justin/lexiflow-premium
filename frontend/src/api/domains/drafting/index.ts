/**
 * [PROTOCOL 10] COMPONENT COLOCATION (BARRELING)
 * Main API facade - ~90 LOC instead of 914 LOC
 */

import { ApiClient } from "@/services/infrastructure/apiClient";
import { DashboardService } from "./dashboard.service";
import { DocumentService } from "./documents.service";
import { TemplateService } from "./templates.service";

// Re-export types and utilities
export * from "./types";
export * from "./utils";

/**
 * Unified Drafting API Service - Composition pattern
 */
export class DraftingApiService {
  private static instance: DraftingApiService;
  private client: ApiClient;

  // Sub-services
  public readonly templates: TemplateService;
  public readonly documents: DocumentService;
  public readonly dashboard: DashboardService;

  private constructor() {
    this.client = new ApiClient();

    // Initialize sub-services
    this.templates = new TemplateService(this.client);
    this.documents = new DocumentService(this.client);
    this.dashboard = new DashboardService(this.client);
  }

  public static getInstance(): DraftingApiService {
    if (!DraftingApiService.instance) {
      DraftingApiService.instance = new DraftingApiService();
    }
    return DraftingApiService.instance;
  }

  // Backward compatibility methods (delegate to sub-services)
  async createTemplate(...args: Parameters<TemplateService["create"]>) {
    return this.templates.create(...args);
  }

  async getAllTemplates(...args: Parameters<TemplateService["getAll"]>) {
    return this.templates.getAll(...args);
  }

  async getTemplateById(...args: Parameters<TemplateService["getById"]>) {
    return this.templates.getById(...args);
  }

  async updateTemplate(...args: Parameters<TemplateService["update"]>) {
    return this.templates.update(...args);
  }

  async deleteTemplate(...args: Parameters<TemplateService["delete"]>) {
    return this.templates.delete(...args);
  }

  async generateDocument(...args: Parameters<DocumentService["generate"]>) {
    return this.documents.generate(...args);
  }

  async getAllGeneratedDocuments(
    ...args: Parameters<DocumentService["getAll"]>
  ) {
    return this.documents.getAll(...args);
  }

  async getGeneratedDocumentById(
    ...args: Parameters<DocumentService["getById"]>
  ) {
    return this.documents.getById(...args);
  }

  async getRecentDrafts(
    ...args: Parameters<DashboardService["getRecentDrafts"]>
  ) {
    return this.dashboard.getRecentDrafts(...args);
  }

  async getStats() {
    return this.dashboard.getStats();
  }
}

// Default singleton export
export const draftingApi = DraftingApiService.getInstance();
