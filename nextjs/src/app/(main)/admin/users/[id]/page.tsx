/**
 * User Detail/Edit Page
 * Next.js 16 Server Component with async params
 *
 * Features:
 * - User profile display
 * - Edit user information
 * - Role and permission management
 * - Activity history
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Calendar,
  Clock,
  Building,
  Key,
  Activity,
  Edit,
  UserX,
  UserCheck,
} from 'lucide-react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import type { AdminUser, UserDetailPageProps } from '../../types';
import { UserEditForm } from './user-edit-form';

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({
  params,
}: UserDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await getUser(resolvedParams.id);

  if (!user) {
    return {
      title: 'User Not Found | Admin | LexiFlow',
    };
  }

  return {
    title: `${user.firstName} ${user.lastName} | Admin | LexiFlow`,
    description: `Manage user account for ${user.email}`,
    robots: { index: false, follow: false },
  };
}

// =============================================================================
// Data Fetching
// =============================================================================

async function getUser(id: string): Promise<AdminUser | null> {
  try {
    const user = await apiFetch<AdminUser>(API_ENDPOINTS.USERS.DETAIL(id));
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

async function getUserActivity(id: string): Promise<unknown[]> {
  try {
    const logs = await apiFetch<unknown[]>(
      `${API_ENDPOINTS.AUDIT_LOGS.LIST}?userId=${id}&limit=10`
    );
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
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

function UserAvatar({
  firstName,
  lastName,
  size = 'lg',
}: {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-16 w-16 text-xl',
    lg: 'h-24 w-24 text-3xl',
  };

  return (
    <div
      className={`rounded-full bg-blue-500 flex items-center justify-center text-white font-bold ${sizeClasses[size]}`}
    >
      {initials || '?'}
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-slate-400 dark:text-slate-500 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function UserDetailLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Link Loading */}
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />

      {/* Header Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Content Loading */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
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

async function UserDetailContent({ userId }: { userId: string }) {
  const [user, activityLogs] = await Promise.all([
    getUser(userId),
    getUserActivity(userId),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <>
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-6">
          <UserAvatar firstName={user.firstName} lastName={user.lastName} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadge(user.role)}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(user.status)}`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
              {user.mfaEnabled && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Shield className="h-3 w-3" />
                  MFA
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            {user.status === 'active' ? (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <UserX className="h-4 w-4" />
                Deactivate
              </button>
            ) : (
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserCheck className="h-4 w-4" />
                Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              User Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoItem
                icon={<Mail className="h-5 w-5" />}
                label="Email"
                value={user.email}
              />
              <InfoItem
                icon={<Phone className="h-5 w-5" />}
                label="Phone"
                value={user.phone || 'Not provided'}
              />
              <InfoItem
                icon={<Building className="h-5 w-5" />}
                label="Department"
                value={user.department || 'Not assigned'}
              />
              <InfoItem
                icon={<Shield className="h-5 w-5" />}
                label="Role"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              />
              <InfoItem
                icon={<Calendar className="h-5 w-5" />}
                label="Created"
                value={new Date(user.createdAt).toLocaleDateString()}
              />
              <InfoItem
                icon={<Clock className="h-5 w-5" />}
                label="Last Login"
                value={
                  user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : 'Never'
                }
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Permissions
            </h2>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Permissions inherited from role
              </p>
            )}
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.mfaEnabled
                        ? 'Enabled - Account secured with 2FA'
                        : 'Not enabled - Consider enabling for security'}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    user.mfaEnabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                type="button"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </h2>
            {activityLogs.length > 0 ? (
              <div className="space-y-4">
                {activityLogs.slice(0, 10).map((log: any, index: number) => (
                  <div
                    key={log.id || index}
                    className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {log.action || 'Activity'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const resolvedParams = await params;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <Suspense fallback={<UserDetailLoading />}>
        <UserDetailContent userId={resolvedParams.id} />
      </Suspense>
    </div>
  );
}
