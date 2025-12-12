import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface Case {
  id: string;
  title: string;
  caseNumber: string;
  description?: string;
  type: string;
  status: string;
  practiceArea?: string;
  jurisdiction?: string;
  court?: string;
  judge?: string;
  filingDate?: Date;
  trialDate?: Date;
  closeDate?: Date;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  metadata?: Record<string, any>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseFilters {
  search?: string;
  status?: string;
  type?: string;
  practiceArea?: string;
  assignedTeamId?: string;
  leadAttorneyId?: string;
  jurisdiction?: string;
  isArchived?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeParties?: boolean;
  includeTeam?: boolean;
  includePhases?: boolean;
}

export interface PaginatedCases {
  data: Case[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  eventType: string;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  eventDate: Date;
  createdAt: Date;
}

export interface CaseStatistics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentActivityCount: number;
}

class CaseService {
  /**
   * Get all cases with filters and pagination
   */
  async getCases(filters?: CaseFilters): Promise<PaginatedCases> {
    const response = await axios.get(`${API_BASE_URL}/cases`, { params: filters });
    return response.data;
  }

  /**
   * Get a single case by ID
   */
  async getCase(id: string): Promise<Case> {
    const response = await axios.get(`${API_BASE_URL}/cases/${id}`);
    return response.data;
  }

  /**
   * Create a new case
   */
  async createCase(data: Partial<Case>): Promise<Case> {
    const response = await axios.post(`${API_BASE_URL}/cases`, data);
    return response.data;
  }

  /**
   * Update a case
   */
  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    const response = await axios.put(`${API_BASE_URL}/cases/${id}`, data);
    return response.data;
  }

  /**
   * Delete a case
   */
  async deleteCase(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/cases/${id}`);
  }

  /**
   * Archive a case
   */
  async archiveCase(id: string): Promise<Case> {
    const response = await axios.post(`${API_BASE_URL}/cases/${id}/archive`);
    return response.data;
  }

  /**
   * Get case timeline events
   */
  async getCaseTimeline(
    caseId: string,
    options?: {
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<TimelineEvent[]> {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/timeline`, {
      params: options,
    });
    return response.data;
  }

  /**
   * Get available workflow transitions for a case
   */
  async getAvailableTransitions(caseId: string): Promise<string[]> {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/workflow/transitions`);
    return response.data;
  }

  /**
   * Get case statistics
   */
  async getCaseStatistics(caseId: string): Promise<CaseStatistics> {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/statistics`);
    return response.data;
  }

  /**
   * Get case parties
   */
  async getCaseParties(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/parties`);
    return response.data;
  }

  /**
   * Get case team
   */
  async getCaseTeam(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/team`);
    return response.data;
  }

  /**
   * Get case team workload
   */
  async getCaseTeamWorkload(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/team/workload`);
    return response.data;
  }

  /**
   * Get case motions
   */
  async getCaseMotions(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/motions`);
    return response.data;
  }

  /**
   * Get case motion deadlines
   */
  async getCaseDeadlines(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}/motions/deadlines`);
    return response.data;
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(days: number = 7, userId?: string) {
    const response = await axios.get(`${API_BASE_URL}/motions/deadlines/upcoming`, {
      params: { days, userId },
    });
    return response.data;
  }

  /**
   * Get deadline alerts
   */
  async getDeadlineAlerts(userId?: string, days: number = 7) {
    const response = await axios.get(`${API_BASE_URL}/motions/deadlines/alerts`, {
      params: { userId, days },
    });
    return response.data;
  }

  /**
   * Complete a deadline
   */
  async completeDeadline(deadlineId: string, userId: string, notes?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/motions/deadlines/${deadlineId}/complete`,
      { userId, notes }
    );
    return response.data;
  }
}

export default new CaseService();
