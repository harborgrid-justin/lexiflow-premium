/**
 * War Room API Service
 * ALIGNED WITH BACKEND: backend/src/war-room/war-room.controller.ts
 * Trial war room collaboration - advisors, experts, and case strategy
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { Advisor, CaseStrategy, Expert, ExpertType } from "@/types";

// DTOs matching backend war-room.dto.ts
export interface CreateAdvisorDto {
  name: string;
  email: string;
  phone?: string;
  firm?: string;
  specialty?: string;
  caseId?: string;
}

export interface CreateExpertDto {
  name: string;
  expertType: ExpertType;
  email: string;
  phone?: string;
  hourlyRate?: number;
  credentials?: string;
  caseId?: string;
}

export interface UpdateStrategyDto {
  caseId?: string;
  objective?: string;
  approach?: string;
  keyArguments?: string;
}

export class WarRoomApiService {
  private readonly baseUrl = "/war-room";

  // ===
  // ADVISORS === (backend: GET/POST/DELETE /war-room/advisors)
  async getAdvisors(query?: Record<string, string>): Promise<Advisor[]> {
    const params = new URLSearchParams(query);
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/advisors?${queryString}`
      : `${this.baseUrl}/advisors`;
    return apiClient.get<Advisor[]>(url);
  }

  async getAdvisor(id: string): Promise<Advisor> {
    return apiClient.get<Advisor>(`${this.baseUrl}/advisors/${id}`);
  }

  async createAdvisor(data: CreateAdvisorDto): Promise<Advisor> {
    return apiClient.post<Advisor>(`${this.baseUrl}/advisors`, data);
  }

  async deleteAdvisor(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/advisors/${id}`);
  }

  // ===
  // EXPERTS === (backend: GET/POST/DELETE /war-room/experts)
  async getExperts(query?: Record<string, string>): Promise<Expert[]> {
    const params = new URLSearchParams(query);
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/experts?${queryString}`
      : `${this.baseUrl}/experts`;
    return apiClient.get<Expert[]>(url);
  }

  async getExpert(id: string): Promise<Expert> {
    return apiClient.get<Expert>(`${this.baseUrl}/experts/${id}`);
  }

  async createExpert(data: CreateExpertDto): Promise<Expert> {
    return apiClient.post<Expert>(`${this.baseUrl}/experts`, data);
  }

  async deleteExpert(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/experts/${id}`);
  }

  // ===
  // WAR ROOM DATA === (backend: GET /war-room/:caseId)
  async getWarRoomData(caseId: string): Promise<unknown> {
    return apiClient.get(`${this.baseUrl}/${caseId}`);
  }

  // Alias for Domain Service compatibility
  async getData(caseId: string): Promise<unknown> {
    return this.getWarRoomData(caseId);
  }

  // ===
  // STRATEGY === (backend: GET/PUT /war-room/:caseId/strategy)
  async getStrategy(caseId: string): Promise<CaseStrategy> {
    return apiClient.get<CaseStrategy>(`${this.baseUrl}/${caseId}/strategy`);
  }

  async updateStrategy(
    caseId: string,
    data: UpdateStrategyDto,
  ): Promise<CaseStrategy> {
    return apiClient.put<CaseStrategy>(
      `${this.baseUrl}/${caseId}/strategy`,
      data,
    );
  }

  // ===
  // OPPOSITION === (Placeholder for future backend implementation)
  async getOpposition(caseId: string): Promise<unknown[]> {
    try {
      return await apiClient.get<unknown[]>(
        `${this.baseUrl}/${caseId}/opposition`,
      );
    } catch (error) {
      console.error("Failed to load opposition data", error);
      return [];
    }
  }
}
