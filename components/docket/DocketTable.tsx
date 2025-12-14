/**
 * @module components/docket/DocketTable
 * @category Docket Management
 * @description Virtualized table view with infinite scroll and filtering.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { FileText, Gavel, Clock, Bell, Lock, Hash } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { VirtualList } from '../common/VirtualList';
import { InfiniteScrollTrigger } from '../common/InfiniteScrollTrigger';
import { DocketRow } from './DocketRow';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../utils/cn';

// Types & Interfaces
import { DocketEntry, DocketEntryType } from '../../types';

interface DocketTableProps {
  entries: DocketEntry[];
  onSelectEntry: (entry: DocketEntry) => void;
  onSelectCaseId: (caseId: string) => void;
  showCaseColumn?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const DocketTable: React.FC<DocketTableProps> = ({ 
    entries, onSelectEntry, onSelectCaseId, showCaseColumn = true,
    onLoadMore, hasMore = false, isLoadingMore = false
}) => {
  const { theme } = useTheme();

  const handleViewDoc = (docId: string) => {
      alert(`Opening Document ${docId}`);
  };

  // --- Renderers ---

  const renderDesktopRow = (entry: DocketEntry, index: number) => (
      <DocketRow 
          key={entry.id}
          entry={entry}
          showCaseColumn={showCaseColumn}
          onSelect={onSelectEntry}
          onSelectCaseId={onSelectCaseId}
          onViewDoc={handleViewDoc}
      />
  );

  const renderMobileRow = (entry: DocketEntry, index: number) => {
      const getIconForType = (type: string) => {
        const t = type as DocketEntryType;
        switch (t) {
            case 'Order': return <Gavel className={cn("h-4 w-4", theme.status.error.text)} />;
            case 'Filing': return <FileText className={cn("h-4 w-4", theme.primary.text)} />;
            case 'Notice': return <Bell className={cn("h-4 w-4", theme.status.warning.text)} />;
            default: return <FileText className={cn("h-4 w-4", theme.text.tertiary)} />;
        }
      };

      return (
        <div key={entry.id} className="px-2 py-1.5 h-[140px]">
             <div 
                className={cn("p-4 rounded-lg border shadow-sm h-full flex flex-col justify-between transition-colors active:bg-slate-50", theme.surface.default, theme.border.default)}
                onClick={() => onSelectEntry(entry)}
             >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                         <span className={cn("font-mono text-xs px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-500")}>#{entry.sequenceNumber}</span>
                         <span className={cn("text-xs font-bold", theme.text.secondary)}>{entry.date}</span>
                    </div>
                    <Badge variant={entry.type === 'Order' ? 'error' : 'neutral'} className="text-[10px] px-1.5 py-0">
                        {entry.type}
                    </Badge>
                </div>
                
                <div className="flex-1 mt-2 min-w-0">
                     <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">{getIconForType(entry.type)}</div>
                        <p className={cn("font-bold text-sm line-clamp-2 leading-tight", theme.text.primary)}>
                            {entry.title}
                        </p>
                     </div>
                     <p className={cn("text-xs mt-1 line-clamp-1 pl-6", theme.text.secondary)}>{entry.description}</p>
                </div>
                
                <div className="flex justify-between items-center mt-2 border-t pt-2 border-slate-100 dark:border-slate-800">
                    <span className={cn("text-[10px] truncate max-w-[150px]", theme.primary.text)}>{entry.caseId}</span>
                    {entry.documentId && <span className={cn("text-[10px] font-bold flex items-center", theme.text.link)}><FileText className="h-3 w-3 mr-1"/> Document</span>}
                </div>
             </div>
        </div>
      );
  };

  return (
    <div className={cn("flex flex-col h-full", theme.surface.default)}>
        {/* Desktop Header */}
        <div className={cn("hidden md:flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider shrink-0", theme.surface.highlight, theme.border.default, theme.text.secondary)}>
            <div className="w-20 shrink-0">Seq / Pacer</div>
            <div className="w-24 shrink-0">Date</div>
            {showCaseColumn && <div className="w-32 shrink-0 px-2">Case Ref</div>}
            <div className="flex-1 px-4">Entry Text</div>
            <div className="w-16 shrink-0 text-center">Doc</div>
            <div className="w-32 shrink-0 text-right">Status</div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 relative">
            {/* Desktop View */}
            <div className="hidden md:block h-full">
                <VirtualList 
                    items={entries}
                    height="100%"
                    itemHeight={72} 
                    renderItem={renderDesktopRow}
                    emptyMessage="No docket entries found."
                    footer={onLoadMore && <InfiniteScrollTrigger onLoadMore={onLoadMore} hasMore={hasMore} isLoading={isLoadingMore}/>}
                />
            </div>

            {/* Mobile View */}
            <div className="md:hidden h-full -mx-2">
                <VirtualList 
                    items={entries}
                    height="100%"
                    itemHeight={140} 
                    renderItem={renderMobileRow}
                    emptyMessage="No entries found."
                    footer={onLoadMore && <InfiniteScrollTrigger onLoadMore={onLoadMore} hasMore={hasMore} isLoading={isLoadingMore}/>}
                />
            </div>
        </div>
    </div>
  );
};