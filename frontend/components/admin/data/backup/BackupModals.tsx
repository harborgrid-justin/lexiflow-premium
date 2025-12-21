
import React from 'react';
import { Modal } from '../../../common/Modal';
import { Button } from '../../../common/Button';
import { Clock, Database, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { BackupSnapshot } from '../../../../services/api/data-platform/backups-api';

interface CreateSnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSnapshot: (type: string) => void;
    isCreating: boolean;
}

export const CreateSnapshotModal: React.FC<CreateSnapshotModalProps> = ({ isOpen, onClose, onSnapshot, isCreating }) => {
    const { theme } = useTheme();
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Trigger Manual Snapshot">
            <div className="p-6">
                <p className={cn("text-sm mb-4", theme.text.secondary)}>
                    Manual snapshots are retained for 90 days by default. Choose snapshot type:
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onSnapshot('Incremental')}
                        className={cn("p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group", theme.border.default)}
                    >
                        <div className="flex items-center gap-2 mb-2 font-bold group-hover:text-blue-700">
                            <Clock className="h-5 w-5"/> Incremental
                        </div>
                        <p className="text-xs text-slate-500">Fast. Captures changes since last backup. Low storage impact.</p>
                    </button>
                    <button 
                         onClick={() => onSnapshot('Full')}
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
    );
};

interface RestoreSnapshotModalProps {
    snapshot: BackupSnapshot | null;
    onClose: () => void;
    onRestore: () => void;
    isRestoring: boolean;
}

export const RestoreSnapshotModal: React.FC<RestoreSnapshotModalProps> = ({ snapshot, onClose, onRestore, isRestoring }) => {
    const { theme } = useTheme();
    if (!snapshot) return null;

    return (
        <Modal isOpen={!!snapshot} onClose={onClose} title="Confirm System Restore" size="sm">
            <div className="p-6">
                <div className={cn("border rounded p-4 mb-4 flex items-start gap-3", theme.status.error.bg, theme.status.error.border)}>
                    <AlertCircle className={cn("h-6 w-6 shrink-0", theme.status.error.text)}/>
                    <div>
                        <h4 className={cn("text-sm font-bold", theme.status.error.text)}>Warning: Destructive Action</h4>
                        <p className={cn("text-xs mt-1", theme.status.error.text)}>
                            Restoring from <strong>{snapshot.id}</strong> will overwrite current data. Any changes made after {new Date(snapshot.createdAt).toLocaleString()} will be lost.
                        </p>
                    </div>
                </div>
                <p className={cn("text-sm mb-6", theme.text.secondary)}>
                    Are you sure you want to proceed with the restoration of the <strong>{snapshot.name}</strong> snapshot?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" onClick={onRestore} isLoading={isRestoring}>
                        {isRestoring ? 'Restoring...' : 'Confirm Restore'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
