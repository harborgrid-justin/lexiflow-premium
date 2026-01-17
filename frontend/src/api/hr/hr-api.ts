/**
 * HR API Service
 * Manages human resources, staff, and personnel
 */

import { apiClient } from "@/services/infrastructure/api-client.service";

import type { StaffMember } from "@/types";

export interface StaffFilters {
  role?: StaffMember["role"];
  status?: StaffMember["status"];
  department?: string;
}

export class HRApiService {
  private readonly baseUrl = "/hr";

  async getAll(filters?: StaffFilters): Promise<StaffMember[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.department) params.append("department", filters.department);
    const queryString = params.toString();
    const url = queryString
      ? `${this.baseUrl}/employees?${queryString}`
      : `${this.baseUrl}/employees`;
    const response = await apiClient.get<{ data: StaffMember[] }>(url);
    return response.data || [];
  }

  async getById(id: string): Promise<StaffMember> {
    return apiClient.get<StaffMember>(`${this.baseUrl}/employees/${id}`);
  }

  async create(data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.post<StaffMember>(`${this.baseUrl}/employees`, data);
  }

  async update(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.put<StaffMember>(`${this.baseUrl}/employees/${id}`, data);
  }

  async updateStatus(
    id: string,
    status: StaffMember["status"]
  ): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(
      `${this.baseUrl}/employees/${id}/status`,
      { status }
    );
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/employees/${id}`);
  }

  /**
   * Get utilization metrics for all staff members
   * Returns staff with calculated utilization rates and case counts
   */
  async getUtilizationMetrics(): Promise<
    Array<{
      name: string;
      role: string;
      utilization: number;
      cases: number;
    }>
  > {
    try {
      const response = await apiClient.get<
        Array<{
          name: string;
          role: string;
          utilization: number;
          cases: number;
        }>
      >(`${this.baseUrl}/utilization`);

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn(
        "[HRApiService] getUtilizationMetrics failed, returning empty array:",
        error
      );
      return [];
    }
  }

  /**
   * Get staff members (alias for getAll)
   * @deprecated Use getAll instead
   */
  async getStaff(filters?: StaffFilters): Promise<StaffMember[]> {
    return this.getAll(filters);
  }
}
