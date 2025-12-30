/**
 * OrganizationDomain - Organization and department management service
 * Provides org structure, department hierarchy, and member management
 *
 * ? Migrated to backend API (2025-12-21)
 */

import { delay } from '@/utils/async';
import { STORES, db } from '@/services/data/db';

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
  getAll: async () => {
    // Organizations are managed separately, not via adminApi
    const orgs = await db.getAll<Organization>(STORES.ORGS);
    return orgs;
  },
  getById: async (id: string) => {
    const org = await db.get<Organization>(STORES.ORGS, id);
    return org || null;
  },
  add: async (item: unknown) => {
    const org = {
      ...(item && typeof item === 'object' ? item : {}),
      createdAt: new Date().toISOString()
    };
    await db.put(STORES.ORGS, org);
    return org;
  },
  update: async (id: string, updates: unknown) => {
    const existing = await db.get<Organization>(STORES.ORGS, id);
    const updated = {
      ...(existing && typeof existing === 'object' ? existing : {}),
      ...(updates && typeof updates === 'object' ? updates : {})
    };
    await db.put(STORES.ORGS, updated);
    return updated;
  },
  delete: async (id: string) => {
    await db.delete(STORES.ORGS, id);
    return true;
  },
  
  // Organization specific methods
  getOrganizations: async (filters?: { type?: string }): Promise<Organization[]> => {
    let orgs = await db.getAll<Organization>(STORES.ORGS);

    if (filters?.type) {
      orgs = orgs.filter((o: Organization) => o.type === filters.type);
    }

    return orgs;
  },

  getDepartments: async (orgId: string): Promise<Department[]> => {
    await delay(50);
    const departments = await db.getAll<Department>('departments');
    return departments.filter((d: Department) => d.orgId === orgId);
  },

  getMembers: async (orgId: string, departmentId?: string): Promise<Member[]> => {
    await delay(50);
    let members = await db.getAll<Member>('org_members');

    members = members.filter((m: Member) => m.orgId === orgId);

    if (departmentId) {
      members = members.filter((m: Member) => m.departmentId === departmentId);
    }

    return members;
  },

  updateSettings: async (orgId: string, settings: Partial<OrgSettings>): Promise<OrgSettings> => {
    await delay(100);
    const org = await db.get<Organization>(STORES.ORGS, orgId);
    if (!org) throw new Error('Organization not found');

    const updatedSettings = { ...(org.settings || {}), ...settings };

    await db.put(STORES.ORGS, {
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

    await db.put('departments', newDept);
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

    await db.put('org_members', newMember);
    return newMember;
  },
};
