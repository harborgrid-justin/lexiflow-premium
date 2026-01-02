import { apiClient } from "@/lib/api-client";
import { LegalDocument } from "@/types";

export const documentsService = {
  getAll: async (): Promise<LegalDocument[]> => {
    return apiClient.get<LegalDocument[]>("/documents");
  },

  getById: async (id: string): Promise<LegalDocument> => {
    return apiClient.get<LegalDocument>(`/documents/${id}`);
  },

  create: async (data: Partial<LegalDocument>): Promise<LegalDocument> => {
    return apiClient.post<LegalDocument>("/documents", data);
  },

  update: async (
    id: string,
    data: Partial<LegalDocument>
  ): Promise<LegalDocument> => {
    return apiClient.put<LegalDocument>(`/documents/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/documents/${id}`);
  },
};
