/**
 * DocketApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

export class DocketApiService {
  async getAll(caseId?: string): Promise<DocketEntry[]> {
    const params = caseId ? { caseId } : {};
    const response = await apiClient.get<PaginatedResponse<DocketEntry>>('/docket', params);
    return response.data;
  }

  async getById(id: string): Promise<DocketEntry> {
    return apiClient.get<DocketEntry>(`/docket/${id}`);
  }

  async add(entry: Omit<DocketEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocketEntry> {
    // Transform frontend DocketEntry to backend CreateDocketEntryDto
    const createDto = {
      caseId: entry.caseId,
      sequenceNumber: entry.sequenceNumber,
      docketNumber: entry.docketNumber,
      dateFiled: entry.dateFiled ? new Date(entry.dateFiled) : undefined,
      entryDate: entry.entryDate ? new Date(entry.entryDate) : new Date(),
      description: entry.description || entry.title,
      type: entry.type,
      filedBy: entry.filedBy || entry.party,
      text: entry.text || entry.summary,
      documentTitle: entry.documentTitle || entry.title,
      documentUrl: entry.documentUrl || entry.url,
      documentId: entry.documentId,
      pacerDocketNumber: entry.pacerDocketNumber,
      pacerDocumentNumber: entry.pacerDocumentNumber,
      isSealed: entry.isSealed,
      isRestricted: entry.isRestricted,
      notes: entry.notes,
      attachments: entry.attachments,
    };
    
    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === undefined) {
        delete createDto[key];
      }
    });
    
    return apiClient.post<DocketEntry>('/docket', createDto);
  }

  async update(id: string, entry: Partial<DocketEntry>): Promise<DocketEntry> {
    return apiClient.patch<DocketEntry>(`/docket/${id}`, entry);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/docket/${id}`);
  }

  async getByCaseId(caseId: string): Promise<DocketEntry[]> {
    return this.getAll(caseId);
  }
}
