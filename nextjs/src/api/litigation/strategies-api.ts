/**
 * @module services/api/litigation/strategies-api
 * @description Strategies management API service
 * Handles litigation strategies, risk assessments, and recommendations
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Strategy {
  id: string;
  caseId: string;
  name: string;
  description: string;
  objectives: string[];
  risks: Risk[];
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  probability: number;
  mitigation?: string;
}

export interface Recommendation {
  id: string;
  type: "motion" | "discovery" | "settlement" | "trial";
  title: string;
  description: string;
  priority: number;
  rationale: string;
}

export class StrategiesApiService {
  private readonly baseUrl = "/litigation";

  async getAll(): Promise<Strategy[]> {
    return apiClient.get<Strategy[]>(`${this.baseUrl}/strategies`);
  }

  async getById(id: string): Promise<Strategy> {
    return apiClient.get<Strategy>(`${this.baseUrl}/strategies/${id}`);
  }

  async create(data: Partial<Strategy>): Promise<Strategy> {
    return apiClient.post<Strategy>(`${this.baseUrl}/strategies`, data);
  }

  async update(id: string, updates: Partial<Strategy>): Promise<Strategy> {
    return apiClient.patch<Strategy>(
      `${this.baseUrl}/strategies/${id}`,
      updates
    );
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/strategies/${id}`);
  }

  async getRisks(strategyId: string): Promise<Risk[]> {
    return apiClient.get<Risk[]>(
      `${this.baseUrl}/strategies/${strategyId}/risks`
    );
  }

  async getRecommendations(caseId: string): Promise<Recommendation[]> {
    return apiClient.get<Recommendation[]>(
      `${this.baseUrl}/cases/${caseId}/recommendations`
    );
  }
}
