
import React, { useCallback } from 'react';
import { Case } from '../../types';
import { User, ArrowUp, ArrowDown, Eye, Edit } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Currency, LoadingSpinner } from '../common/Primitives';
import { useSort } from '../../hooks/useSort';
import { CaseListToolbar } from './CaseListToolbar';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { SwipeableItem } from '../common/SwipeableItem';
import { DataService } from '../../services/dataService';
import { useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useNotify } from '../../hooks/useNotify';

interface CaseListActiveProps {
  filteredCases: Case[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  resetFilters: () => void;
  onSelectCase: (c: Case) => void;
}

export const CaseListActive: React.FC<CaseListActiveProps> = ({
  filteredCases,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  resetFilters,
  onSelectCase
}) => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  const { items: sortedCases, requestSort, sortConfig } = useSort<Case>(filteredCases, 'filingDate', 'desc');

  const { mutate: archiveCase } = useMutation(
      DataService.cases.archive,
      {
          onSuccess: (_, id) => {
              notify.success("Case archived successfully");
              queryClient.invalidate([STORES.CASES, 'all']);
          }
      }
  );

  const { mutate: flagCase } = useMutation(
      DataService.cases.flag,
      {
          onSuccess: (_, id) => {
              notify.warning("Case flagged for risk review");
          }
      }
  );

  const handleArchiveCase = (c: Case) => {
     if(confirm(`Archive ${c.title}?`)) {
         archiveCase(c.id);
     }
  };

  const handleFlagCase = (c: Case) => {
      flagCase(c.id);
  };

  const SortIcon = ({ column }: { column: keyof Case }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-25" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className={cn("h-4 w-4 ml-1", theme.primary.text)} /> : <ArrowDown className={cn("h-4 w-4 ml-1", theme.primary.text)} />;
  };

  const actionBtnClass = cn(
    "p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
    theme.text.secondary, 
    `hover:${theme.surfaceHighlight}`, 
    `hover:${theme.primary.text}`,
    "focus:ring-blue-500"
  );

  // Virtualized Row Renderer (Desktop)
  const renderRow = (c: Case) => (
    <div className={cn("flex items-center border-b hover:bg-slate-50 transition-colors h-16 px-6", theme.border.light)}>
       <div className="w-[35%] flex flex-col items-start pr-4 min-w-0">
          <span 
            onClick={() => onSelectCase(c)}
            className={cn("font-bold text-sm transition-colors flex items-center hover:underline cursor-pointer truncate w-full", theme.primary.text)}
            title={c.title}
          >
              {c.title}
          </span>
          <span className={cn("text-xs font-mono mt-0.5 opacity-70", theme.text.secondary)}>{c.id}</span>
       </div>
       <div className="w-[15%]"><Badge variant="neutral">{c.matterType}</Badge></div>
       <div className="w-[20%] flex items-center text-sm text-slate-500 min-w-0 pr-2">
          <User className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0"/>
          <span className="truncate" title={c.client}>{c.client}</span>
       </div>
       <div className="w-[15%]"><Currency value={c.value} className={cn("font-medium text-sm", theme.text.primary)} /></div>
       <div className="w-[10%]">
          <Badge variant={c.status === 'Trial' ? 'warning' : c.status === 'Discovery' ? 'info' : 'neutral'}>
            {c.status}
          </Badge>
       </div>
       <div className="w-[5%] flex justify-end items-center gap-1">
            <button onClick={() => onSelectCase(c)} className={actionBtnClass} title="View Details"><Eye className="h-4 w-4"/></button>
       </div>
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <CaseListToolbar 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        resetFilters={resetFilters}
      />

      {/* Desktop Virtual Table View */}
      <div className="hidden md:flex flex-1 min-h-0 flex-col border rounded-lg overflow-hidden shadow-sm bg-white">
        <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50 shrink-0", theme.border.default, theme.text.secondary)}>
            <div className="w-[35%] cursor-pointer flex items-center" onClick={() => requestSort('title')}>Matter <SortIcon column="title"/></div>
            <div className="w-[15%] cursor-pointer flex items-center" onClick={() => requestSort('matterType')}>Type <SortIcon column="matterType"/></div>
            <div className="w-[20%] cursor-pointer flex items-center" onClick={() => requestSort('client')}>Client <SortIcon column="client"/></div>
            <div className="w-[15%] cursor-pointer flex items-center" onClick={() => requestSort('value')}>Value <SortIcon column="value"/></div>
            <div className="w-[10%]">Status</div>
            <div className="w-[5%] text-right"></div>
        </div>
        <div className="flex-1 bg-white relative">
            {filteredCases.length === 0 ? (
                 <div className={cn("flex items-center justify-center h-full text-sm", theme.text.tertiary)}>
                    No cases found matching your filters.
                 </div>
            ) : (
                <VirtualList 
                  items={sortedCases} 
                  height="100%" 
                  itemHeight={64} 
                  renderItem={renderRow} 
                />
            )}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 pb-20 overflow-y-auto">
        {sortedCases.map((c) => (
          <SwipeableItem 
            key={c.id}
            onSwipeLeft={() => handleArchiveCase(c)}
            onSwipeRight={() => handleFlagCase(c)}
            leftActionLabel="Archive"
            rightActionLabel="Flag"
          >
              <div 
                onClick={() => onSelectCase(c)}
                className={cn(
                    "p-4 shadow-sm border active:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden",
                    theme.surface, theme.border.default
                )}
              >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", c.status === 'Trial' ? "bg-amber-500" : c.status === 'Discovery' ? "bg-blue-500" : "bg-slate-300")}></div>
                <h4 className={cn("font-bold text-lg mb-1 leading-snug line-clamp-2 pl-2", theme.text.primary)}>{c.title}</h4>
                <div className="flex items-center justify-between pl-2 mt-2">
                    <Badge variant="neutral">{c.status}</Badge>
                    <Currency value={c.value} className="font-bold text-sm" />
                </div>
              </div>
          </SwipeableItem>
        ))}
      </div>
    </div>
  );
};
