/**
 * HR API Service
 * Manages human resources, staff, and personnel
 */

import { apiClient } from '../apiClient';

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'attorney' | 'paralegal' | 'legal_assistant' | 'admin' | 'partner' | 'associate' | 'of_counsel';
  department?: string;
  title?: string;
  barNumber?: string;
  barStates?: string[];
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hireDate?: string;
  terminationDate?: string;
  billableRate?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

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
}
