/**
 * EvidenceApiService
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

export class EvidenceApiService {
  async getAll(caseId?: string): Promise<EvidenceItem[]> {
    const params = caseId ? { caseId } : {};
    const response = await apiClient.get<PaginatedResponse<EvidenceItem>>('/discovery/evidence', params);
    return response.data;
  }

  async getById(id: string): Promise<EvidenceItem> {
    return apiClient.get<EvidenceItem>(`/discovery/evidence/${id}`);
  }

  async add(item: Omit<EvidenceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<EvidenceItem> {
    // Transform frontend EvidenceItem to backend CreateEvidenceDto
    const createDto = {
      caseId: item.caseId,
      evidenceNumber: item.evidenceNumber || item.batesNumber || `EV-${Date.now()}`,
      title: item.title,
      description: item.description || '',
      evidenceType: item.type || item.evidenceType,
      status: item.status,
      collectionDate: item.collectionDate ? new Date(item.collectionDate) : undefined,
      collectionLocation: item.collectionLocation,
      collectedBy: item.collectedBy || item.custodian,
      currentCustodian: item.currentCustodian || item.custodian,
      storageLocation: item.storageLocation,
      chainOfCustody: item.chainOfCustody,
      chainOfCustodyIntact: item.chainOfCustodyIntact,
      filePath: item.filePath || item.location,
      fileHash: item.hash || item.fileHash,
      fileSize: item.size || item.fileSize,
      batesNumber: item.batesNumber,
      exhibitNumber: item.exhibitNumber,
      isAdmitted: item.isAdmitted,
      admissibilityStatus: item.admissibilityStatus,
      relevanceScore: item.relevanceScore,
      tags: item.tags,
      metadata: item.metadata,
    };
    
    // Remove undefined values
    Object.keys(createDto).forEach(key => {
      if (createDto[key] === undefined) {
        delete createDto[key];
      }
    });
    
    return apiClient.post<EvidenceItem>('/discovery/evidence', createDto);
  }

  async update(id: string, item: Partial<EvidenceItem>): Promise<EvidenceItem> {
    return apiClient.patch<EvidenceItem>(`/discovery/evidence/${id}`, item);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/evidence/${id}`);
  }
}
