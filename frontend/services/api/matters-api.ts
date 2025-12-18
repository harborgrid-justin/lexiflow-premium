/**
 * Matters API Service
 * Backend API client for Matter Management
 */

import { apiClient } from '../apiClient';
import { Matter, MatterId } from '../../types';

export interface MatterFilters {
  status?: string;
  clientId?: string;
  leadAttorneyId?: string;
  practiceArea?: string;
  search?: string;
}

export interface MatterStatistics {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPracticeArea: Record<string, number>;
}

export class MattersApiService {
  private readonly baseUrl = '/matters';

  /**
   * Get all matters
   */
  async getAll(filters?: MatterFilters): Promise<Matter[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.leadAttorneyId) params.append('leadAttorneyId', filters.leadAttorneyId);
    if (filters?.practiceArea) params.append('practiceArea', filters.practiceArea);
    if (filters?.search) params.append('search', filters.search);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await apiClient.get<any>(url);
    // Backend returns { success, data: { matters, total }, meta }
    const data = response.data || response;
    return Array.isArray(data) ? data : data.matters || [];
  }

  /**
   * Get matter by ID
   */
  async getById(id: MatterId): Promise<Matter> {
    const response = await apiClient.get<any>(`${this.baseUrl}/${id}`);
    return response.data || response;
  }

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

    const response = await apiClient.post<any>(this.baseUrl, createDto);
    // Backend returns { success, data, meta } - extract the matter from data
    return response.data || response;
  }

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

    const response = await apiClient.patch<any>(`${this.baseUrl}/${id}`, updateDto);
    return response.data || response;
  }

  /**
   * Delete matter
   */
  async delete(id: MatterId): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get matters statistics
   */
  async getStatistics(): Promise<MatterStatistics> {
    return apiClient.get<MatterStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Search matters
   */
  async search(query: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(`${this.baseUrl}/search`, { q: query });
  }
}
