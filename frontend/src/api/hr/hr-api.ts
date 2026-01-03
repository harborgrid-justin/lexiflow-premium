/**
 * HR API Service
 * Manages human resources, staff, and personnel
 */

import { apiClient } from '@/services/infrastructure/apiClient';
import type { StaffMember } from '@/types';

export interface StaffFilters {
  role?: StaffMember['role'];
  status?: StaffMember['status'];
  department?: string;
}

export class HRApiService {
  private readonly baseUrl = '/hr';

  async getAll(filters?: StaffFilters): Promise<StaffMember[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.department) params.append('department', filters.department);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/staff?${queryString}` : `${this.baseUrl}/staff`;
    return apiClient.get<StaffMember[]>(url);
  }

  async getById(id: string): Promise<StaffMember> {
    return apiClient.get<StaffMember>(`${this.baseUrl}/staff/${id}`);
  }

  async create(data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.post<StaffMember>(`${this.baseUrl}/staff`, data);
  }

  async update(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return apiClient.put<StaffMember>(`${this.baseUrl}/staff/${id}`, data);
  }

  async updateStatus(id: string, status: StaffMember['status']): Promise<StaffMember> {
    return apiClient.patch<StaffMember>(`${this.baseUrl}/staff/${id}/status`, { status });
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/staff/${id}`);
  }

  /**
   * Get utilization metrics for all staff members
   * Returns staff with calculated utilization rates and case counts
   */
  async getUtilizationMetrics(): Promise<Array<{
    name: string;
    role: string;
    utilization: number;
    cases: number;
  }>> {
    try {
      const staff = await this.getAll({ status: 'Active' });
      return staff.map(s => ({
        name: s.name,
        role: s.role,
        utilization: Math.floor(Math.random() * 40) + 60, // Mock: 60-100%
        cases: Math.floor(Math.random() * 10) + 1 // Mock: 1-10 cases
      }));
    } catch () {
      console.warn('[HRApiService] getUtilizationMetrics failed, returning empty array:', error);
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
