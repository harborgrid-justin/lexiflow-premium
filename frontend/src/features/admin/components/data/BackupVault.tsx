
import React, { useState } from 'react';
import { RefreshCw, Play, ShieldCheck, Server, AlertCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { BackupSnapshot } from '@/api/data-platform/backups-api';
import { useNotify } from '@/hooks/useNotify';
import { BackupMetrics } from './backup/BackupMetrics';
import { SnapshotList } from './backup/SnapshotList';
import { CreateSnapshotModal, RestoreSnapshotModal } from './backup/BackupModals';
import { dataPlatformApi } from '@/api/data-platform';

export const BackupVault: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState<BackupSnapshot | null>(null);

  // Real Backend Integration - Fetch snapshots from backend API
  const { data: snapshotsResponse, isLoading: isLoadingSnapshots, refetch: refetchSnapshots } = useQuery(
      ['backups', 'snapshots'],
      () => dataPlatformApi.backups.getSnapshots(),
  );

  const snapshots = snapshotsResponse?.data || [];

  const { data: stats } = useQuery(
      ['backups', 'stats'],
      () => dataPlatformApi.backups.getStats(),
  );

  // Mutations with real backend
  const { mutate: createSnapshot, isLoading: isCreating } = useMutation(
      (data: { name: string; description?: string; type: string }) => 
          dataPlatformApi.backups.createSnapshot(data),
      {
          onSuccess: (snap) => {
              notify.success(`Snapshot ${snap.name} created successfully.`);
              setIsSnapshotModalOpen(false);
              void refetchSnapshots();
          },
          onError: () => notify.error("Failed to create snapshot."),
          invalidateKeys: [['backups', 'snapshots'], ['backups', 'stats']],
      }
  );

  const { mutate: restoreSnapshot, isLoading: isRestoring } = useMutation(
      (data: { id: string; target: string }) => 
          dataPlatformApi.backups.restore(data.id, data.target),
      {
          onSuccess: () => {
              notify.success("System restoration initiated. You will be notified upon completion.");
              setRestoreModalOpen(null);
          },
          onError: () => notify.error("Restore failed. Check system logs."),
      }
  );

  const handleSnapshot = (type: string) => {
      createSnapshot({
          name: `Snapshot-${Date.now()}`,
          description: `Automated ${type} snapshot`,
          type,
      });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto h-full overflow-y-auto">
        {/* Header Actions */}
        <div className={cn("p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
            <div>
                <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text.primary)}>
                    <ShieldCheck className="h-5 w-5 text-green-600"/> Automated Recovery Vault
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Point-in-time recovery for entire cluster. RPO: 15min / RTO: 30min.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" icon={RefreshCw} onClick={() => queryClient.invalidate(['backups'])}>Refresh</Button>
                <Button variant="primary" icon={Play} onClick={() => setIsSnapshotModalOpen(true)}>Trigger Snapshot</Button>
            </div>
        </div>

        <BackupMetrics latestCreated={snapshots.length > 0 ? snapshots[0].createdAt : undefined} stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Snapshots Table */}
            <div className="col-span-2 space-y-4">
                <h4 className={cn("text-sm font-bold uppercase border-b pb-2", theme.text.secondary, theme.border.default)}>Active Recovery Points</h4>
                <SnapshotList snapshots={snapshots} isLoading={isLoadingSnapshots} onRestore={setRestoreModalOpen} />
            </div>
            
            {/* Cold Storage & Info */}
            <div className="space-y-6">
                 <div className={cn("p-4 border rounded-lg", theme.surface.default, theme.border.default)}>
                     <h4 className={cn("text-sm font-bold uppercase mb-4", theme.text.secondary)}>Archival Storage (Glacier)</h4>
                     <div className="space-y-4">
                         <div className="flex items-center gap-3">
                             <Server className={cn("h-8 w-8 text-blue-500")}/>
                             <div>
                                 <p className={cn("font-bold", theme.text.primary)}>{String((stats as Record<string, unknown>)?.glacierTier || 'Standard')}</p>
                                 <p className={cn("text-xs", theme.text.secondary)}>Retention: {String((stats as Record<string, unknown>)?.retentionPolicy || '30 days')}</p>
                             </div>
                         </div>
                         <div className={cn("h-2 w-full rounded-full overflow-hidden", theme.border.default)}>
                             <div className="h-full bg-blue-500 w-3/4"></div>
                         </div>
                         <div className={cn("flex justify-between text-xs", theme.text.secondary)}>
                             <span>Used: 75%</span>
                             <span>Quota: 20 TB</span>
                         </div>
                     </div>
                 </div>

                 <div className={cn("p-4 border rounded-lg", theme.status.warning.bg, theme.status.warning.border)}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className={cn("h-5 w-5 mt-0.5 shrink-0", theme.status.warning.text)}/>
                        <div>
                            <h5 className={cn("text-sm font-bold", theme.status.warning.text)}>Disaster Recovery Protocol</h5>
                            <p className={cn("text-xs mt-1 leading-relaxed", theme.status.warning.text)}>
                                In case of regional failure, use the <strong className="font-semibold">Replication Manager</strong> to promote the EU-West replica. Restoring from a snapshot here is for data corruption incidents only.
                            </p>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        <CreateSnapshotModal 
            isOpen={isSnapshotModalOpen}
            onClose={() => setIsSnapshotModalOpen(false)}
            onSnapshot={handleSnapshot}
            isCreating={isCreating}
        />

        <RestoreSnapshotModal 
            snapshot={restoreModalOpen}
            onClose={() => setRestoreModalOpen(null)}
            onRestore={() => restoreModalOpen && restoreSnapshot({ id: restoreModalOpen.id, target: 'primary' })}
            isRestoring={isRestoring}
        />
    </div>
  );
};

export default BackupVault;
