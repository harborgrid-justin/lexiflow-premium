/**
 * Compliance & Security API Services
 * Complete coverage for compliance, audit, and security endpoints
 */

import { apiClient, type PaginatedResponse } from './apiClient';

// ==================== CONFLICT CHECKS ====================
export interface ConflictCheck {
  id: string;
  caseId?: string;
  clientName: string;
  opposingParties: string[];
  status: 'Pending' | 'Clear' | 'Conflict Detected' | 'Waived';
  conflicts: Array<{
    type: 'Client' | 'Opposing Party' | 'Related Matter' | 'Employee';
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    details: string;
  }>;
  checkedBy: string;
  checkedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export class ConflictChecksApiService {
  async getAll(filters?: { status?: string; caseId?: string }): Promise<ConflictCheck[]> {
    const response = await apiClient.get<PaginatedResponse<ConflictCheck>>('/compliance/conflicts', filters);
    return response.data;
  }

  async getById(id: string): Promise<ConflictCheck> {
    return apiClient.get<ConflictCheck>(`/compliance/conflicts/${id}`);
  }

  async create(check: Omit<ConflictCheck, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>('/compliance/conflicts', check);
  }

  async run(data: { clientName: string; opposingParties: string[]; caseId?: string }): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>('/compliance/conflicts/run', data);
  }

  async resolve(id: string, resolution: string, waiverObtained: boolean): Promise<ConflictCheck> {
    return apiClient.post<ConflictCheck>(`/compliance/conflicts/${id}/resolve`, { resolution, waiverObtained });
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/compliance/conflicts/${id}`);
  }
}

// ==================== ETHICAL WALLS ====================
export interface EthicalWall {
  id: string;
  name: string;
  reason: string;
  status: 'Active' | 'Inactive' | 'Expired';
  matterIds: string[];
  restrictedUsers: string[];
  allowedUsers: string[];
  effectiveDate: string;
  expirationDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class EthicalWallsApiService {
  async getAll(): Promise<EthicalWall[]> {
    const response = await apiClient.get<PaginatedResponse<EthicalWall>>('/compliance/ethical-walls');
    return response.data;
  }

  async getById(id: string): Promise<EthicalWall> {
    return apiClient.get<EthicalWall>(`/compliance/ethical-walls/${id}`);
  }

  async getByUserId(userId: string): Promise<EthicalWall[]> {
    const response = await apiClient.get<PaginatedResponse<EthicalWall>>(`/compliance/ethical-walls/user/${userId}`);
    return response.data;
  }

  async create(wall: Omit<EthicalWall, 'id' | 'createdAt' | 'updatedAt'>): Promise<EthicalWall> {
    return apiClient.post<EthicalWall>('/compliance/ethical-walls', wall);
  }

  async update(id: string, wall: Partial<EthicalWall>): Promise<EthicalWall> {
    return apiClient.put<EthicalWall>(`/compliance/ethical-walls/${id}`, wall);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/compliance/ethical-walls/${id}`);
  }
}

