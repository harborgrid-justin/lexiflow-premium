
import { BackupSnapshot, ArchiveStats, SnapshotType } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_SNAPSHOTS: BackupSnapshot[] = [
    { 
        id: 'snap-001', 
        name: 'Auto-Snapshot-001',
        type: 'Incremental', 
        status: 'Completed', 
        size: '4.2 GB', 
        created: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        retention: '30 Days',
        region: 'us-east-1'
    },
    { 
        id: 'snap-002', 
        name: 'Auto-Snapshot-002',
        type: 'Incremental', 
        status: 'Completed', 
        size: '4.1 GB', 
        created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        retention: '30 Days',
        region: 'us-east-1'
    },
    { 
        id: 'snap-full-01', 
        name: 'Weekly-Full-Backup',
        type: 'Full', 
        status: 'Completed', 
        size: '145 GB', 
        created: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
        retention: '1 Year',
        region: 'us-east-1'
    },
];

let snapshotsStore = [...MOCK_SNAPSHOTS];

export const BackupService = {
    getSnapshots: async (): Promise<BackupSnapshot[]> => {
        await delay(500);
        // Sort descending by creation date
        return [...snapshotsStore].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    },

    getArchiveStats: async (): Promise<ArchiveStats> => {
        await delay(300);
        return {
            totalSize: '12.4 TB',
            objectCount: 145020,
            monthlyCost: 45.50,
            retentionPolicy: '7 Years (Strict)',
            glacierTier: 'Deep Archive'
        };
    },

    createSnapshot: async (type: SnapshotType): Promise<BackupSnapshot> => {
        await delay(1500); // Simulate processing
        const newSnap: BackupSnapshot = {
            id: `snap-${Date.now()}`,
            name: `Manual-${type}-${new Date().toISOString().split('T')[0]}`,
            type: type,
            status: 'Completed',
            size: type === 'Full' ? '146 GB' : '120 MB',
            created: new Date().toISOString(),
            retention: 'Manual / 90 Days',
            region: 'us-east-1'
        };
        snapshotsStore = [newSnap, ...snapshotsStore];
        return newSnap;
    },

    restoreSnapshot: async (id: string): Promise<boolean> => {
        await delay(3000); // Simulate restore time
        return true;
    }
};
