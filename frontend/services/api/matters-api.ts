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
    const response = await apiClient.get<any>(BASE_PATH);
    // Backend returns { success, data: { matters, total }, meta }
    const data = response.data || response;
    return Array.isArray(data) ? data : data.matters || [];
  },

  /**
   * Get matter by ID
   */
  async getById(id: MatterId): Promise<Matter> {
    const response = await apiClient.get<any>(`${BASE_PATH}/${id}`);
    return response.data || response;
  },

  /**
   * Create new matter
   */
  async create(matter: Partial<Matter>): Promise<Matter> {
    // Transform frontend Matter to backend CreateMatterDto
    const createDto = {
      title: matter.title,
      description: matter.description,
      status: matter.status?.toUpperCase(), // Convert to uppercase for backend enum
      matterType: matter.type?.toUpperCase(), // Frontend uses 'type', backend uses 'matterType'
      priority: matter.priority?.toUpperCase(), // Convert to uppercase for backend enum
      clientId: matter.clientId || null,
      clientName: matter.clientName || null,
      leadAttorneyId: matter.responsibleAttorneyId || null,
      leadAttorneyName: matter.responsibleAttorneyName || null,
      originatingAttorneyId: matter.originatingAttorneyId,
      originatingAttorneyName: matter.originatingAttorneyName,
      jurisdiction: matter.jurisdiction,
      venue: matter.courtName,
      billingType: matter.billingArrangement,
      hourlyRate: matter.hourlyRate,
      flatFee: matter.flatFee,
      contingencyPercentage: matter.contingencyPercentage,
      retainerAmount: matter.retainerAmount,
      estimatedValue: matter.estimatedValue,
      budgetAmount: matter.budgetAmount,
      openedDate: matter.openedDate || new Date().toISOString(),
      targetCloseDate: matter.closedDate,
      closedDate: matter.closedDate,
      statute_of_limitations: matter.statute_of_limitations,
      practiceArea: matter.practiceArea,
      tags: matter.tags,
      // DTO expects opposingCounsel as string, not array
      opposingCounsel: Array.isArray(matter.opposingCounsel) 
        ? matter.opposingCounsel.join(', ') 
        : matter.opposingCounsel,
      // DTO expects conflictCheckStatus string, not conflictCheckCompleted boolean
      conflictCheckStatus: matter.conflictCheckStatus || 'pending',
      conflictCheckNotes: matter.conflictCheckNotes,
      internalNotes: matter.internalNotes,
      customFields: matter.customFields,
      // Use system UUID for userId
      userId: matter.userId || '00000000-0000-0000-0000-000000000000',
    };

    const response = await apiClient.post<any>(BASE_PATH, createDto);
    // Backend returns { success, data, meta } - extract the matter from data
    return response.data || response;
  },

  /**
   * Update existing matter
   */
  async update(id: MatterId, matter: Partial<Matter>): Promise<Matter> {
    // Transform frontend Matter to backend UpdateMatterDto
    // Remove read-only fields and transform field names
    const updateDto = {
      title: matter.title,
      description: matter.description,
      status: matter.status?.toUpperCase(),
      matterType: matter.type?.toUpperCase(),
      priority: matter.priority?.toUpperCase(),
      clientId: matter.clientId,
      clientName: matter.clientName,
      leadAttorneyId: matter.responsibleAttorneyId,
      leadAttorneyName: matter.responsibleAttorneyName,
      originatingAttorneyId: matter.originatingAttorneyId,
      originatingAttorneyName: matter.originatingAttorneyName,
      jurisdiction: matter.jurisdiction,
      venue: matter.courtName,
      billingType: matter.billingArrangement,
      hourlyRate: matter.hourlyRate,
      flatFee: matter.flatFee,
      contingencyPercentage: matter.contingencyPercentage,
      retainerAmount: matter.retainerAmount,
      estimatedValue: matter.estimatedValue,
      budgetAmount: matter.budgetAmount,
      openedDate: matter.openedDate,
      targetCloseDate: matter.closedDate,
      closedDate: matter.closedDate,
      statute_of_limitations: matter.statute_of_limitations,
      practiceArea: matter.practiceArea,
      tags: matter.tags,
      opposingCounsel: Array.isArray(matter.opposingCounsel) 
        ? matter.opposingCounsel.join(', ') 
        : matter.opposingCounsel,
      conflictCheckStatus: matter.conflictCheckStatus,
      conflictCheckNotes: matter.conflictCheckNotes,
      internalNotes: matter.internalNotes,
      customFields: matter.customFields,
    };

    const response = await apiClient.patch<any>(`${BASE_PATH}/${id}`, updateDto);
    return response.data || response;
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
