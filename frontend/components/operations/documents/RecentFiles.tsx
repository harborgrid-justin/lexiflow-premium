
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { FileIcon } from '../../common/Primitives';
import { Button } from '../../common/Button';
import { Clock, Eye, Loader2, FolderOpen } from 'lucide-react';
import { EmptyState } from '../../common/EmptyState';
import { DataService } from '../../../services/data/dataService';
import { LegalDocument } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useQuery } from '../../../hooks/useQueryHooks';

export const RecentFiles: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery
  const { data: recentDocs = [], isLoading } = useQuery<LegalDocument[]>(
      ['documents', 'recent'],
      () => DataService.documents.getRecent()
  );

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className={cn("p-4 rounded-lg border flex items-center gap-3", theme.surface.highlight, theme.border.default)}>
            <Clock className={cn("h-5 w-5", theme.text.secondary)}/>
            <div>
                <h3 className={cn("font-bold text-sm", theme.text.primary)}>Recently Accessed</h3>
                <p className={cn("text-xs", theme.text.secondary)}>Files you have viewed or edited in the last 7 days.</p>
            </div>
        </div>

        <TableContainer>
            <TableHeader>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Action</TableHead>
            </TableHeader>
            <TableBody>
                {recentDocs.map(doc => (
                    <TableRow key={doc.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <FileIcon type={doc.type} className="h-5 w-5"/>
                                <span className={cn("font-medium", theme.text.primary)}>{doc.title}</span>
                            </div>
                        </TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell className={cn("text-xs font-mono", theme.text.secondary)}>{doc.lastModified}</TableCell>
                        <TableCell className={cn("text-xs", theme.text.tertiary)}>{doc.caseId} / {doc.sourceModule || 'General'}</TableCell>
                        <TableCell className="text-right">
                            <Button size="sm" variant="ghost" icon={Eye}>Open</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
        {recentDocs.length === 0 && (
            <EmptyState
                icon={FolderOpen}
                title="No recent files"
                description="Files you view or edit will appear here for quick access."
            />
        )}
    </div>
  );
};

