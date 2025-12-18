/**
 * Compliance API Service
 * Manages compliance checks, ethical walls, and conflict checks
 */

import { apiClient } from '../infrastructure/apiClient';

export interface ComplianceCheck {
  id: string;
  checkType: 'conflict' | 'ethical_wall' | 'regulatory' | 'data_retention' | 'security';
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  entityId?: string;
  entityType?: string;
  results?: {
    summary: string;
    details?: any;
    recommendations?: string[];
  };
  performedBy?: string;
  performedAt: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EthicalWall {
  id: string;
  name: string;
  reason: string;
  status: 'active' | 'inactive' | 'lifted';
  restrictedParties: string[];
  excludedUsers: string[];
  caseIds?: string[];
  effectiveDate: string;
  liftedDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class ComplianceApiService {
  private readonly baseUrl = '/compliance';

  async runCheck(data: { checkType: string; entityId?: string; entityType?: string }): Promise<ComplianceCheck> {
    return apiClient.post<ComplianceCheck>(`${this.baseUrl}/checks`, data);
  }

  async getChecks(filters?: { checkType?: string; status?: string }): Promise<ComplianceCheck[]> {
    const params = new URLSearchParams();
    if (filters?.checkType) params.append('checkType', filters.checkType);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/checks?${queryString}` : `${this.baseUrl}/checks`;
    return apiClient.get<ComplianceCheck[]>(url);
  }

  async getCheckById(id: string): Promise<ComplianceCheck> {
    return apiClient.get<ComplianceCheck>(`${this.baseUrl}/checks/${id}`);
  }

  // Ethical Walls
  async getEthicalWalls(): Promise<EthicalWall[]> {
    return apiClient.get<EthicalWall[]>(`${this.baseUrl}/ethical-walls`);
  }

  async getEthicalWallById(id: string): Promise<EthicalWall> {
    return apiClient.get<EthicalWall>(`${this.baseUrl}/ethical-walls/${id}`);
  }

  async createEthicalWall(data: Partial<EthicalWall>): Promise<EthicalWall> {
    return apiClient.post<EthicalWall>(`${this.baseUrl}/ethical-walls`, data);
  }

  async updateEthicalWall(id: string, data: Partial<EthicalWall>): Promise<EthicalWall> {
    return apiClient.put<EthicalWall>(`${this.baseUrl}/ethical-walls/${id}`, data);
  }

  async liftEthicalWall(id: string): Promise<EthicalWall> {
    return apiClient.post<EthicalWall>(`${this.baseUrl}/ethical-walls/${id}/lift`, {});
  }

  async deleteEthicalWall(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/ethical-walls/${id}`);
  }
}
