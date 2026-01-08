/**
 * Admin Users Management Page
 * Next.js 16 Server Component with user listing, filtering, and CRUD operations
 *
 * Features:
 * - User listing with search and filters
 * - Role and status filtering
 * - User invite functionality
 * - Deactivate/reactivate users
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Shield,
  Mail,
  MoreVertical,
  UserCheck,
  UserX,
  Key,
} from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { AdminUser, AdminPageProps } from '../types';
import { UsersClient } from './users-client';

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: 'User Management | Admin | LexiFlow',
  description: 'Manage user accounts, roles, and permissions',
  robots: { index: false, follow: false },
};

// =============================================================================
// Data Fetching
// =============================================================================

async function getUsers(filters?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<AdminUser[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.role && filters.role !== 'all') {
      queryParams.set('role', filters.role);
    }
    if (filters?.status && filters.status !== 'all') {
      queryParams.set('status', filters.status);
    }
    if (filters?.search) {
      queryParams.set('search', filters.search);
    }

    const endpoint = `${API_ENDPOINTS.USERS.LIST}${queryParams.toString() ? `?${queryParams}` : ''}`;
    const users = await apiFetch<AdminUser[]>(endpoint);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

// =============================================================================
// Components
// =============================================================================

function getStatusBadge(status: string): string {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return statusColors[status] || statusColors.inactive;
}

function getRoleBadge(role: string): string {
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    attorney: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paralegal: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    staff: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    client: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return roleColors[role] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

function UserAvatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
      {initials || '?'}
    </div>
  );
}

interface UserStatsProps {
  users: AdminUser[];
}

function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const mfaEnabled = users.filter((u) => u.mfaEnabled).length;
  const pendingUsers = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
        <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">MFA Enabled</p>
        <p className="text-2xl font-bold text-blue-600">{mfaEnabled}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
        <p className="text-2xl font-bold text-yellow-600">{pendingUsers}</p>
      </div>
    </div>
  );
}

interface UsersTableProps {
  users: AdminUser[];
}

function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
          No users found
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              MFA
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <UserAvatar firstName={user.firstName} lastName={user.lastName} />
                  <div className="ml-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {user.mfaEnabled ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Enabled</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                    <Key className="h-4 w-4" />
                    <span className="text-sm">Disabled</span>
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </Link>
                  {user.status === 'active' ? (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersLoading() {
  return (
    <div className="space-y-4">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Table Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Async Content
// =============================================================================

async function UsersContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const role = typeof searchParams.role === 'string' ? searchParams.role : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const users = await getUsers({ role, status, search });

  return (
    <>
      <UserStats users={users} />
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
        <UsersTable users={users} />
      </div>
    </>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function AdminUsersPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-200">
            Admin
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">Users</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              User Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage user accounts, roles, and permissions for your organization.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters - Client Component */}
      <UsersClient />

      {/* Users Content */}
      <Suspense fallback={<UsersLoading />}>
        <UsersContent searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
}
