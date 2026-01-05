/**
 * Admin Roles Management Page
 *
 * Enterprise role management with permission templates and hierarchy.
 */

import { rolesService, type Role } from '@/services/api/roles.service';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/roles';

export async function loader(_args: Route.LoaderArgs) {
  try {
    const [roles, permissionGroups] = await Promise.all([
      rolesService.getRoles(),
      rolesService.getPermissions()
    ]);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Role Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure roles and their associated permissions for your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h2>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                + Create Role
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role: Role) => (
                <div
                  key={role.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRole?.id === role.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${role.isSystem ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.name}
                          {role.isSystem && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(System)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelColor(role.level)}`}>
                        Level {role.level}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-4">
            {selectedRole ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedRole.name} Permissions
                </h3>
                <div className="space-y-4">
                  {selectedRole.permissions.map((perm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <code className="text-sm text-gray-700 dark:text-gray-300">{perm}</code>
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
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Select a role to view permissions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Permission Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {permissionGroups.map((group) => (
            <div key={group.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">{group.name}</h3>
              <div className="space-y-2">
                {group.permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{perm.name}</span>
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
