/**
 * Backup & Restore Route
 *
 * Enterprise-grade backup management.
 * Logic delegates to BackupManager feature component.
 *
 * @module routes/admin/backup
 */

import { adminApi } from '@/lib/frontend-api';
import { BackupManager, type Backup, type BackupSchedule, type BackupStats } from '@/routes/admin/components/BackupManager';
import { useLoaderData, type ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

interface ApiBackupSchedule {
  id: string;
  name: string;
  frequency?: string;
  type?: string;
  enabled?: boolean;
  nextRun?: string;
  lastRun?: string;
  retentionDays?: number;
}

interface LoaderData {
  backups: Backup[];
  schedules: BackupSchedule[];
  stats: BackupStats;
}

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
// Loader
// ============================================================================

export async function loader(): Promise<LoaderData> {
  const [snapshotsResult, schedulesResult] = await Promise.all([
    adminApi.getBackupSnapshots({ page: 1, limit: 100 }),
    adminApi.getBackupSchedules({ page: 1, limit: 100 }),
  ]);

  const snapshots = snapshotsResult.ok ? snapshotsResult.data.data : [];
  const schedulesData = schedulesResult.ok ? schedulesResult.data.data : [];

  // Map snapshots to UI Backup type
  const backups: Backup[] = snapshots.map(s => ({
    ...s,
    retentionDays: 30, // Default or fetch from policy
    storageLocation: 'local', // Default
    createdAt: s.created || s.createdAt,
  }));

  const schedules: BackupSchedule[] = (schedulesData as ApiBackupSchedule[]).map((s) => ({
    id: s.id,
    name: s.name,
    frequency: (s.frequency as BackupSchedule['frequency']) || 'daily',
    type: (s.type as BackupSchedule['type']) || 'full',
    enabled: s.enabled ?? true,
    nextRun: s.nextRun || new Date().toISOString(),
    lastRun: s.lastRun,
    retentionDays: s.retentionDays || 30,
  }));

  const stats: BackupStats = {
    totalBackups: backups.length,
    totalSize: backups.reduce((sum, b) => {
      if (typeof b.size === 'string') {
        // Parse "1.5 GB" etc.
        const parts = b.size.split(' ');
        const val = parseFloat(parts[0] || '0');
        const unit = parts[1];
        let bytes = val;
        if (unit === 'KB') bytes *= 1024;
        if (unit === 'MB') bytes *= 1024 * 1024;
        if (unit === 'GB') bytes *= 1024 * 1024 * 1024;
        if (unit === 'TB') bytes *= 1024 * 1024 * 1024 * 1024;
        return sum + bytes;
      }
      return sum + (typeof b.size === 'number' ? b.size : 0);
    }, 0),
    lastBackup: backups[0]?.createdAt || null,
    nextScheduled: schedules.find(s => s.enabled)?.nextRun || null,
  };

  return { backups, schedules, stats };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-backup": {
      const type = formData.get("type") as 'full' | 'incremental';
      try {
        await BackupService.createSnapshot(type === 'full' ? 'Full' : 'Incremental');
        return { success: true, message: `Creating ${type} backup...` };
      } catch {
        return { success: false, error: "Failed to create backup" };
      }
    }

    case "restore": {
      const backupId = formData.get("backupId") as string;
      try {
        await BackupService.restoreSnapshot(backupId);
        return { success: true, message: `Restoring from backup ${backupId}...` };
      } catch {
        return { success: false, error: "Failed to restore backup" };
      }
    }

    case "delete-backup": {
      const backupId = formData.get("backupId") as string;
      try {
        await BackupService.deleteSnapshot(backupId);
        return { success: true, message: `Backup ${backupId} deleted` };
      } catch {
        return { success: false, error: "Failed to delete backup" };
      }
    }

    case "toggle-schedule": {
      const scheduleId = formData.get("scheduleId") as string;
      const enabled = formData.get("enabled") === "true";
      try {
        await BackupService.updateSchedule(scheduleId, { enabled });
        return { success: true, message: `Schedule ${enabled ? 'enabled' : 'disabled'}` };
      } catch {
        return { success: false, error: "Failed to update schedule" };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function BackupRoute() {
  const loaderData = useLoaderData() as LoaderData;
  return <BackupManager backups={loaderData.backups} schedules={loaderData.schedules} stats={loaderData.stats} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
