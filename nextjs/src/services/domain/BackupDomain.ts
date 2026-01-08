/**
 * @module BackupDomain
 * @description Enterprise backup and snapshot management service
 */

import { BackupsApiService } from "@/api/admin/backups-api";
import { ArchiveStats, BackupSnapshot, SnapshotType } from "@/types";

export const BACKUP_QUERY_KEYS = {
  all: ["backup"] as const,
  snapshots: ["backup", "snapshots"] as const,
  snapshot: (id: string) => ["backup", "snapshot", id] as const,
  archiveStats: ["backup", "archive-stats"] as const,
} as const;

function validateSnapshotType(type: unknown, methodName: string): void {
  const validTypes: SnapshotType[] = ["Full", "Incremental"];

  if (!type || !validTypes.includes(type as SnapshotType)) {
    throw new Error(
      `[BackupService.${methodName}] Invalid snapshot type. Must be: ${validTypes.join(", ")}`
    );
  }
}

function validateSnapshotId(id: unknown, methodName: string): void {
  if (!id || typeof id !== "string" || id.trim() === "") {
    throw new Error(
      `[BackupService.${methodName}] Snapshot ID is required and must be a non-empty string`
    );
  }
  // Removing strict check for 'snap-' prefix to allow generic IDs if backend changes format
  // if (!id.startsWith("snap-")) ...
}

export const BackupService = {
  getSnapshots: async (): Promise<BackupSnapshot[]> => {
    try {
      const backupApi = new BackupsApiService();
      const backups = await backupApi.getAll();

      // Transform backend Backup to BackupSnapshot format
      return backups
        .map(
          (backup): BackupSnapshot => ({
            id: backup.id,
            name: backup.name,
            type: backup.type === "full" ? "Full" : "Incremental",
            created: backup.startedAt,
            size: backup.size
              ? `${(backup.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
              : "Unknown",
            status:
              backup.status === "completed"
                ? "Completed"
                : backup.status === "in_progress"
                  ? "Running"
                  : "Failed",
          })
        )
        .sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
    } catch (error) {
      console.error("[BackupService.getSnapshots] Backend unavailable:", error);
      return [];
    }
  },

  getArchiveStats: async (): Promise<ArchiveStats> => {
    try {
      const backupApi = new BackupsApiService();
      const stats = await backupApi.getArchiveStats();
      return {
        ...stats,
        glacierTier: "Deep Archive",
      };
    } catch (error) {
      console.error("[BackupService.getArchiveStats] Error:", error);
      throw error;
    }
  },

  createSnapshot: async (type: SnapshotType): Promise<BackupSnapshot> => {
    try {
      validateSnapshotType(type, "createSnapshot");

      const backupApi = new BackupsApiService();
      const backup = await backupApi.create({
        name: `Manual ${type} Backup`,
        type: type.toLowerCase() as "full" | "incremental" | "differential",
      });

      const newSnap: BackupSnapshot = {
        id: backup.id,
        name: backup.name,
        type: type,
        created: backup.startedAt,
        size: backup.size
          ? `${(backup.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
          : "Processing",
        status: backup.status === "completed" ? "Completed" : "Running",
      };

      console.log(`[BackupService] Created ${type} snapshot: ${newSnap.id}`);
      return newSnap;
    } catch (error) {
      console.error("[BackupService.createSnapshot] Error:", error);
      throw error;
    }
  },

  restoreSnapshot: async (id: string): Promise<boolean> => {
    try {
      validateSnapshotId(id, "restoreSnapshot");

      const backupApi = new BackupsApiService();
      await backupApi.restore(id);

      console.log(`[BackupService] Successfully restored snapshot ${id}`);
      return true;
    } catch (error) {
      console.error("[BackupService.restoreSnapshot] Error:", error);
      throw error;
    }
  },
};
