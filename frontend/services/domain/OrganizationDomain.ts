/**
 * OrganizationDomain - Organization and department management service
 * Provides org structure, department hierarchy, and member management
 * 
 * ✅ Migrated to backend API (2025-12-21)
 */

import { adminApi } from '../api/domains/admin.api';
import { delay } from '../../utils/async';

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
  customization?: any;
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
  getAll: async () => adminApi.organizations?.getAll?.() || [],
  getById: async (id: string) => adminApi.organizations?.getById?.(id) || null,
  add: async (item: any) => {
    const org = { ...item, createdAt: new Date().toISOString() };
    return adminApi.organizations?.create?.(org) || org;
  },
  update: async (id: string, updates: any) => {
    return adminApi.organizations?.update?.(id, updates) || { id, ...updates };
  },
  delete: async (id: string) => {
    await adminApi.organizations?.delete?.(id);
    return true;
  },
  
  // Organization specific methods
  getOrganizations: async (filters?: { type?: string }): Promise<Organization[]> => {
    let orgs = await db.getAll(STORES.ORGANIZATIONS);
    
    if (filters?.type) {
      orgs = orgs.filter((o: Organization) => o.type === filters.type);
    }
    
    return orgs;
  },
  
  getDepartments: async (orgId: string): Promise<Department[]> => {
    await delay(50);
    const departments = await db.getAll(STORES.DEPARTMENTS);
    return departments.filter((d: Department) => d.orgId === orgId);
  },
  
  getMembers: async (orgId: string, departmentId?: string): Promise<Member[]> => {
    await delay(50);
    let members = await db.getAll(STORES.MEMBERS);
    
    members = members.filter((m: Member) => m.orgId === orgId);
    
    if (departmentId) {
      members = members.filter((m: Member) => m.departmentId === departmentId);
    }
    
    return members;
  },
  
  updateSettings: async (orgId: string, settings: Partial<OrgSettings>): Promise<OrgSettings> => {
    await delay(100);
    const org = await db.get(STORES.ORGANIZATIONS, orgId);
    if (!org) throw new Error('Organization not found');
    
    const updatedSettings = { ...org.settings, ...settings };
    
    await db.put(STORES.ORGANIZATIONS, {
      ...org,
      settings: updatedSettings,
    });
    
    return updatedSettings;
  },
  
  createDepartment: async (department: Partial<Department>): Promise<Department> => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      orgId: department.orgId || '',
      name: department.name || 'New Department',
      parentId: department.parentId,
      managerId: department.managerId,
      description: department.description,
      memberCount: 0,
    };
    
    await db.put(STORES.DEPARTMENTS, newDept);
    return newDept;
  },
  
  addMember: async (member: Partial<Member>): Promise<Member> => {
    const newMember: Member = {
      id: `member-${Date.now()}`,
      orgId: member.orgId || '',
      userId: member.userId || '',
      departmentId: member.departmentId,
      role: member.role || 'member',
      title: member.title,
      joinedAt: new Date().toISOString(),
    };
    
    await db.put(STORES.MEMBERS, newMember);
    return newMember;
  },
};
