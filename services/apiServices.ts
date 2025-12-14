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

/**
 * Notifications API Service
 */
export interface Notification {
  id: string;
  type: 'deadline' | 'case_update' | 'document' | 'billing' | 'system' | 'message';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export class NotificationsApiService {
  async getAll(filters?: { read?: boolean; type?: string }): Promise<Notification[]> {
    const response = await apiClient.get<PaginatedResponse<Notification>>('/notifications', filters);
    return response.data;
  }

  async getById(id: string): Promise<Notification> {
    return apiClient.get<Notification>(`/notifications/${id}`);
  }

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`/notifications/${id}/read`, { read: true });
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read', {});
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.count;
  }
}

/**
 * Webhooks API Service
 */
export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'Active' | 'Inactive' | 'Error';
  secret?: string;
  lastTriggered?: string;
  failureCount: number;
  createdAt: string;
}

export class WebhooksApiService {
  async getAll(): Promise<WebhookConfig[]> {
    const response = await apiClient.get<PaginatedResponse<WebhookConfig>>('/admin/webhooks');
    return response.data;
  }

  async getById(id: string): Promise<WebhookConfig> {
    return apiClient.get<WebhookConfig>(`/admin/webhooks/${id}`);
  }

  async create(webhook: Omit<WebhookConfig, 'id' | 'createdAt' | 'lastTriggered' | 'failureCount' | 'status'>): Promise<WebhookConfig> {
    return apiClient.post<WebhookConfig>('/admin/webhooks', webhook);
  }

  async update(id: string, webhook: Partial<WebhookConfig>): Promise<WebhookConfig> {
    return apiClient.patch<WebhookConfig>(`/admin/webhooks/${id}`, webhook);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/webhooks/${id}`);
  }

  async test(id: string): Promise<{ success: boolean; message: string; statusCode?: number }> {
    return apiClient.post<{ success: boolean; message: string; statusCode?: number }>(`/admin/webhooks/${id}/test`, {});
  }

  async getAvailableEvents(): Promise<string[]> {
    return apiClient.get<string[]>('/admin/webhooks/events');
  }
}

/**
 * API Keys API Service
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  status: 'Active' | 'Revoked' | 'Expired';
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

export class ApiKeysApiService {
  async getAll(): Promise<ApiKey[]> {
    const response = await apiClient.get<PaginatedResponse<ApiKey>>('/admin/api-keys');
    return response.data;
  }

  async getById(id: string): Promise<ApiKey> {
    return apiClient.get<ApiKey>(`/admin/api-keys/${id}`);
  }

  async create(apiKey: { name: string; scopes: string[]; expiresAt?: string }): Promise<ApiKey> {
    return apiClient.post<ApiKey>('/admin/api-keys', apiKey);
  }

  async revoke(id: string): Promise<ApiKey> {
    return apiClient.patch<ApiKey>(`/admin/api-keys/${id}/revoke`, {});
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/api-keys/${id}`);
  }

  async getAvailableScopes(): Promise<{ id: string; label: string; description: string }[]> {
    return apiClient.get<{ id: string; label: string; description: string }[]>('/admin/api-keys/scopes');
  }
}

/**
 * Rate Tables API Service
 */
export interface RateTableEntry {
  role: string;
  hourlyRate: number;
}

export interface RateTable {
  id: string;
  name: string;
  description: string;
  type: 'Standard' | 'Premium' | 'Discounted' | 'Pro Bono';
  status: 'Active' | 'Inactive';
  effectiveDate: string;
  rates: RateTableEntry[];
  createdAt: string;
  updatedAt: string;
}

export class RateTablesApiService {
  async getAll(): Promise<RateTable[]> {
    const response = await apiClient.get<PaginatedResponse<RateTable>>('/billing/rate-tables');
    return response.data;
  }

  async getById(id: string): Promise<RateTable> {
    return apiClient.get<RateTable>(`/billing/rate-tables/${id}`);
  }

