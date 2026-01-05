/**
 * @module services/api/roles.service
 * @category API Services
 * @description Roles and permissions management service
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface Permission {
  id: string;
  name: string;
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export class RolesService {
  private readonly baseUrl = "/api/roles";

  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>(this.baseUrl);
  }

  async getRole(id: string): Promise<Role> {
    return apiClient.get<Role>(`${this.baseUrl}/${id}`);
  }

  async createRole(
    role: Omit<Role, "id" | "userCount" | "isSystem">
  ): Promise<Role> {
    return apiClient.post<Role>(this.baseUrl, role);
  }

  async updateRole(id: string, role: Partial<Role>): Promise<Role> {
    return apiClient.put<Role>(`${this.baseUrl}/${id}`, role);
  }

  async deleteRole(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getPermissions(): Promise<PermissionGroup[]> {
    return apiClient.get<PermissionGroup[]>(`${this.baseUrl}/permissions`);
  }
}

export const rolesService = new RolesService();
