import { apiClient } from "@/lib/api-client";

export interface DocketEntry {
  id: string;
  caseId: string;
  filingDate: string;
  description: string;
  filedBy: string;
  status: string;
}

export const docketService = {
  getAll: () => apiClient.get<DocketEntry[]>("/docket"),
  getById: (id: string) => apiClient.get<DocketEntry>(`/docket/${id}`),
};
