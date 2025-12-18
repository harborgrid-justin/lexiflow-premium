/**
 * UsersApiService
 * API service split from apiServices.ts
 */

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';
import type { 
  Case, 
  DocketEntry, 
  LegalDocument, 
  EvidenceItem,
  TimeEntry,
  User,
} from '../../types';

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
