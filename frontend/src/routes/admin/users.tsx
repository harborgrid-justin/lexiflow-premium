/**
 * Admin Users Management Page
 *
 * Enterprise user management with role assignment, permissions, and audit trails.
 */

import { authApi } from '@/lib/frontend-api';
import { useTheme } from "@/hooks/useTheme";
import type { User } from '@/types';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import type { Route } from './+types/users';

export async function loader(_args: Route.LoaderArgs) {
  try {
    const result = await authApi.getAllUsers({ page: 1, limit: 1000 });
    const users = result.ok ? result.data.data : [];
    return { users };
  } catch (error) {
    console.error('Failed to load users:', error);
    return { users: [] };
  }
}

export default function AdminUsersPage() {
  const { users } = useLoaderData() as Route.ComponentProps['loaderData'];
  const { theme, tokens } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      active: { bg: theme.status.success.bg, text: theme.status.success.text },
      inactive: { bg: theme.surface.muted, text: theme.text.secondary },
      pending: { bg: theme.status.warning.bg, text: theme.status.warning.text },
    };
    return styles[status] || styles.inactive;
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      admin: { bg: tokens.colors.purple400 + '20', text: tokens.colors.purple600 },
      attorney: { bg: tokens.colors.blue400 + '20', text: tokens.colors.blue600 },
      paralegal: { bg: tokens.colors.cyan400 + '20', text: tokens.colors.cyan600 },
      client: { bg: tokens.colors.orange400 + '20', text: tokens.colors.orange600 },
    };
    return styles[role] || { bg: theme.surface.muted, text: theme.text.secondary };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ color: theme.text.primary, fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold }}>
          User Management
        </h1>
        <p style={{ color: theme.text.secondary, marginTop: tokens.spacing.compact.sm }}>
          Manage user accounts, roles, and permissions for your organization.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div style={{ backgroundColor: theme.surface.default, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.sm, padding: tokens.spacing.normal.md }}>
          <p style={{ color: theme.text.secondary, fontSize: tokens.typography.fontSize.sm }}>Total Users</p>
          <p style={{ color: theme.text.primary, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold }}>{users.length}</p>
        </div>
        <div style={{ backgroundColor: theme.surface.default, borderRadius: tokens.borderRadius.lg, boxShadow: tokens.shadows.sm, padding: tokens.spacing.normal.md }}>
          <p style={{ color: theme.text.secondary, fontSize: tokens.typography.fontSize.sm }}>Active</p>
          <p style={{ color: theme.status.success.text, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold }}>{users.filter((u: User) => u.status === 'active').length}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)' }} className="rounded-lg shadow p-4">
          <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">MFA Enabled</p>
          <p className="text-2xl font-bold text-blue-600">{users.filter((u: User) => u.mfaEnabled).length}</p>
        </div>
        <div style={{ backgroundColor: 'var(--color-surface)' }} className="rounded-lg shadow p-4">
          <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{users.filter((u: User) => u.status === 'pending').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: 'var(--color-surface)' }} className="rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label style={{ color: 'var(--color-text)' }} className="block text-sm font-medium mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="attorney">Attorney</option>
              <option value="paralegal">Paralegal</option>
              <option value="client">Client</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              + Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                MFA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user: User) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status || 'inactive')}`}>
                    {(user.status || '').charAt(0).toUpperCase() + (user.status || '').slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.mfaEnabled ? (
                    <span className="text-green-500">✓ Enabled</span>
                  ) : (
                    <span className="text-yellow-500">✗ Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const meta: Route.MetaFunction = () => [
  { title: 'User Management - Admin - LexiFlow' },
  { name: 'description', content: 'Manage user accounts and permissions' },
];
