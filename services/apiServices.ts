/**
 * Backend API Services
 * Domain-specific API adapters that match the DataService interface
 */

import { apiClient } from './apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
  PaginatedResponse,
} from '../types';

/**
 * Check if backend API mode is enabled
 */
export function isBackendApiEnabled(): boolean {
  return import.meta.env.VITE_USE_BACKEND_API === 'true';
}

/**
 * Cases API Service
 */
export class CasesApiService {
  async getAll(): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases');
    return response.data;
  }

  async getById(id: string): Promise<Case> {
    return apiClient.get<Case>(`/cases/${id}`);
  }

  async add(caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Promise<Case> {
    return apiClient.post<Case>('/cases', caseData);
  }

  async update(id: string, caseData: Partial<Case>): Promise<Case> {
    return apiClient.patch<Case>(`/cases/${id}`, caseData);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  }

  async search(query: string): Promise<Case[]> {
    const response = await apiClient.get<PaginatedResponse<Case>>('/cases', { search: query });
    return response.data;
  }
}

/**
 * Docket API Service
 */
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
    return apiClient.post<DocketEntry>('/docket', entry);
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

/**
 * Documents API Service
 */
export class DocumentsApiService {
  async getAll(): Promise<LegalDocument[]> {
    const response = await apiClient.get<PaginatedResponse<LegalDocument>>('/documents');
    return response.data;
  }

  async getById(id: string): Promise<LegalDocument> {
    return apiClient.get<LegalDocument>(`/documents/${id}`);
  }

  async add(doc: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegalDocument> {
    return apiClient.post<LegalDocument>('/documents', doc);
  }

  async update(id: string, doc: Partial<LegalDocument>): Promise<LegalDocument> {
    return apiClient.patch<LegalDocument>(`/documents/${id}`, doc);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }

  async upload(file: File, metadata: Record<string, any>): Promise<LegalDocument> {
    return apiClient.upload<LegalDocument>('/documents/upload', file, metadata);
  }

  async getByCaseId(caseId: string): Promise<LegalDocument[]> {
    const response = await apiClient.get<PaginatedResponse<LegalDocument>>('/documents', { caseId });
    return response.data;
  }
}

/**
 * Evidence API Service
 */
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
    return apiClient.post<EvidenceItem>('/discovery/evidence', item);
  }

  async update(id: string, item: Partial<EvidenceItem>): Promise<EvidenceItem> {
    return apiClient.patch<EvidenceItem>(`/discovery/evidence/${id}`, item);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/evidence/${id}`);
  }
}

/**
 * Billing API Service
 */
export class BillingApiService {
  async getTimeEntries(filters?: { caseId?: string; userId?: string }): Promise<TimeEntry[]> {
    const response = await apiClient.get<PaginatedResponse<TimeEntry>>('/billing/time-entries', filters);
    return response.data;
  }

  async addTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    return apiClient.post<TimeEntry>('/billing/time-entries', entry);
  }

  async updateTimeEntry(id: string, entry: Partial<TimeEntry>): Promise<TimeEntry> {
    return apiClient.patch<TimeEntry>(`/billing/time-entries/${id}`, entry);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`/billing/time-entries/${id}`);
  }
}

/**
 * Auth API Service
 */
export class AuthApiService {
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    
    // Store tokens
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async register(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', userData);
    
    // Store tokens
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }

  async logout(): Promise<void> {
    apiClient.clearAuthTokens();
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem(import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'lexiflow_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
    apiClient.setAuthTokens(response.accessToken, response.refreshToken);
    
    return response;
  }
}

/**
 * Users API Service
 */
export class UsersApiService {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users');
    return response.data;
  }

  async getById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, userData);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
}

// Export instances
export const apiServices = {
  cases: new CasesApiService(),
  docket: new DocketApiService(),
  documents: new DocumentsApiService(),
  evidence: new EvidenceApiService(),
  billing: new BillingApiService(),
  auth: new AuthApiService(),
  users: new UsersApiService(),
};
