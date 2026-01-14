import type { BackupSnapshot } from "@/api/data-platform/backups-api";

export interface CreateSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnapshot: (type: string) => void;
  isCreating: boolean;
}

export interface RestoreSnapshotModalProps {
  snapshot: BackupSnapshot | null;
  onClose: () => void;
  onRestore: () => void;
  isRestoring: boolean;
}
