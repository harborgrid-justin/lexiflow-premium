import { apiClient } from './api/apiClient';

export interface RetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriod: string;
  description: string;
  legalBasis: string;
  jurisdiction: string[];
  autoDelete: boolean;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionSchedule {
  policyId: string;
  entityType: string;
  entityId: string;
  retentionEndDate: string;
  deletionScheduledDate?: string;
  legalHoldApplied: boolean;
  approvedForDeletion: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DataRetentionReport {
  totalRecords: number;
  recordsByCategory: Record<string, number>;
  scheduledForDeletion: number;
  onLegalHold: number;
  pendingApproval: number;
  deletedThisMonth: number;
  storageReclaimed: number;
  complianceScore: number;
}

export interface LegalHold {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  caseNumber?: string;
  jurisdiction: string;
  issuedBy: string;
  issuedDate: string;
  effectiveDate: string;
  releaseDate?: string;
  custodians: string[];
  affectedEntitiesCount: number;
}

class RetentionService {
  /**
   * Get all retention policies
   */
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    const response = await apiClient.get('/api/compliance/retention/policies');
    return response.data;
  }

  /**
   * Create retention policy
   */
  async createRetentionPolicy(policy: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
    const response = await apiClient.post('/api/compliance/retention/policies', policy);
    return response.data;
  }

  /**
   * Update retention policy
   */
  async updateRetentionPolicy(
    policyId: string,
    updates: Partial<RetentionPolicy>,
  ): Promise<RetentionPolicy> {
    const response = await apiClient.put(
      `/api/compliance/retention/policies/${policyId}`,
      updates,
    );
    return response.data;
  }

  /**
   * Get retention schedule for entity
   */
  async getRetentionStatus(entityType: string, entityId: string): Promise<RetentionSchedule> {
    const response = await apiClient.get(
      `/api/compliance/retention/status/${entityType}/${entityId}`,
    );
    return response.data;
  }

  /**
   * Apply legal hold to entity
   */
  async applyLegalHold(entityType: string, entityId: string): Promise<void> {
    await apiClient.post(`/api/compliance/retention/legal-hold/${entityType}/${entityId}`);
  }

  /**
   * Approve deletion for entity
   */
  async approveDeletion(
    entityType: string,
    entityId: string,
    approvedBy: string,
  ): Promise<void> {
    await apiClient.post(`/api/compliance/retention/approve-deletion`, {
      entityType,
      entityId,
      approvedBy,
    });
  }

  /**
   * Get items scheduled for deletion
   */
  async getItemsScheduledForDeletion(beforeDate?: string): Promise<RetentionSchedule[]> {
    const response = await apiClient.get('/api/compliance/retention/scheduled-deletions', {
      params: { beforeDate },
    });
    return response.data;
  }

  /**
   * Extend retention period
   */
  async extendRetention(
    entityType: string,
    entityId: string,
    extensionDays: number,
    reason: string,
  ): Promise<RetentionSchedule> {
    const response = await apiClient.post('/api/compliance/retention/extend', {
      entityType,
      entityId,
      extensionDays,
      reason,
    });
    return response.data;
  }

  /**
   * Generate retention report
   */
  async generateRetentionReport(): Promise<DataRetentionReport> {
    const response = await apiClient.get('/api/compliance/retention/report');
    return response.data;
  }

  /**
   * Get active legal holds
   */
  async getActiveLegalHolds(): Promise<LegalHold[]> {
    const response = await apiClient.get('/api/compliance/legal-holds/active');
    return response.data;
  }

  /**
   * Create legal hold
   */
  async createLegalHold(holdData: Partial<LegalHold>): Promise<LegalHold> {
    const response = await apiClient.post('/api/compliance/legal-holds', holdData);
    return response.data;
  }

  /**
   * Activate legal hold
   */
  async activateLegalHold(holdId: string): Promise<LegalHold> {
    const response = await apiClient.post(`/api/compliance/legal-holds/${holdId}/activate`);
    return response.data;
  }

  /**
   * Release legal hold
   */
  async releaseLegalHold(holdId: string, releasedBy: string): Promise<LegalHold> {
    const response = await apiClient.post(`/api/compliance/legal-holds/${holdId}/release`, {
      releasedBy,
    });
    return response.data;
  }

  /**
   * Add custodian to legal hold
   */
  async addCustodian(holdId: string, custodianId: string): Promise<void> {
    await apiClient.post(`/api/compliance/legal-holds/${holdId}/custodians`, { custodianId });
  }

  /**
   * Get legal hold by ID
   */
  async getLegalHold(holdId: string): Promise<LegalHold> {
    const response = await apiClient.get(`/api/compliance/legal-holds/${holdId}`);
    return response.data;
  }

  /**
   * Preserve entity under legal hold
   */
  async preserveEntity(
    holdId: string,
    entityType: string,
    entityId: string,
    custodian?: string,
  ): Promise<void> {
    await apiClient.post(`/api/compliance/legal-holds/${holdId}/preserve`, {
      entityType,
      entityId,
      custodian,
    });
  }
}

export const retentionService = new RetentionService();
export default retentionService;
