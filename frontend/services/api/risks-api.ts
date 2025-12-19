/**
 * Risks API Service
 * Manages risk assessment and tracking
 */

/**
 * ALIGNED WITH BACKEND: backend/src/risks/risks.controller.ts
 */
import { apiClient } from '../infrastructure/apiClient';
import type { Risk, RiskImpact, RiskProbability, RiskStatusEnum } from '../../types';

// DTOs matching backend risks/dto/create-risk.dto.ts
export interface CreateRiskDto {
  title: string;
  description?: string;
  impact: RiskImpact;
  probability: RiskProbability;
  status: RiskStatusEnum;
  caseId?: string;
  mitigationStrategy?: string;
  riskScore?: number;
  identifiedBy?: string;
}

export interface UpdateRiskDto {
  title?: string;
  description?: string;
  impact?: RiskImpact;
  probability?: RiskProbability;
  status?: RiskStatusEnum;
  caseId?: string;
  mitigationStrategy?: string;
  riskScore?: number;
  identifiedBy?: string;
}

export interface RiskFilters {
  caseId?: string;
  status?: RiskStatusEnum;
  impact?: RiskImpact;
  probability?: RiskProbability;
}

export class RisksApiService {
  private readonly baseUrl = '/risks';

  // Backend: GET /risks with query params
  async getAll(filters?: RiskFilters): Promise<Risk[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.impact) params.append('impact', filters.impact);
    if (filters?.probability) params.append('probability', filters.probability);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<Risk[]>(url);
  }

  // Backend: GET /risks/:id
  async getById(id: string): Promise<Risk> {
    return apiClient.get<Risk>(`${this.baseUrl}/${id}`);
  }

  // Backend: POST /risks
  async create(data: CreateRiskDto): Promise<Risk> {
    return apiClient.post<Risk>(this.baseUrl, data);
  }

  // Backend: PUT /risks/:id
  async update(id: string, data: UpdateRiskDto): Promise<Risk> {
    return apiClient.put<Risk>(`${this.baseUrl}/${id}`, data);
  }

  // Backend: PATCH /risks/:id (partial update)
  async patch(id: string, data: Partial<UpdateRiskDto>): Promise<Risk> {
    return apiClient.patch<Risk>(`${this.baseUrl}/${id}`, data);
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
