/**
 * Matters API Service
 * Backend API client for Matter Management
 */

import { apiClient } from '../apiClient';
import { Matter, MatterId } from '../../types';

const BASE_PATH = '/matters';

export const MattersAPI = {
  /**
   * Get all matters
   */
  async getAll(): Promise<Matter[]> {
    const response = await apiClient.get<{ matters: Matter[]; total: number }>(BASE_PATH);
    // Backend returns paginated response, extract the matters array
    return Array.isArray(response) ? response : response.matters || [];
  },

  /**
   * Get matter by ID
   */
  async getById(id: MatterId): Promise<Matter> {
    return apiClient.get<Matter>(`${BASE_PATH}/${id}`);
  },

  /**
   * Create new matter
   */
  async create(matter: Partial<Matter>): Promise<Matter> {
    return apiClient.post<Matter>(BASE_PATH, matter);
  },

  /**
   * Update existing matter
   */
  async update(id: MatterId, matter: Partial<Matter>): Promise<Matter> {
    return apiClient.patch<Matter>(`${BASE_PATH}/${id}`, matter);
  },

  /**
   * Delete matter
   */
  async delete(id: MatterId): Promise<void> {
    return apiClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Get matters by status
   */
  async getByStatus(status: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(BASE_PATH, { status });
  },

  /**
   * Get matters by client
   */
  async getByClient(clientId: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(BASE_PATH, { clientId });
  },

  /**
   * Get matters by attorney
   */
  async getByAttorney(attorneyId: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(BASE_PATH, { leadAttorneyId: attorneyId });
  },

  /**
   * Search matters
   */
  async search(query: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(`${BASE_PATH}/search`, { q: query });
  },
};