// ==================== AUDIT LOGS ====================
export interface AuditLogEntry {
  id: string;
  eventType: string;
  category: 'Access' | 'Modification' | 'Deletion' | 'Creation' | 'Security' | 'System';
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export class AuditLogsApiService {
  async getAll(filters?: { 
    userId?: string; 
    category?: string; 
    eventType?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', filters);
    return response.data;
  }

  async getById(id: string): Promise<AuditLogEntry> {
    return apiClient.get<AuditLogEntry>(`/audit-logs/${id}`);
  }

  async getByResourceId(resourceType: string, resourceId: string): Promise<AuditLogEntry[]> {
    const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>('/audit-logs', { resourceType, resourceId });
    return response.data;
  }

  async export(filters: { startDate: string; endDate: string; format: 'CSV' | 'JSON' | 'PDF' }): Promise<Blob> {
    const response = await fetch(`${apiClient.getBaseUrl()}/audit-logs/export`, {
      method: 'POST',
      headers: apiClient['getHeaders'](),
      body: JSON.stringify(filters),
    });
    return response.blob();
  }
}

// ==================== PERMISSIONS ====================
export interface Permission {
  id: string;
  userId: string;
  resourceType: 'Case' | 'Document' | 'Billing' | 'Admin' | 'Report' | 'All';
  resourceId?: string;
  actions: Array<'read' | 'write' | 'delete' | 'admin'>;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface AccessCheckRequest {
  userId: string;
  resourceType: string;
  resourceId: string;
  action: string;
}

export interface AccessMatrixRequest {
  userIds: string[];
  resourceType: string;
  resourceIds: string[];
}

export class PermissionsApiService {
  async getAll(filters?: { userId?: string; resourceType?: string }): Promise<Permission[]> {
    const response = await apiClient.get<PaginatedResponse<Permission>>('/security/permissions', filters);
    return response.data;
  }

  async create(permission: Omit<Permission, 'id' | 'grantedAt'>): Promise<Permission> {
    return apiClient.post<Permission>('/security/permissions', permission);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/security/permissions/${id}`);
  }

  async checkAccess(request: AccessCheckRequest): Promise<{ allowed: boolean; reason?: string }> {
    return apiClient.post<{ allowed: boolean; reason?: string }>('/security/permissions/check-access', request);
  }

  async getAccessMatrix(request: AccessMatrixRequest): Promise<Record<string, Record<string, boolean>>> {
    return apiClient.post<Record<string, Record<string, boolean>>>('/security/permissions/access-matrix', request);
  }
}

// ==================== RLS POLICIES ====================
export interface RLSPolicy {
  id: string;
  name: string;
  description: string;
  tableName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  condition: string;
  roles: string[];
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class RLSPoliciesApiService {
  async getAll(): Promise<RLSPolicy[]> {
    const response = await apiClient.get<PaginatedResponse<RLSPolicy>>('/security/rls-policies');
    return response.data;
  }

  async getById(id: string): Promise<RLSPolicy> {
    return apiClient.get<RLSPolicy>(`/security/rls-policies/${id}`);
  }

  async create(policy: Omit<RLSPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<RLSPolicy> {
    return apiClient.post<RLSPolicy>('/security/rls-policies', policy);
  }

  async update(id: string, policy: Partial<RLSPolicy>): Promise<RLSPolicy> {
    return apiClient.put<RLSPolicy>(`/security/rls-policies/${id}`, policy);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/security/rls-policies/${id}`);
  }

  async toggle(id: string, enabled: boolean): Promise<RLSPolicy> {
    return apiClient.patch<RLSPolicy>(`/security/rls-policies/${id}/toggle`, { enabled });
  }
}

// ==================== COMPLIANCE REPORTS ====================
export interface ComplianceReport {
  id: string;
  type: 'Conflict Check' | 'Access Control' | 'Audit Trail' | 'Ethical Wall' | 'Data Retention';
  status: 'Generating' | 'Completed' | 'Failed';
  period: { start: string; end: string };
  findings: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  generatedBy: string;
  generatedAt: string;
  downloadUrl?: string;
}

export class ComplianceReportsApiService {
  async getAll(filters?: { type?: string; status?: string }): Promise<ComplianceReport[]> {
    const response = await apiClient.get<PaginatedResponse<ComplianceReport>>('/compliance/reports', filters);
    return response.data;
  }

  async getById(id: string): Promise<ComplianceReport> {
    return apiClient.get<ComplianceReport>(`/compliance/reports/${id}`);
  }

  async generate(data: { type: string; startDate: string; endDate: string; parameters?: Record<string, any> }): Promise<ComplianceReport> {
    return apiClient.post<ComplianceReport>('/compliance/reports/generate', data);
  }

  async download(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient.getBaseUrl()}/compliance/reports/${id}/download`, {
      headers: apiClient['getHeaders'](),
    });
    return response.blob();
  }
}

// ==================== EXPORT INSTANCES ====================
export const complianceApiServices = {
  conflictChecks: new ConflictChecksApiService(),
  ethicalWalls: new EthicalWallsApiService(),
  auditLogs: new AuditLogsApiService(),
  permissions: new PermissionsApiService(),
  rlsPolicies: new RLSPoliciesApiService(),
  complianceReports: new ComplianceReportsApiService(),
};
