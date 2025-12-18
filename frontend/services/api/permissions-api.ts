/**
 * Permissions API Service
 * Granular permission management
 */

import { apiClient } from '../apiClient';

export interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | '*';
  effect: 'allow' | 'deny';
  conditions?: {
    type: string;
    operator: string;
    value: any;
  }[];
  metadata?: Record<string, any>;
}

export interface RolePermissions {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export class PermissionsApiService {
  private readonly baseUrl = '/permissions';

  async getRolePermissions(roleId: string): Promise<RolePermissions> {
    return apiClient.get<RolePermissions>(`${this.baseUrl}/roles/${roleId}`);
  }

  async updateRolePermissions(roleId: string, permissions: Permission[]): Promise<RolePermissions> {
    return apiClient.put<RolePermissions>(`${this.baseUrl}/roles/${roleId}`, { permissions });
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<{ allowed: boolean }> {
    return apiClient.post(`${this.baseUrl}/check`, { userId, resource, action });
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return apiClient.get<Permission[]>(`${this.baseUrl}/users/${userId}`);
  }
}
