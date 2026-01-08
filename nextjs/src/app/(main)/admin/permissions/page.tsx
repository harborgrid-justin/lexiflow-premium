/**
 * Permissions Configuration Page
 * Next.js 16 Server Component for managing granular permissions
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Lock, Search, Plus, Eye, Shield } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import type { Permission } from '../types';
import { PermissionsClient } from './permissions-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'Permission Management | Admin | LexiFlow',
  description: 'View and manage granular permissions across all system resources',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getPermissions(): Promise<Permission[]> {
  try {
    const permissions = await apiFetch<Permission[]>(API_ENDPOINTS.PERMISSIONS.LIST);
    return Array.isArray(permissions) ? permissions : [];
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
    return getDefaultPermissions();
  }
}

function getDefaultPermissions(): Permission[] {
  return [
    // Cases
    { id: 'cases:create', resource: 'cases', action: 'create', description: 'Create new cases', category: 'Cases', roleCount: 3 },
    { id: 'cases:read', resource: 'cases', action: 'read', description: 'View case details', category: 'Cases', roleCount: 5 },
    { id: 'cases:update', resource: 'cases', action: 'update', description: 'Edit case information', category: 'Cases', roleCount: 3 },
    { id: 'cases:delete', resource: 'cases', action: 'delete', description: 'Delete cases', category: 'Cases', roleCount: 2 },
    // Documents
    { id: 'documents:create', resource: 'documents', action: 'create', description: 'Upload documents', category: 'Documents', roleCount: 4 },
    { id: 'documents:read', resource: 'documents', action: 'read', description: 'View documents', category: 'Documents', roleCount: 5 },
    { id: 'documents:update', resource: 'documents', action: 'update', description: 'Edit documents', category: 'Documents', roleCount: 4 },
    { id: 'documents:delete', resource: 'documents', action: 'delete', description: 'Delete documents', category: 'Documents', roleCount: 2 },
    { id: 'documents:export', resource: 'documents', action: 'export', description: 'Export documents', category: 'Documents', roleCount: 3 },
    // Billing
    { id: 'billing:create', resource: 'billing', action: 'create', description: 'Create invoices and time entries', category: 'Billing', roleCount: 3 },
    { id: 'billing:read', resource: 'billing', action: 'read', description: 'View billing information', category: 'Billing', roleCount: 4 },
    { id: 'billing:approve', resource: 'billing', action: 'approve', description: 'Approve billing entries', category: 'Billing', roleCount: 2 },
    // Users
    { id: 'users:create', resource: 'users', action: 'create', description: 'Create user accounts', category: 'Users', roleCount: 1 },
    { id: 'users:read', resource: 'users', action: 'read', description: 'View user profiles', category: 'Users', roleCount: 3 },
    { id: 'users:update', resource: 'users', action: 'update', description: 'Edit user accounts', category: 'Users', roleCount: 1 },
    { id: 'users:delete', resource: 'users', action: 'delete', description: 'Delete user accounts', category: 'Users', roleCount: 1 },
    // Admin
    { id: 'admin:settings', resource: 'admin', action: 'admin', description: 'Manage system settings', category: 'Admin', roleCount: 1 },
    { id: 'admin:roles', resource: 'admin', action: 'admin', description: 'Manage roles and permissions', category: 'Admin', roleCount: 1 },
    { id: 'admin:audit', resource: 'admin', action: 'read', description: 'View audit logs', category: 'Admin', roleCount: 2 },
  ];
}

// =============================================================================
// Components
// =============================================================================

function getActionColor(action: string): string {
  const colors: Record<string, string> = {
    create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    read: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    approve: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    export: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return colors[action] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

function PermissionsLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Filter Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Loading */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-16 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function PermissionsContent() {
  const permissions = await getPermissions();
  return <PermissionsClient permissions={permissions} />;
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminPermissionsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">Permissions</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Permission Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View and manage granular permissions across all system resources.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Permission
          </button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<PermissionsLoading />}>
        <PermissionsContent />
      </Suspense>

      {/* Permission Format Guide */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Permission Format Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Format</h4>
            <code className="block p-2 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-700">
              resource:action
            </code>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              Example: <code className="bg-white dark:bg-slate-800 px-1 rounded">cases:read</code>,{' '}
              <code className="bg-white dark:bg-slate-800 px-1 rounded">documents:create</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Wildcards</h4>
            <code className="block p-2 bg-white dark:bg-slate-800 rounded border border-blue-200 dark:border-blue-700">
              resource:* or *:*
            </code>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              Use <code className="bg-white dark:bg-slate-800 px-1 rounded">*</code> for all actions
              on a resource, or <code className="bg-white dark:bg-slate-800 px-1 rounded">*:*</code>{' '}
              for full admin access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
