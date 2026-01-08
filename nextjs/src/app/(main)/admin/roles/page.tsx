/**
 * Roles Management Page
 * Next.js 16 Server Component for role and permission management
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Shield, Plus, Users, Lock, Edit, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type { Role, PermissionGroup } from '../types';
import { RolesClient } from './roles-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Role Management | Admin | LexiFlow',
  description: 'Configure roles and their associated permissions',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getRoles(): Promise<Role[]> {
  try {
    const roles = await apiFetch<Role[]>('/roles');
    return Array.isArray(roles) ? roles : [];
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return getDefaultRoles();
  }
}

async function getPermissionGroups(): Promise<PermissionGroup[]> {
  try {
    const groups = await apiFetch<PermissionGroup[]>('/permissions/groups');
    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    console.error('Failed to fetch permission groups:', error);
    return getDefaultPermissionGroups();
  }
}

function getDefaultRoles(): Role[] {
  return [
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      level: 100,
      isSystem: true,
      permissions: ['*:*'],
      userCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Attorney',
      description: 'Access to case management and legal documents',
      level: 80,
      isSystem: true,
      permissions: ['cases:*', 'documents:*', 'billing:read'],
      userCount: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Paralegal',
      description: 'Support role with document and case access',
      level: 60,
      isSystem: true,
      permissions: ['cases:read', 'documents:*', 'discovery:*'],
      userCount: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Staff',
      description: 'General staff with limited access',
      level: 40,
      isSystem: false,
      permissions: ['cases:read', 'documents:read'],
      userCount: 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Client',
      description: 'Client portal access only',
      level: 20,
      isSystem: true,
      permissions: ['client-portal:*'],
      userCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getDefaultPermissionGroups(): PermissionGroup[] {
  return [
    {
      name: 'Cases',
      description: 'Case management permissions',
      permissions: [
        { id: 'cases:create', resource: 'cases', action: 'create', description: 'Create new cases', category: 'Cases' },
        { id: 'cases:read', resource: 'cases', action: 'read', description: 'View cases', category: 'Cases' },
        { id: 'cases:update', resource: 'cases', action: 'update', description: 'Edit cases', category: 'Cases' },
        { id: 'cases:delete', resource: 'cases', action: 'delete', description: 'Delete cases', category: 'Cases' },
      ],
    },
    {
      name: 'Documents',
      description: 'Document management permissions',
      permissions: [
        { id: 'documents:create', resource: 'documents', action: 'create', description: 'Upload documents', category: 'Documents' },
        { id: 'documents:read', resource: 'documents', action: 'read', description: 'View documents', category: 'Documents' },
        { id: 'documents:update', resource: 'documents', action: 'update', description: 'Edit documents', category: 'Documents' },
        { id: 'documents:delete', resource: 'documents', action: 'delete', description: 'Delete documents', category: 'Documents' },
      ],
    },
    {
      name: 'Billing',
      description: 'Billing and financial permissions',
      permissions: [
        { id: 'billing:create', resource: 'billing', action: 'create', description: 'Create invoices', category: 'Billing' },
        { id: 'billing:read', resource: 'billing', action: 'read', description: 'View billing', category: 'Billing' },
        { id: 'billing:approve', resource: 'billing', action: 'approve', description: 'Approve billing', category: 'Billing' },
      ],
    },
  ];
}

// =============================================================================
// Components
// =============================================================================

function getLevelColor(level: number): string {
  if (level >= 90) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (level >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (level >= 50) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (level >= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}

function RoleCard({ role, isSelected, onClick }: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-700 last:border-0 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              role.isSystem ? 'bg-blue-500' : 'bg-green-500'
            }`}
          />
          <div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              {role.name}
              {role.isSystem && (
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  (System)
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {role.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(role.level)}`}
          >
            Level {role.level}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {role.userCount} users
          </span>
        </div>
      </div>
    </div>
  );
}

function RolesLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-4">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function RolesContent() {
  const [roles, permissionGroups] = await Promise.all([
    getRoles(),
    getPermissionGroups(),
  ]);

  return <RolesClient roles={roles} permissionGroups={permissionGroups} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminRolesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">Roles</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Role Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Configure roles and their associated permissions for your organization.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<RolesLoading />}>
        <RolesContent />
      </Suspense>
    </div>
  );
}
