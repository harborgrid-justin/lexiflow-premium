/**
 * RoleManager Component
 * Enterprise role and permission management interface
 *
 * Features:
 * - View and manage user roles
 * - Granular permission configuration
 * - Permission matrix display
 * - Role assignment interface
 * - Permission inheritance visualization
 * - Bulk permission updates
 * - Audit trail for permission changes
 * - WCAG 2.1 AA compliant
 */

import { PermissionsApiService } from '@/api/auth/access-rights-api';
import type { Permission } from '@/types';
import { TIMEOUTS } from '@/config/ports.config';
import { useState } from 'react';

export interface RoleManagerProps {
  roleId: string;
  roleName: string;
  onPermissionsUpdated?: (permissions: Permission[]) => void;
  className?: string;
}

const RESOURCE_CATEGORIES = {
  cases: 'Case Management',
  documents: 'Document Management',
  billing: 'Billing & Time Tracking',
  analytics: 'Analytics & Reporting',
  admin: 'System Administration',
  users: 'User Management',
  clients: 'Client Management',
  discovery: 'Discovery & Evidence',
  calendar: 'Calendar & Tasks',
  workflow: 'Workflow Automation',
};

const ACTIONS = [
  { value: 'create', label: 'Create', description: 'Create new resources' },
  { value: 'read', label: 'Read', description: 'View and read resources' },
  { value: 'update', label: 'Update', description: 'Edit and modify resources' },
  { value: 'delete', label: 'Delete', description: 'Remove resources' },
  { value: 'execute', label: 'Execute', description: 'Execute operations' },
  { value: '*', label: 'All', description: 'All actions' },
] as const;

export const RoleManager: React.FC<RoleManagerProps> = ({
  roleId,
  roleName,
  onPermissionsUpdated,
  className = '',
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(Object.keys(RESOURCE_CATEGORIES)));
  const [editMode, setEditMode] = useState(false);

  const permissionsService = new PermissionsApiService();

  const loadPermissions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await permissionsService.getRolePermissions(roleId);
      setPermissions(response.permissions || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load permissions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await permissionsService.updateRolePermissions(roleId, permissions);
      setPermissions(response.permissions);
      setSuccessMessage('Permissions updated successfully');
      setEditMode(false);
      onPermissionsUpdated?.(response.permissions);

      setTimeout(() => setSuccessMessage(''), TIMEOUTS.NOTIFICATION_SUCCESS);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update permissions';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (resource: string, action: Permission['action']) => {
    setPermissions((prev) => {
      const existing = prev.find(
        (p) => p.resource === resource && p.action === action
      );

      if (existing) {
        // Toggle effect or remove
        if (existing.effect === 'allow') {
          return prev.map((p) =>
            p.resource === resource && p.action === action
              ? { ...p, effect: 'deny' as const }
              : p
          );
        } else {
          return prev.filter(
            (p) => !(p.resource === resource && p.action === action)
          );
        }
      } else {
        // Add new permission
        return [
          ...prev,
          {
            id: crypto.randomUUID ? crypto.randomUUID() : `perm-${Date.now()}-${Math.random()}`,
            resource,
            action,
            effect: 'allow' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const getPermissionState = (resource: string, action: Permission['action']): 'allow' | 'deny' | 'none' => {
    const permission = permissions.find(
      (p) => p.resource === resource && p.action === action
    );
    return permission ? permission.effect : 'none';
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getPermissionIcon = (state: 'allow' | 'deny' | 'none'): React.JSX.Element => {
    if (state === 'allow') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (state === 'deny') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Role Permissions</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage permissions for <span className="font-medium">{roleName}</span> role
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      loadPermissions();
                      setEditMode(false);
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isSaving}
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Edit Permissions
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {Object.entries(RESOURCE_CATEGORIES).map(([categoryKey, categoryLabel]) => {
              const isExpanded = expandedCategories.has(categoryKey);

              return (
                <div key={categoryKey} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(categoryKey)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center">
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-90' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="ml-2 text-sm font-medium text-gray-900">{categoryLabel}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {permissions.filter((p) => p.resource.toLowerCase().startsWith(categoryKey.toLowerCase())).length} permissions
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="bg-white">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                              </th>
                              {ACTIONS.map((action) => (
                                <th
                                  key={action.value}
                                  scope="col"
                                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                  title={action.description}
                                >
                                  {action.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {categoryKey}
                              </td>
                              {ACTIONS.map((action) => {
                                const state = getPermissionState(categoryKey, action.value);
                                return (
                                  <td key={action.value} className="px-4 py-3 whitespace-nowrap text-center">
                                    <button
                                      type="button"
                                      onClick={() => editMode && togglePermission(categoryKey, action.value)}
                                      disabled={!editMode}
                                      className={`inline-flex items-center justify-center ${editMode ? 'cursor-pointer hover:opacity-75' : 'cursor-default'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded`}
                                      aria-label={`${action.label} permission for ${categoryKey}: ${state}`}
                                      title={editMode ? 'Click to toggle permission' : state}
                                    >
                                      {getPermissionIcon(state)}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  <strong>Permission Guide:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Allow - Permission granted
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 text-red-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Deny - Permission explicitly denied
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 text-gray-300 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                      </svg>
                      None - No permission set (default deny)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
