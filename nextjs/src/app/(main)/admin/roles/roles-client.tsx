'use client';

/**
 * Roles Client Component
 * Handles role selection and permission display
 */

import { useState } from 'react';
import { Shield, Edit, Trash2, Check, Lock } from 'lucide-react';
import type { Role, PermissionGroup } from '../types';

interface RolesClientProps {
  roles: Role[];
  permissionGroups: PermissionGroup[];
}

function getLevelColor(level: number): string {
  if (level >= 90) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (level >= 70) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (level >= 50) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (level >= 30) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

export function RolesClient({ roles, permissionGroups }: RolesClientProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roles List */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Roles</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {roles.length} roles
            </span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
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
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Permission Groups
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permissionGroups.map((group) => (
              <div
                key={group.name}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
              >
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                    >
                      <Lock className="h-3 w-3 mr-2" />
                      {perm.description}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Details */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-4 sticky top-6">
          {selectedRole ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {selectedRole.name}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {selectedRole.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Level</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedRole.level}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Users</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedRole.userCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Type</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedRole.isSystem ? 'System' : 'Custom'}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                Permissions
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedRole.permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded"
                  >
                    <code className="text-sm text-slate-700 dark:text-slate-300">
                      {perm}
                    </code>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                ))}
              </div>

              {!selectedRole.isSystem && (
                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Role
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Role
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a role to view permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
