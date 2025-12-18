import { BackupSnapshot, ArchiveStats, SnapshotType } from '../../types';
import { delay } from '../../utils/async';

// In-memory simulation of backup state
let mockSnapshots: BackupSnapshot[] = [
    { id: 'snap-auto-001', name: 'Daily Automated Backup', type: 'Full', created: new Date(Date.now() - 86400000).toISOString(), size: '450 GB', status: 'Completed' },
    { id: 'snap-auto-002', name: 'Hourly Log Backup', type: 'Incremental', created: new Date(Date.now() - 3600000).toISOString(), size: '2.5 GB', status: 'Completed' },
    { id: 'snap-man-003', name: 'Pre-Deployment Snapshot', type: 'Full', created: new Date(Date.now() - 172800000).toISOString(), size: '448 GB', status: 'Completed' },
];

export const BackupService = {
    getSnapshots: async (): Promise<BackupSnapshot[]> => { 
        await delay(200); 
        return [...mockSnapshots]; 
    },
    
    getArchiveStats: async (): Promise<ArchiveStats> => { 
        await delay(200); 
        return { 
            totalSize: '85 TB', 
            objectCount: 1450200, 
            monthlyCost: 345.50, 
            retentionPolicy: '7 Years (WORM)', 
            glacierTier: 'Deep Archive' 
        }; 
    },
    
    createSnapshot: async (type: SnapshotType): Promise<BackupSnapshot> => { 
        await delay(1500); 
        const newSnap: BackupSnapshot = {
            id: `snap-man-${Date.now()}`,
            name: `Manual ${type} Backup`,
            type: type,
            created: new Date().toISOString(),
            size: type === 'Full' ? '452 GB' : '150 MB',
            status: 'Completed'
        };
        mockSnapshots = [newSnap, ...mockSnapshots];
        return newSnap; 
    },
    
    restoreSnapshot: async (id: string): Promise<boolean> => { 
        await delay(3000); 
        console.log(`[System] Restoring cluster state to snapshot ${id}...`);
        return true; 
    }
};
