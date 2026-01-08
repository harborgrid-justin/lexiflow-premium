/**
 * Admin Users Management Page
 * Next.js 16 Server Component with user listing, filtering, and CRUD operations
 *
 * Features:
 * - User listing with search and filters
 * - Role and status filtering
 * - Create, Edit, Delete user modals
 * - Deactivate/reactivate users
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { AdminUser, AdminPageProps } from '../types';
import { UsersClientWrapper } from './users-client-wrapper';

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
// Loading Component
// =============================================================================

function UsersLoading() {
  return (
    <div className="space-y-4">
      {/* Filters Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

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
// Main Page Component
// =============================================================================

export default async function AdminUsersPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;

  // Extract filter params
  const role = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : undefined;
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

  // Fetch users server-side
  const users = await getUsers({ role, status, search });

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
        </div>
      </div>

      {/* Client Wrapper with Filters, Modals, Stats, and Table */}
      <Suspense fallback={<UsersLoading />}>
        <UsersClientWrapper users={users} />
      </Suspense>
    </div>
  );
}
