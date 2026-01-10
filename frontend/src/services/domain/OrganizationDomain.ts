/**
 * OrganizationDomain - Organization and department management service
 * Provides org structure, department hierarchy, and member management
 *
 * ? Migrated to backend API (2025-12-21)
 */

import { apiClient } from '@/services/infrastructure/apiClient';

interface Organization {
  id: string;
  name: string;
  type: 'law-firm' | 'corporation' | 'government' | 'non-profit';
  size?: string;
  industry?: string;
  address?: string;
  settings?: OrgSettings;
  createdAt: string;
}

interface OrgSettings {
  timezone?: string;
  currency?: string;
  billingCycle?: 'monthly' | 'quarterly' | 'annual';
  features?: string[];
  customization?: unknown;
}

interface Department {
  id: string;
  orgId: string;
  name: string;
  parentId?: string;
  managerId?: string;
  description?: string;
  memberCount?: number;
}

interface Member {
  id: string;
  orgId: string;
  userId: string;
  departmentId?: string;
  role: string;
  title?: string;
  joinedAt: string;
}

export const OrganizationService = {
  getAll: async (): Promise<Organization[]> => {
    try {
      return await apiClient.get<Organization[]>('/organizations');
    } catch (error) {
       console.error("Failed to fetch organizations", error);
       return [];
    }
  },
  getById: async (id: string): Promise<Organization | null> => {
    try {
      return await apiClient.get<Organization>(`/organizations/${id}`);
    } catch (error) {
       console.error(`Failed to fetch organization ${id}`, error);
       return null;
    }
  },
  add: async (item: unknown): Promise<Organization> => {
     return await apiClient.post<Organization>('/organizations', item);
  },
  update: async (id: string, updates: unknown): Promise<Organization> => {
    return await apiClient.patch<Organization>(`/organizations/${id}`, updates);
  },
  delete: async (id: string): Promise<boolean> => {
    try {
        await apiClient.delete(`/organizations/${id}`);
        return true;
    } catch (error) {
        console.error(`Failed to delete organization ${id}`, error);
        throw error;
    }
  },

  // Organization specific methods
  getOrganizations: async (filters?: { type?: string }): Promise<Organization[]> => {
    try {
        const params = new URLSearchParams();
        if (filters?.type) params.append('type', filters.type);
        return await apiClient.get<Organization[]>(`/organizations?${params.toString()}`);
    } catch (error) {
        console.error("Failed to fetch organizations with filters", error);
        return [];
    }
  },

  getDepartments: async (orgId: string): Promise<Department[]> => {
    try {
        return await apiClient.get<Department[]>(`/organizations/${orgId}/departments`);
    } catch (error) {
        console.error(`Failed to fetch departments for org ${orgId}`, error);
        return [];
    }
  },

  getMembers: async (orgId: string, departmentId?: string): Promise<Member[]> => {
    try {
        const params = new URLSearchParams();
        if (departmentId) params.append('departmentId', departmentId);
        return await apiClient.get<Member[]>(`/organizations/${orgId}/members?${params.toString()}`);
    } catch (error) {
        console.error(`Failed to fetch members for org ${orgId}`, error);
        return [];
    }
  },

  updateSettings: async (orgId: string, settings: Partial<OrgSettings>): Promise<OrgSettings> => {
    const org = await apiClient.get<Organization>(`/organizations/${orgId}`);
    if (!org) throw new Error('Organization not found');

    const updatedSettings = { ...(org.settings || {}), ...settings };

    await apiClient.patch(\`/organizations/${orgId}/settings\`, updatedSettings);

    return updatedSettings;
  },

  createDepartment: async (department: Partial<Department>): Promise<Department> => {
    return await apiClient.post<Department>(\`/organizations/${department.orgId}/departments\`, department);
  },

  addMember: async (member: Partial<Member>): Promise<Member> => {
    return await apiClient.post<Member>(\`/organizations/${member.orgId}/members\`, member);
  },
};
