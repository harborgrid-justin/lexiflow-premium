
import { BackupSnapshot, ArchiveStats, SnapshotType } from '../../types';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const BackupService = {
    getSnapshots: async (): Promise<BackupSnapshot[]> => { await delay(100); return []; },
    getArchiveStats: async (): Promise<ArchiveStats> => { await delay(100); return { totalSize: '0', objectCount: 0, monthlyCost: 0, retentionPolicy: '', glacierTier: '' }; },
    createSnapshot: async (type: SnapshotType): Promise<any> => { await delay(100); return {}; },
    restoreSnapshot: async (id: string): Promise<boolean> => { await delay(100); return true; }
};
