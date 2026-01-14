/**
 * Admin Permissions Management Page
 *
 * Enterprise permission management with granular access control.
 */

import { SYSTEM_PERMISSIONS, type PermissionDefinition } from '@/config/permissions';
import { authApi } from '@/lib/frontend-api';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/permissions';

interface Permission extends PermissionDefinition {
  roleCount?: number;
}

export async function loader(_args: Route.LoaderArgs) {
  const roleCounts: Record<string, number> = {};

  try {
    const result = await authApi.getAllRoles({ page: 1, limit: 100 });
    const roles = result.ok ? result.data.data : [];
    // Count how many roles have each permission
    roles.forEach(role => {
      if (role.permissions) {
        role.permissions.forEach(permId => {
          roleCounts[permId] = (roleCounts[permId] || 0) + 1;
        });
      }
    });
  } catch (error) {
    console.error("Failed to fetch roles for permission counts", error);
  }

  const permissions = SYSTEM_PERMISSIONS.map(p => ({
    ...p,
    roleCount: roleCounts[p.id] || 0
  }));

  return { permissions };
}

export default function AdminPermissionsPage() {
  const { permissions } = useLoaderData() as { permissions: Permission[] };
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [...new Set(permissions.map((p: Permission) => p.category))];

  const filteredPermissions = permissions.filter((perm: Permission) => {
    const matchesSearch =
      perm.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || perm.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedPermissions = filteredPermissions.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category]?.push(perm);
    return acc;
  }, {});

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      read: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      approve: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      produce: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Permission Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage granular permissions across all system resources.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Permissions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{permissions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Resources</p>
          <p className="text-2xl font-bold text-green-600">
            {new Set(permissions.map((p: Permission) => p.resource)).size}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Actions</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(permissions.map((p: Permission) => p.action)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              + Create Permission
            </button>
          </div>
        </div>
      </div>

      {/* Permissions by Category */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {(perms as Permission[]).map((perm) => (
                <div key={perm.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-300">
                        {perm.id}
                      </code>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getActionColor(perm.action)}`}>
                        {perm.action.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {perm.roleCount !== undefined ? (
                          `${perm.roleCount} roles`
                        ) : (
                          <span className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded block" />
                        )}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                        View Roles
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{perm.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Permission Format Guide */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Permission Format Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Format</h4>
            <code className="block p-2 bg-white dark:bg-gray-800 rounded">resource:action</code>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              Example: <code>cases:read</code>, <code>documents:create</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Wildcards</h4>
            <code className="block p-2 bg-white dark:bg-gray-800 rounded">resource:* or *:*</code>
            <p className="mt-2 text-blue-700 dark:text-blue-300">
              Use <code>*</code> for all actions on a resource, or <code>*:*</code> for full admin access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const meta: Route.MetaFunction = () => [
  { title: 'Permission Management - Admin - LexiFlow' },
  { name: 'description', content: 'Manage system permissions' },
];
