/**
 * EvidenceApiService
 * API service split from apiServices.ts
 */

import {
  apiClient,
  type PaginatedResponse,
} from "@/services/infrastructure/apiClient";
import type { EvidenceItem } from "@/types";

export class EvidenceApiService {
  async getAll(caseId?: string): Promise<EvidenceItem[]> {
    const params = caseId ? { caseId } : {};
    const response = await apiClient.get<PaginatedResponse<EvidenceItem>>(
      "/evidence",
      { params }
    );
    return response.data;
  }

  async getById(id: string): Promise<EvidenceItem> {
    return apiClient.get<EvidenceItem>(`/evidence/${id}`);
  }

  async add(
    item: Omit<EvidenceItem, "id" | "createdAt" | "updatedAt">
  ): Promise<EvidenceItem> {
    // Transform frontend EvidenceItem to backend CreateEvidenceDto
    const createDto = {
      caseId: item.caseId,
      evidenceNumber: `EV-${Date.now()}`,
      title: item.title,
      description: item.description || "",
      evidenceType: item.type,
      status: item.status,
      collectionDate: item.collectionDate
        ? new Date(item.collectionDate)
        : undefined,
      collectionLocation: (item as Record<string, unknown>).collectionLocation,
      collectedBy: item.collectedBy,
      currentCustodian: item.custodian,
      storageLocation: item.location,
      chainOfCustody: item.chainOfCustody,
      chainOfCustodyIntact: true,
      filePath: item.location,
      fileHash: (item as Record<string, unknown>).hash,
      fileSize: item.fileSize,
      batesNumber: (item as Record<string, unknown>).batesNumber,
      exhibitNumber: (item as Record<string, unknown>).exhibitNumber,
      isAdmitted: false,
      admissibilityStatus: item.admissibility,
      relevanceScore: item.relevanceScore,
      tags: item.tags,
      metadata: {},
    };

    // Remove undefined values
    Object.keys(createDto).forEach((key) => {
      if ((createDto as Record<string, unknown>)[key] === undefined) {
        delete (createDto as Record<string, unknown>)[key];
      }
    });

    return apiClient.post<EvidenceItem>("/discovery/evidence", createDto);
  }

  async update(id: string, item: Partial<EvidenceItem>): Promise<EvidenceItem> {
    return apiClient.patch<EvidenceItem>(`/discovery/evidence/${id}`, item);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/evidence/${id}`);
  }
}
