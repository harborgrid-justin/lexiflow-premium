
import React, { useState } from 'react';
import { Archive, Download, Clock, RefreshCw, HardDrive, Database, ShieldCheck, AlertCircle, Play, Server, Trash2 } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { useQuery, useMutation, queryClient } from '../../../services/queryClient';
import { DataService } from '../../../services/dataService';
import { BackupSnapshot, ArchiveStats, SnapshotType } from '../../../types';
import { Modal } from '../../common/Modal';
import { MetricTile, StatusBadge } from '../../common/RefactoredCommon';
import { TableContainer, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../common/Table';
import { useNotify } from '../../../hooks/useNotify';

export const BackupVault: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState<BackupSnapshot | null>(null);

  // Queries
  const { data: snapshots = [], isLoading: isLoadingSnapshots } = useQuery<BackupSnapshot[]>(
      ['backup', 'snapshots'],
      DataService.backup.getSnapshots
  );

  const { data: stats, isLoading: isLoadingStats } = useQuery<ArchiveStats>(
      ['backup', 'archiveStats'],
      DataService.backup.getArchiveStats
  );

  // Mutations
  const { mutate: createSnapshot, isLoading: isCreating } = useMutation(
      DataService.backup.createSnapshot,
      {
          onSuccess: (snap) => {
              notify.success(`Snapshot ${snap.name} created successfully.`);
              setIsSnapshotModalOpen(false);
              queryClient.invalidate(['backup', 'snapshots']);
          },
          onError: () => notify.error("Failed to create snapshot.")
      }
  );

  const { mutate: restoreSnapshot, isLoading: isRestoring } = useMutation(
      DataService.backup.restoreSnapshot,
      {
          onSuccess: () => {
              notify.success("System restoration initiated. You will be notified upon completion.");
              setRestoreModalOpen(null);
          },
          onError: () => notify.error("Restore failed. Check system logs.")
      }
  );

  const handleSnapshot = (type: SnapshotType) => {
      createSnapshot(type);
  };

  const getSnapshotIcon = (type: SnapshotType) => {
      if (type === 'Full') return <Database className="h-4 w-4 text-purple-600" />;
      return <Clock className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto h-full overflow-y-auto">
        {/* Header Actions */}
        <div className={cn("p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4", theme.surfaceHighlight, theme.border.default)}>
            <div>
                <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text.primary)}>
                    <ShieldCheck className="h-5 w-5 text-green-600"/> Automated Recovery Vault
                </h3>
                <p className={cn("text-sm", theme.text.secondary)}>Point-in-time recovery for entire cluster. RPO: 15min / RTO: 30min.</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" icon={RefreshCw} onClick={() => queryClient.invalidate(['backup'])}>Refresh</Button>
                <Button variant="primary" icon={Play} onClick={() => setIsSnapshotModalOpen(true)}>Trigger Snapshot</Button>
            </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricTile 
                label="Latest Recovery Point" 
                value={snapshots.length > 0 ? new Date(snapshots[0].created).toLocaleTimeString() : 'N/A'} 
                icon={Clock} 
                trend="Healthy"
                trendUp={true}
            />
            <MetricTile 
                label="Cold Storage Usage" 
                value={stats?.totalSize || '...'} 
                icon={HardDrive} 
                trend={`${stats?.objectCount.toLocaleString()} Objects`}
            />
            <MetricTile 
                label="Monthly Cost" 
                value={`$${stats?.monthlyCost.toFixed(2)}`} 
                icon={Database} 
                trend="Optimized"
                trendUp={true}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Snapshots Table */}
            <div className="col-span-2 space-y-4">
                <h4 className={cn("text-sm font-bold uppercase border-b pb-2", theme.text.secondary, theme.border.default)}>Active Recovery Points</h4>
                <div className={cn("rounded-lg border overflow-hidden", theme.border.default)}>
                    <TableContainer responsive="card" className="border-0 shadow-none rounded-none">
                        <TableHeader>
                            <TableHead>Snapshot ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {isLoadingSnapshots ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading snapshots...</TableCell></TableRow>
                            ) : snapshots.map(snap => (
                                <TableRow key={snap.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", theme.surfaceHighlight)}>
                                                {getSnapshotIcon(snap.type)}
                                            </div>
                                            <div>
                                                <p className={cn("font-bold text-sm", theme.text.primary)}>{snap.name}</p>
                                                <p className={cn("text-xs font-mono", theme.text.tertiary)}>{snap.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{snap.type}</TableCell>
                                    <TableCell className={cn("text-xs", theme.text.secondary)}>{new Date(snap.created).toLocaleString()}</TableCell>
                                    <TableCell className="font-mono text-xs">{snap.size}</TableCell>
                                    <TableCell><StatusBadge status={snap.status}/></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="ghost" icon={Download}>Get</Button>
                                            <Button size="sm" variant="secondary" icon={Archive} onClick={() => setRestoreModalOpen(snap)}>Restore</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </div>
            </div>
            
            {/* Cold Storage & Info */}
            <div className="space-y-6">
                 <div className={cn("p-4 border rounded-lg", theme.surface, theme.border.default)}>
                     <h4 className={cn("text-sm font-bold uppercase mb-4", theme.text.secondary)}>Archival Storage (Glacier)</h4>
                     <div className="space-y-4">
                         <div className="flex items-center gap-3">
                             <Server className={cn("h-8 w-8 text-blue-500")}/>
                             <div>
                                 <p className={cn("font-bold", theme.text.primary)}>{stats?.glacierTier}</p>
                                 <p className={cn("text-xs", theme.text.secondary)}>Retention: {stats?.retentionPolicy}</p>
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

        {/* Create Modal */}
        <Modal isOpen={isSnapshotModalOpen} onClose={() => setIsSnapshotModalOpen(false)} title="Trigger Manual Snapshot">
            <div className="p-6">
                <p className={cn("text-sm mb-4", theme.text.secondary)}>
                    Manual snapshots are retained for 90 days by default. Choose snapshot type:
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleSnapshot('Incremental')}
                        className={cn("p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group", theme.border.default)}
                    >
                        <div className="flex items-center gap-2 mb-2 font-bold group-hover:text-blue-700">
                            <Clock className="h-5 w-5"/> Incremental
                        </div>
                        <p className="text-xs text-slate-500">Fast. Captures changes since last backup. Low storage impact.</p>
                    </button>
                    <button 
                         onClick={() => handleSnapshot('Full')}
                         className={cn("p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group", theme.border.default)}
                    >
                        <div className="flex items-center gap-2 mb-2 font-bold group-hover:text-purple-700">
                            <Database className="h-5 w-5"/> Full Backup
                        </div>
                        <p className="text-xs text-slate-500">Complete cluster copy. High storage impact. Use for major milestones.</p>
                    </button>
                </div>
                {isCreating && <div className="mt-4 text-center text-sm text-blue-600 animate-pulse">Initiating snapshot task...</div>}
            </div>
        </Modal>

        {/* Restore Confirm Modal */}
        <Modal isOpen={!!restoreModalOpen} onClose={() => setRestoreModalOpen(null)} title="Confirm System Restore" size="sm">
            <div className="p-6">
                <div className={cn("border rounded p-4 mb-4 flex items-start gap-3", theme.status.error.bg, theme.status.error.border)}>
                    <AlertCircle className={cn("h-6 w-6 shrink-0", theme.status.error.text)}/>
                    <div>
                        <h4 className={cn("text-sm font-bold", theme.status.error.text)}>Warning: Destructive Action</h4>
                        <p className={cn("text-xs mt-1", theme.status.error.text)}>
                            Restoring from <strong>{restoreModalOpen?.id}</strong> will overwrite current data. Any changes made after {restoreModalOpen && new Date(restoreModalOpen.created).toLocaleString()} will be lost.
                        </p>
                    </div>
                </div>
                <p className={cn("text-sm mb-6", theme.text.secondary)}>
                    Are you sure you want to proceed with the restoration of the <strong>{restoreModalOpen?.name}</strong> snapshot?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setRestoreModalOpen(null)}>Cancel</Button>
                    <Button variant="danger" onClick={() => restoreModalOpen && restoreSnapshot(restoreModalOpen.id)} isLoading={isRestoring}>
                        {isRestoring ? 'Restoring...' : 'Confirm Restore'}
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};
