/**
 * Admin Roles Management Page
 *
 * Enterprise role management with permission templates and hierarchy.
 */

import type { Role } from '@/lib/frontend-api';
import { authApi } from '@/lib/frontend-api';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/roles';

export async function loader(_args: Route.LoaderArgs) {
  try {
    const [rolesResult, permissionsResult] = await Promise.all([
      authApi.getAllRoles({ page: 1, limit: 100 }),
      authApi.getAllPermissions({ page: 1, limit: 1000 })
    ]);
    const roles = rolesResult.ok ? rolesResult.data.data : [];
    const permissionGroups = permissionsResult.ok ? permissionsResult.data.data : [];
    return { roles, permissionGroups };
  } catch (error) {
    console.error('Failed to load roles data:', error);
    return { roles: [], permissionGroups: [] };
  }
}

export default function AdminRolesPage() {
  const { roles, permissionGroups } = useLoaderData() as Route.ComponentProps['loaderData'];
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const getLevelColor = (level: number) => {
    if (level >= 90) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    if (level >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (level >= 50) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (level >= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ color: 'var(--color-text)' }} className="text-3xl font-bold">
          Role Management
        </h1>
        <p style={{ color: 'var(--color-textMuted)' }} className="mt-2">
          Configure roles and their associated permissions for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-2">
          <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg shadow">
            <div style={{ borderColor: 'var(--color-border)' }} className="p-4 border-b flex justify-between items-center">
              <h2 style={{ color: 'var(--color-text)' }} className="text-lg font-semibold">Roles</h2>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                + Create Role
              </button>
            </div>
            <div style={{ borderColor: 'var(--color-border)' }} className="divide-y">
              {roles.map((role: Role) => (
                <div
                  key={role.id}
                  style={selectedRole?.id === role.id ? { backgroundColor: 'var(--color-surfaceHover)' } : {}}
                  className={`p-4 cursor-pointer transition-colors ${selectedRole?.id === role.id ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${role.isSystem ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div>
                        <h3 style={{ color: 'var(--color-text)' }} className="text-sm font-medium">
                          {role.name}
                          {role.isSystem && (
                            <span style={{ color: 'var(--color-textMuted)' }} className="ml-2 text-xs">(System)</span>
                          )}
                        </h3>
                        <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(role.level)}`}>
                        Level {role.level}
                      </span>
                      <span style={{ color: 'var(--color-textMuted)' }} className="text-sm">
                        {role.userCount} users
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Details */}
        <div className="lg:col-span-1">
          <div style={{ backgroundColor: 'var(--color-surface)' }} className="rounded-lg shadow p-4 sticky top-4">
            {selectedRole ? (
              <>
                <h3 style={{ color: 'var(--color-text)' }} className="text-lg font-semibold mb-4">
                  {selectedRole.name} Permissions
                </h3>
                <div className="space-y-4">
                  {selectedRole.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: 'var(--color-surfaceHover)' }}
                      className="flex items-center justify-between p-2 rounded"
                    >
                      <code style={{ color: 'var(--color-text)' }} className="text-sm">{perm}</code>
                      <span className="text-green-500">✓</span>
                    </div>
                  ))}
                </div>
                {!selectedRole.isSystem && (
                  <div className="mt-6 space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Edit Role
                    </button>
                    <button className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Delete Role
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--color-textMuted)' }} className="text-center py-8">
                <p>Select a role to view permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div style={{ backgroundColor: 'var(--color-surface)' }} className="mt-8 rounded-lg shadow p-6">
        <h2 style={{ color: 'var(--color-text)' }} className="text-lg font-semibold mb-4">
          Permission Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {permissionGroups.map((group) => (
            <div key={group.name} style={{ borderColor: 'var(--color-border)' }} className="border rounded-lg p-4">
              <h3 style={{ color: 'var(--color-text)' }} className="font-medium mb-3">{group.name}</h3>
              <div className="space-y-2">
                {group.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center text-sm">
                    <span style={{ color: 'var(--color-textMuted)' }}>{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const meta: Route.MetaFunction = () => [
  { title: 'Role Management - Admin - LexiFlow' },
  { name: 'description', content: 'Manage roles and permissions' },
];
