/**
 * Risks API Service
 * Manages risk assessment and tracking
 */

import { apiClient } from '../apiClient';

export interface Risk {
  id: string;
  caseId?: string;
  matterId?: string;
  clientId?: string;
  title: string;
  description?: string;
  category: 'legal' | 'financial' | 'reputational' | 'operational' | 'compliance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'rare' | 'unlikely' | 'possible' | 'likely' | 'certain';
  status: 'identified' | 'assessed' | 'mitigating' | 'monitored' | 'closed';
  impact?: string;
  mitigationPlan?: string;
  mitigationSteps?: {
    description: string;
    responsible?: string;
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  identifiedBy?: string;
  identifiedAt: string;
  reviewDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RiskFilters {
  caseId?: string;
  matterId?: string;
  clientId?: string;
  category?: Risk['category'];
  severity?: Risk['severity'];
  status?: Risk['status'];
}

export class RisksApiService {
  private readonly baseUrl = '/risks';

  async getAll(filters?: RiskFilters): Promise<Risk[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.matterId) params.append('matterId', filters.matterId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Risk[]>(url);
  }

  async getById(id: string): Promise<Risk> {
    return apiClient.get<Risk>(`${this.baseUrl}/${id}`);
  }

  async create(data: Partial<Risk>): Promise<Risk> {
    return apiClient.post<Risk>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<Risk>): Promise<Risk> {
    return apiClient.put<Risk>(`${this.baseUrl}/${id}`, data);
  }

  async updateStatus(id: string, status: Risk['status']): Promise<Risk> {
    return apiClient.patch<Risk>(`${this.baseUrl}/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getRiskMatrix(): Promise<any> {
    return apiClient.get(`${this.baseUrl}/matrix`);
  }
}
