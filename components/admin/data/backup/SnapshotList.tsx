
import React from 'react';
import { TableContainer, TableHeader, TableHead, TableBody, TableRow, TableCell } from '../../../common/Table';
import { Button } from '../../../common/Button';
import { StatusBadge } from '../../../common/RefactoredCommon';
import { Database, Clock, Download, Archive } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';
import { BackupSnapshot, SnapshotType } from '../../../../types';

interface SnapshotListProps {
  snapshots: BackupSnapshot[];
  isLoading: boolean;
  onRestore: (snap: BackupSnapshot) => void;
}

export const SnapshotList: React.FC<SnapshotListProps> = ({ snapshots, isLoading, onRestore }) => {
  const { theme } = useTheme();

  const getSnapshotIcon = (type: SnapshotType) => {
      if (type === 'Full') return <Database className="h-4 w-4 text-purple-600" />;
      return <Clock className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="rounded-lg border overflow-hidden">
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
                {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">Loading snapshots...</TableCell></TableRow>
                ) : snapshots.map(snap => (
                    <TableRow key={snap.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", theme.surface.highlight)}>
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
                                <Button size="sm" variant="secondary" icon={Archive} onClick={() => onRestore(snap)}>Restore</Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    </div>
  );
};
