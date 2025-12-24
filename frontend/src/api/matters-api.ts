/**
 * Matters API Service
 * Backend API client for Matter Management
 */

import { apiClient } from '@services/infrastructure/apiClient';
import { Matter, MatterId } from '@/types';

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
    
    const response = await apiClient.get<unknown>(url);
    // Backend returns { success, data: { matters, total }, meta }
    const data = response.data || response;
    return Array.isArray(data) ? data : data.matters || [];
  }

  /**
   * Get matter by ID
   */
  async getById(id: MatterId): Promise<Matter> {
    const response = await apiClient.get<unknown>(`${this.baseUrl}/${id}`);
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
      matterType: (matter.matterType || matter.type)?.toUpperCase(), // Support both field names
      priority: matter.priority?.toUpperCase(), // Convert to uppercase for backend enum
      clientId: matter.clientId || null,
      clientName: matter.clientName || null,
      clientEmail: matter.clientEmail || null,
      clientPhone: matter.clientPhone || null,
      // Use exact backend field names
      leadAttorneyId: matter.leadAttorneyId || matter.responsibleAttorneyId || null,
      leadAttorneyName: matter.leadAttorneyName || matter.responsibleAttorneyName || null,
      originatingAttorneyId: matter.originatingAttorneyId,
      originatingAttorneyName: matter.originatingAttorneyName,
      jurisdiction: matter.jurisdiction,
      venue: matter.venue || matter.courtName, // Backend uses 'venue'
      billingType: matter.billingType || matter.billingArrangement, // Backend uses 'billingType'
      hourlyRate: matter.hourlyRate,
      flatFee: matter.flatFee,
      contingencyPercentage: matter.contingencyPercentage,
      retainerAmount: matter.retainerAmount,
      estimatedValue: matter.estimatedValue,
      budgetAmount: matter.budgetAmount,
      openedDate: matter.openedDate || new Date().toISOString(),
      targetCloseDate: matter.targetCloseDate || matter.closedDate,
      closedDate: matter.closedDate,
      statute_of_limitations: matter.statute_of_limitations,
      practiceArea: matter.practiceArea,
      tags: matter.tags,
      // Backend accepts opposingPartyName, opposingCounsel as string, opposingCounselFirm
      opposingPartyName: matter.opposingPartyName,
      opposingCounsel: Array.isArray(matter.opposingCounsel) 
        ? matter.opposingCounsel.join(', ') 
        : matter.opposingCounsel,
      opposingCounselFirm: matter.opposingCounselFirm,
      // Backend uses boolean conflictCheckCompleted and optional conflictCheckDate
      conflictCheckCompleted: matter.conflictCheckCompleted || false,
      conflictCheckDate: matter.conflictCheckDate || null,
      conflictCheckStatus: matter.conflictCheckCompleted 
        ? 'completed' 
        : matter.conflictCheckStatus || 'pending',
      conflictCheckNotes: matter.conflictCheckNotes,
      // Risk management fields
      riskLevel: matter.riskLevel,
      riskNotes: matter.riskNotes,
      // Linked resources
      linkedCaseIds: matter.linkedCaseIds || [],
      linkedDocumentIds: matter.linkedDocumentIds || [],
      // Notes and custom fields
      internalNotes: matter.internalNotes,
      customFields: matter.customFields,
      // Use system UUID for userId
      userId: matter.userId || matter.createdBy || '00000000-0000-0000-0000-000000000000',
      isArchived: matter.isArchived || false,
    };

    const response = await apiClient.post<unknown>(this.baseUrl, createDto);
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
      matterType: (matter.matterType || matter.type)?.toUpperCase(),
      priority: matter.priority?.toUpperCase(),
      clientId: matter.clientId,
      clientName: matter.clientName,
      clientEmail: matter.clientEmail,
      clientPhone: matter.clientPhone,
      // Use exact backend field names
      leadAttorneyId: matter.leadAttorneyId || matter.responsibleAttorneyId,
      leadAttorneyName: matter.leadAttorneyName || matter.responsibleAttorneyName,
      originatingAttorneyId: matter.originatingAttorneyId,
      originatingAttorneyName: matter.originatingAttorneyName,
      jurisdiction: matter.jurisdiction,
      venue: matter.venue || matter.courtName,
      billingType: matter.billingType || matter.billingArrangement,
      hourlyRate: matter.hourlyRate,
      flatFee: matter.flatFee,
      contingencyPercentage: matter.contingencyPercentage,
      retainerAmount: matter.retainerAmount,
      estimatedValue: matter.estimatedValue,
      budgetAmount: matter.budgetAmount,
      openedDate: matter.openedDate,
      targetCloseDate: matter.targetCloseDate || matter.closedDate,
      closedDate: matter.closedDate,
      statute_of_limitations: matter.statute_of_limitations,
      practiceArea: matter.practiceArea,
      tags: matter.tags,
      opposingPartyName: matter.opposingPartyName,
      opposingCounsel: Array.isArray(matter.opposingCounsel) 
        ? matter.opposingCounsel.join(', ') 
        : matter.opposingCounsel,
      opposingCounselFirm: matter.opposingCounselFirm,
      conflictCheckCompleted: matter.conflictCheckCompleted,
      conflictCheckDate: matter.conflictCheckDate,
      conflictCheckStatus: matter.conflictCheckCompleted 
        ? 'completed' 
        : matter.conflictCheckStatus,
      conflictCheckNotes: matter.conflictCheckNotes,
      riskLevel: matter.riskLevel,
      riskNotes: matter.riskNotes,
      linkedCaseIds: matter.linkedCaseIds,
      linkedDocumentIds: matter.linkedDocumentIds,
      internalNotes: matter.internalNotes,
      customFields: matter.customFields,
      isArchived: matter.isArchived,
    };

    const response = await apiClient.patch<unknown>(`${this.baseUrl}/${id}`, updateDto);
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
   * Get matter KPIs (Key Performance Indicators)
   */
  async getKPIs(dateRange?: string): Promise<any> {
    const url = dateRange ? `${this.baseUrl}/kpis?dateRange=${dateRange}` : `${this.baseUrl}/kpis`;
    const response = await apiClient.get<any>(url);
    return response.data || response;
  }

  /**
   * Get intake pipeline stages
   */
  async getPipeline(dateRange?: string): Promise<any> {
    const url = dateRange ? `${this.baseUrl}/pipeline?dateRange=${dateRange}` : `${this.baseUrl}/pipeline`;
    const response = await apiClient.get<any>(url);
    return response.data || response;
  }

  /**
   * Get calendar events
   */
  async getCalendarEvents(startDate: string, endDate?: string, matterIds?: string[]): Promise<any> {
    const params = new URLSearchParams({ startDate });
    if (endDate) params.append('endDate', endDate);
    if (matterIds?.length) params.append('matterIds', matterIds.join(','));
    const response = await apiClient.get<any>(`${this.baseUrl}/calendar/events?${params.toString()}`);
    return response.data || response;
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(dateRange?: string): Promise<any> {
    const url = dateRange ? `${this.baseUrl}/analytics/revenue?dateRange=${dateRange}` : `${this.baseUrl}/analytics/revenue`;
    const response = await apiClient.get<any>(url);
    return response.data || response;
  }

  /**
   * Get risk insights
   */
  async getRiskInsights(matterIds?: string[]): Promise<any> {
    const url = matterIds?.length 
      ? `${this.baseUrl}/insights/risk?matterIds=${matterIds.join(',')}`
      : `${this.baseUrl}/insights/risk`;
    const response = await apiClient.get<any>(url);
    return response.data || response;
  }

  /**
   * Get financial overview
   */
  async getFinancialOverview(dateRange?: string): Promise<any> {
    const url = dateRange ? `${this.baseUrl}/financials/overview?dateRange=${dateRange}` : `${this.baseUrl}/financials/overview`;
    const response = await apiClient.get<any>(url);
    return response.data || response;
  }

  /**
   * Search matters
   */
  async search(query: string): Promise<Matter[]> {
    return apiClient.get<Matter[]>(`${this.baseUrl}/search`, { q: query });
  }

  /**
   * Get matters by status
   */
  async getByStatus(status: string): Promise<Matter[]> {
    return this.getAll({ status });
  }

  /**
   * Get matters by client
   */
  async getByClient(clientId: string): Promise<Matter[]> {
    return this.getAll({ clientId });
  }

  /**
   * Get matters by attorney
   */
  async getByAttorney(leadAttorneyId: string): Promise<Matter[]> {
    return this.getAll({ leadAttorneyId });
  }
}

// Export singleton instance
export const mattersApi = new MattersApiService();
