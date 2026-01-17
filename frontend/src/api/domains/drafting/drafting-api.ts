/**
 * Drafting API Service
 * Main service class aggregating all drafting functionality
 */

import { ApiClient } from "@/services/infrastructure/api-client.service";

import * as ClauseValidator from "./clause-validator";
import * as DashboardApi from "./dashboard-api";
import * as DocumentGeneration from "./document-generation";
import * as DocumentWorkflow from "./document-workflow";
import * as TemplateCrud from "./template-crud";
import * as TemplateValidator from "./template-validator";
import {
  type CreateTemplateDto,
  type GenerateDocumentDto,
  type UpdateGeneratedDocumentDto,
  type UpdateTemplateDto,
} from "./types";
import * as VariableValidator from "./variable-validator";

export class DraftingApiService {
  private static instance: DraftingApiService;
  private client: ApiClient;

  private constructor() {
    this.client = new ApiClient();
  }

  public static getInstance(): DraftingApiService {
    if (!DraftingApiService.instance) {
      DraftingApiService.instance = new DraftingApiService();
    }
    return DraftingApiService.instance;
  }

  // Dashboard methods
  public getRecentDrafts = (limit?: number) =>
    DashboardApi.getRecentDrafts(this.client, limit);
  public getTemplates = (limit?: number) =>
    DashboardApi.getTemplates(this.client, limit);
  public getPendingApprovals = () =>
    DashboardApi.getPendingApprovals(this.client);
  public getStats = () => DashboardApi.getStats(this.client);

  // Template CRUD methods
  public createTemplate = (dto: CreateTemplateDto) =>
    TemplateCrud.createTemplate(this.client, dto);
  public getAllTemplates = (filters?: Record<string, unknown>) =>
    TemplateCrud.getAllTemplates(this.client, filters);
  public getTemplateById = (id: string) =>
    TemplateCrud.getTemplateById(this.client, id);
  public updateTemplate = (id: string, dto: UpdateTemplateDto) =>
    TemplateCrud.updateTemplate(this.client, id, dto);
  public deleteTemplate = (id: string) =>
    TemplateCrud.deleteTemplate(this.client, id);
  public archiveTemplate = (id: string) =>
    TemplateCrud.archiveTemplate(this.client, id);
  public duplicateTemplate = (id: string) =>
    TemplateCrud.duplicateTemplate(this.client, id);

  // Document generation methods
  public generateDocument = (dto: GenerateDocumentDto) =>
    DocumentGeneration.generateDocument(this.client, dto);
  public getAllGeneratedDocuments = (filters?: Record<string, unknown>) =>
    DocumentGeneration.getAllGeneratedDocuments(this.client, filters);
  public getGeneratedDocumentById = (id: string) =>
    DocumentGeneration.getGeneratedDocumentById(this.client, id);
  public updateGeneratedDocument = (
    id: string,
    dto: UpdateGeneratedDocumentDto
  ) => DocumentGeneration.updateGeneratedDocument(this.client, id, dto);
  public deleteGeneratedDocument = (id: string) =>
    DocumentGeneration.deleteGeneratedDocument(this.client, id);

  // Document workflow methods
  public submitForReview = (id: string) =>
    DocumentWorkflow.submitForReview(this.client, id);
  public approveDocument = (id: string, notes?: string) =>
    DocumentWorkflow.approveDocument(this.client, id, notes);
  public rejectDocument = (id: string, notes: string) =>
    DocumentWorkflow.rejectDocument(this.client, id, notes);
  public finalizeDocument = (id: string) =>
    DocumentWorkflow.finalizeDocument(this.client, id);
}

// Export singleton instance
export const draftingApi = DraftingApiService.getInstance();

// Export validation service as static methods
export const DraftingValidationService = {
  validateTemplate: TemplateValidator.validateTemplate,
  validateVariables: VariableValidator.validateVariables,
  validateClauses: ClauseValidator.validateClauses,
  generatePreview: ClauseValidator.generatePreview,
};