  async create(rateTable: Omit<RateTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<RateTable> {
    return apiClient.post<RateTable>('/billing/rate-tables', rateTable);
  }

  async update(id: string, rateTable: Partial<RateTable>): Promise<RateTable> {
    return apiClient.patch<RateTable>(`/billing/rate-tables/${id}`, rateTable);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/rate-tables/${id}`);
  }

  async duplicate(id: string, name: string): Promise<RateTable> {
    return apiClient.post<RateTable>(`/billing/rate-tables/${id}/duplicate`, { name });
  }
}

/**
 * Fee Agreements API Service
 */
export interface FeeAgreement {
  id: string;
  clientName: string;
  matterName: string;
  agreementType: 'Hourly' | 'Contingency' | 'Flat Fee' | 'Retainer' | 'Hybrid';
  status: 'Draft' | 'Pending' | 'Active' | 'Expired' | 'Terminated';
  effectiveDate: string;
  expirationDate?: string;
  terms: {
    hourlyRate?: number;
    contingencyPercentage?: number;
    flatFeeAmount?: number;
    retainerAmount?: number;
    billingCycle?: string;
    paymentTerms?: string;
  };
  rateTableId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class FeeAgreementsApiService {
  async getAll(filters?: { status?: string; clientName?: string }): Promise<FeeAgreement[]> {
    const response = await apiClient.get<PaginatedResponse<FeeAgreement>>('/billing/fee-agreements', filters);
    return response.data;
  }

  async getById(id: string): Promise<FeeAgreement> {
    return apiClient.get<FeeAgreement>(`/billing/fee-agreements/${id}`);
  }

  async create(agreement: Omit<FeeAgreement, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeeAgreement> {
    return apiClient.post<FeeAgreement>('/billing/fee-agreements', agreement);
  }

  async update(id: string, agreement: Partial<FeeAgreement>): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(`/billing/fee-agreements/${id}`, agreement);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/billing/fee-agreements/${id}`);
  }

  async activate(id: string): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(`/billing/fee-agreements/${id}/activate`, {});
  }

  async terminate(id: string, reason?: string): Promise<FeeAgreement> {
    return apiClient.patch<FeeAgreement>(`/billing/fee-agreements/${id}/terminate`, { reason });
  }
}

/**
 * Custodians API Service
 */
export interface Custodian {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'On Hold' | 'Released';
  caseId: string;
  holdDate?: string;
  releaseDate?: string;
  dataVolume?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class CustodiansApiService {
  async getAll(filters?: { caseId?: string; status?: string }): Promise<Custodian[]> {
    const response = await apiClient.get<PaginatedResponse<Custodian>>('/discovery/custodians', filters);
    return response.data;
  }

  async getById(id: string): Promise<Custodian> {
    return apiClient.get<Custodian>(`/discovery/custodians/${id}`);
  }

  async create(custodian: Omit<Custodian, 'id' | 'createdAt' | 'updatedAt'>): Promise<Custodian> {
    return apiClient.post<Custodian>('/discovery/custodians', custodian);
  }

  async update(id: string, custodian: Partial<Custodian>): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}`, custodian);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/custodians/${id}`);
  }

  async placeOnHold(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}/hold`, { status: 'On Hold', holdDate: new Date().toISOString() });
  }

  async release(id: string): Promise<Custodian> {
    return apiClient.patch<Custodian>(`/discovery/custodians/${id}/release`, { status: 'Released', releaseDate: new Date().toISOString() });
  }

  async getByCaseId(caseId: string): Promise<Custodian[]> {
    return this.getAll({ caseId });
  }
}

/**
 * Examinations API Service
 */
export interface Examination {
  id: string;
  title: string;
  type: 'Deposition' | 'Interrogatory' | 'Request for Admission' | 'Request for Production';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  caseId: string;
  witness?: string;
  examiner?: string;
  scheduledDate?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export class ExaminationsApiService {
  async getAll(filters?: { caseId?: string; status?: string; type?: string }): Promise<Examination[]> {
    const response = await apiClient.get<PaginatedResponse<Examination>>('/discovery/examinations', filters);
    return response.data;
  }

  async getById(id: string): Promise<Examination> {
    return apiClient.get<Examination>(`/discovery/examinations/${id}`);
  }

  async create(examination: Omit<Examination, 'id' | 'createdAt' | 'updatedAt'>): Promise<Examination> {
    return apiClient.post<Examination>('/discovery/examinations', examination);
  }

  async update(id: string, examination: Partial<Examination>): Promise<Examination> {
    return apiClient.patch<Examination>(`/discovery/examinations/${id}`, examination);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/discovery/examinations/${id}`);
  }

  async getByCaseId(caseId: string): Promise<Examination[]> {
    return this.getAll({ caseId });
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
  notifications: new NotificationsApiService(),
  webhooks: new WebhooksApiService(),
  apiKeys: new ApiKeysApiService(),
  rateTables: new RateTablesApiService(),
  feeAgreements: new FeeAgreementsApiService(),
  custodians: new CustodiansApiService(),
  examinations: new ExaminationsApiService(),
};
