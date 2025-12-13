
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { TrialExhibit } from '../../types';
import { FileIcon } from '../common/Primitives';
import { Button } from '../common/Button';
import { Eye, Layers } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { useWindow } from '../../context/WindowContext';
import { DocumentPreviewPanel } from '../documents/viewer/DocumentPreviewPanel';
import { StatusBadge, EmptyListState } from '../common/RefactoredCommon';

interface ExhibitTableProps {
  exhibits: TrialExhibit[];
  viewMode: 'list' | 'grid';
}

export const ExhibitTable: React.FC<ExhibitTableProps> = ({ exhibits, viewMode }) => {
  const { theme } = useTheme();
  const { openWindow } = useWindow();

  const getPartyColor = (party: string) => {
      switch(party) {
          case 'Plaintiff': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
          case 'Defense': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
          case 'Joint': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
          default: return cn(theme.surface.highlight, theme.text.secondary, theme.border.default);
      }
  };

  const handleViewExhibit = (ex: TrialExhibit) => {
      const winId = `exhibit-${ex.id}`;
      openWindow(
          winId,
          `Exhibit ${ex.exhibitNumber}`,
          <div className={cn("h-full", theme.surface.default)}>
             <DocumentPreviewPanel 
                document={{
                    id: ex.id,
                    title: ex.title,
                    type: ex.fileType,
                    content: ex.description || '',
                    uploadDate: ex.dateMarked,
                    lastModified: ex.dateMarked,
                    tags: ex.tags || [],
                    versions: [],
                    caseId: ex.caseId,
                    status: ex.status
                }}
                onViewHistory={() => {}}
                isOrbital={true}
             />
          </div>
      );
  };

  if (viewMode === 'grid') {
      if (exhibits.length === 0) return <EmptyListState label="No exhibits found" icon={Layers} />;

      return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {exhibits.map(ex => (
                  <div key={ex.id} className={cn("group rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all", theme.surface.default, theme.border.default)}>
                      <div className={cn("aspect-square flex items-center justify-center relative border-b", theme.surface.highlight, theme.border.default)}>
                          <FileIcon type={ex.fileType} className="h-16 w-16 opacity-30"/>
                          <div className={cn("absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold border", getPartyColor(ex.party))}>
                              {ex.exhibitNumber}
                          </div>
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                              <Button size="sm" variant="secondary" icon={Eye} onClick={() => handleViewExhibit(ex)}>View</Button>
                          </div>
                      </div>
                      <div className="p-3">
                          <h4 className={cn("font-bold text-sm truncate mb-1", theme.text.primary)} title={ex.title}>{ex.title}</h4>
                          <div className="flex justify-between items-center">
                              <span className={cn("text-xs", theme.text.secondary)}>{ex.witness}</span>
                              <StatusBadge status={ex.status} className="text-[10px] px-1.5 py-0" />
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      );
  }

  const renderRow = (ex: TrialExhibit) => (
      <div key={ex.id} className={cn("flex items-center h-[60px] border-b px-6 transition-colors", theme.surface.default, theme.border.default, `hover:${theme.surface.highlight}`)}>
            <div className="w-[15%]">
                <span className={cn("font-mono font-bold text-sm px-2 py-1 rounded border", getPartyColor(ex.party))}>
                    {ex.exhibitNumber}
                </span>
            </div>
            <div className="w-[30%] flex items-center gap-2">
                <FileIcon type={ex.fileType} className="h-4 w-4 opacity-70 shrink-0"/>
                <div className="min-w-0">
                    <p className={cn("font-medium text-sm truncate", theme.text.primary)}>{ex.title}</p>
                    <p className={cn("text-xs truncate max-w-[200px]", theme.text.tertiary)}>{ex.description}</p>
                </div>
            </div>
            <div className={cn("w-[15%] text-sm", theme.text.secondary)}>{ex.party}</div>
            <div className={cn("w-[15%] text-xs font-mono", theme.text.secondary)}>{ex.dateMarked}</div>
            <div className={cn("w-[15%] text-sm", theme.text.secondary)}>{ex.witness || '-'}</div>
            <div className="w-[10%] flex justify-end">
                <StatusBadge status={ex.status} />
            </div>
            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleViewExhibit(ex); }} className={cn("hover:text-blue-600", theme.text.tertiary)}><Eye className="h-4 w-4"/></button>
            </div>
      </div>
  );

  return (
    <div className={cn("flex flex-col h-full border rounded-lg overflow-hidden", theme.surface.default, theme.border.default)}>
        <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            <div className="w-[15%]">Exhibit #</div>
            <div className="w-[30%]">Description</div>
            <div className="w-[15%]">Party</div>
            <div className="w-[15%]">Date Marked</div>
            <div className="w-[15%]">Witness</div>
            <div className="w-[10%] text-right">Status</div>
        </div>
        <div className="flex-1 relative">
             {exhibits.length === 0 ? (
                 <EmptyListState label="No exhibits found" icon={Layers} />
             ) : (
                <VirtualList 
                    items={exhibits}
                    height="100%"
                    itemHeight={60}
                    renderItem={renderRow}
                />
             )}
        </div>
    </div>
  );
};
