/**
 * [PROTOCOL 07] API SERVICE ABSTRACTION
 * [PROTOCOL 02] SUB-RENDER COMPONENTIZATION
 * Document generation service - focused on generated document operations
 */

import { ApiClient } from "@/services/infrastructure/api-client.service";
import type {
  GeneratedDocument,
  GeneratedDocumentStatus,
  GenerateDocumentDto,
  UpdateGeneratedDocumentDto,
} from "./types";
import { buildFilterQuery } from "./utils";

export class DocumentService {
  private client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async generate(dto: GenerateDocumentDto): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>("/drafting/generate", dto);
  }

  async getAll(filters?: {
    status?: GeneratedDocumentStatus;
    caseId?: string;
  }): Promise<GeneratedDocument[]> {
    const query = buildFilterQuery(filters);
    return this.client.get<GeneratedDocument[]>(`/drafting/documents${query}`);
  }

  async getById(id: string): Promise<GeneratedDocument> {
    return this.client.get<GeneratedDocument>(`/drafting/documents/${id}`);
  }

  async update(
    id: string,
    dto: UpdateGeneratedDocumentDto
  ): Promise<GeneratedDocument> {
    return this.client.put<GeneratedDocument>(`/drafting/documents/${id}`, dto);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete(`/drafting/documents/${id}`);
  }

  async approve(id: string, notes?: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(
      `/drafting/documents/${id}/approve`,
      { notes }
    );
  }

  async reject(id: string, notes: string): Promise<GeneratedDocument> {
    return this.client.post<GeneratedDocument>(
      `/drafting/documents/${id}/reject`,
      { notes }
    );
  }

  async exportPdf(id: string): Promise<Blob> {
    return this.client.get<Blob>(`/drafting/documents/${id}/export/pdf`, {
      responseType: "blob",
    });
  }

  async exportDocx(id: string): Promise<Blob> {
    return this.client.get<Blob>(`/drafting/documents/${id}/export/docx`, {
      responseType: "blob",
    });
  }
}
