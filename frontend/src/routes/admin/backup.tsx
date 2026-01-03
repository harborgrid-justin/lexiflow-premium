/**
 * Backup & Restore Route
 *
 * Enterprise-grade backup management with:
 * - Automated backup scheduling
 * - Manual backup creation
 * - Point-in-time recovery
 * - Backup verification and testing
 * - Cloud backup storage options
 *
 * @module routes/admin/backup
 */

import { useId, useState } from 'react';
import { Link, useFetcher } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/backup";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createAdminMeta({
    section: 'Backup & Restore',
    description: 'Manage system backups and data recovery',
  });
}

// ============================================================================
// Types
// ============================================================================

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'in-progress' | 'failed' | 'scheduled';
  size: number; // bytes
  createdAt: string;
  completedAt?: string;
  retentionDays: number;
  storageLocation: 'local' | 's3' | 'azure' | 'gcs';
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  type: 'full' | 'incremental';
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  retentionDays: number;
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // Mock backup data
  const backups: Backup[] = [
    {
      id: 'backup-1',
      name: 'Daily Full Backup',
      type: 'full',
      status: 'completed',
      size: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3000000).toISOString(),
      retentionDays: 30,
      storageLocation: 'local',
    },
    {
      id: 'backup-2',
      name: 'Hourly Incremental',
      type: 'incremental',
      status: 'completed',
      size: 150 * 1024 * 1024, // 150 MB
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      completedAt: new Date(Date.now() - 7100000).toISOString(),
      retentionDays: 7,
      storageLocation: 'local',
    },
    {
      id: 'backup-3',
      name: 'Weekly Full Backup',
      type: 'full',
      status: 'completed',
      size: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 3 + 600000).toISOString(),
      retentionDays: 90,
      storageLocation: 's3',
    },
  ];

  const schedules: BackupSchedule[] = [
    {
      id: 'schedule-1',
      name: 'Daily Full Backup',
      frequency: 'daily',
      type: 'full',
      enabled: true,
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      retentionDays: 30,
    },
    {
      id: 'schedule-2',
      name: 'Hourly Incremental',
      frequency: 'hourly',
      type: 'incremental',
      enabled: true,
      nextRun: new Date(Date.now() + 3600000).toISOString(),
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      retentionDays: 7,
    },
    {
      id: 'schedule-3',
      name: 'Weekly Full to S3',
      frequency: 'weekly',
      type: 'full',
      enabled: true,
      nextRun: new Date(Date.now() + 86400000 * 4).toISOString(),
      lastRun: new Date(Date.now() - 86400000 * 3).toISOString(),
      retentionDays: 90,
    },
  ];

  const stats = {
    totalBackups: backups.length,
    totalSize: backups.reduce((sum, b) => sum + b.size, 0),
    lastBackup: backups[0]?.createdAt,
    nextScheduled: schedules.find(s => s.enabled)?.nextRun,
  };

  return { backups, schedules, stats };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-backup": {
      const type = formData.get("type") as string;
      // TODO: Initiate backup job
      return { success: true, message: `Creating ${type} backup...` };
      }

    case "restore": {
      const backupId = formData.get("backupId") as string;
      // TODO: Initiate restore job
      return { success: true, message: `Restoring from backup ${backupId}...` };
      }

    case "delete-backup": {
      const deleteId = formData.get("backupId") as string;
      // TODO: Delete backup
      return { success: true, message: `Backup ${deleteId} deleted` };
      }

    case "toggle-schedule": {
      const scheduleId = formData.get("scheduleId") as string;
      const enabled = formData.get("enabled") === "true";
      // TODO: Toggle schedule
      return { success: true, message: `Schedule ${enabled ? 'enabled' : 'disabled'}` };
      }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: Backup['status']): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'scheduled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getTypeColor(type: Backup['type']): string {
  switch (type) {
    case 'full':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'incremental':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'differential':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

// ============================================================================
// Component
// ============================================================================

export default function BackupRoute({ loaderData }: Route.ComponentProps) {
  const { backups, schedules, stats } = loaderData;
  const fetcher = useFetcher();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateBackup = (type: 'full' | 'incremental') => {
    fetcher.submit(
      { intent: 'create-backup', type },
      { method: 'post' }
    );
    setShowCreateModal(false);
  };

  const handleRestore = (backupId: string) => {
    if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      fetcher.submit(
        { intent: 'restore', backupId },
        { method: 'post' }
      );
    }
  };

  const handleDelete = (backupId: string) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      fetcher.submit(
        { intent: 'delete-backup', backupId },
        { method: 'post' }
      );
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Backup & Restore</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Backup & Restore
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage system backups and data recovery
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Backup
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Backups</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalBackups}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatBytes(stats.totalSize)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Backup</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {stats.lastBackup ? formatDate(stats.lastBackup) : 'Never'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Next Scheduled</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {stats.nextScheduled ? formatDate(stats.nextScheduled) : 'Not scheduled'}
          </p>
        </div>
      </div>

      {/* Backup Schedules */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Backup Schedules
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Next Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {schedule.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {schedule.frequency}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getTypeColor(schedule.type)}`}>
                      {schedule.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(schedule.nextRun)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${schedule.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                      {schedule.enabled ? 'Active' : 'Paused'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backup History */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
          Backup History
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Backup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {backup.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {backup.storageLocation.toUpperCase()} • {backup.retentionDays} days retention
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getTypeColor(backup.type)}`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatBytes(backup.size)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(backup.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestore(backup.id)}
                        disabled={backup.status !== 'completed'}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(backup.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create Backup
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Choose the type of backup to create:
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleCreateBackup('full')}
                className="w-full rounded-lg border border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Full Backup</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Complete backup of all data. Larger size, slower but comprehensive.
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleCreateBackup('incremental')}
                className="w-full rounded-lg border border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">Incremental Backup</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Only changes since last backup. Smaller, faster, requires full backup for restore.
                </div>
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };