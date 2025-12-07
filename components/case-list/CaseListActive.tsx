
import React, { useCallback } from 'react';
import { Case, CaseStatus } from '../../types';
import { Briefcase, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { useSort } from '../../hooks/useSort';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { VirtualList } from '../common/VirtualList';
import { SwipeableItem } from '../common/SwipeableItem';
import { DataService } from '../../services/dataService';
import { useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useNotify } from '../../hooks/useNotify';
import { Button } from '../common/Button';
import { FilterPanel } from '../common/FilterPanel';
import { SearchInput, Input } from '../common/Inputs';
import { useToggle } from '../../hooks/useToggle';
import { StatusBadge, EmptyListState } from '../common/RefactoredCommon';
import { Currency } from '../common/Primitives';
import { CaseRow } from './CaseRow';

interface CaseListActiveProps {
  filteredCases: Case[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  resetFilters: () => void;
  onSelectCase: (c: Case) => void;
}

export const CaseListActive: React.FC<CaseListActiveProps> = ({
  filteredCases,
  statusFilter, setStatusFilter, typeFilter, setTypeFilter,
  searchTerm, setSearchTerm, dateFrom, setDateFrom, dateTo, setDateTo,
  resetFilters, onSelectCase
}) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const { isOpen: showFilters, toggle: toggleFilters } = useToggle(false);
  
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

  const prefetchCaseDetails = useCallback((caseId: string) => {
    queryClient.fetch([STORES.DOCUMENTS, caseId], () => DataService.documents.getByCaseId(caseId));
    queryClient.fetch([STORES.TASKS, caseId], () => DataService.tasks.getByCaseId(caseId));
    queryClient.fetch([STORES.BILLING, caseId], () => DataService.billing.getTimeEntries(caseId));
  }, []);

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

  // Virtualized Row Renderer (Desktop)
  const renderDesktopRow = useCallback((c: Case) => (
      <CaseRow 
        caseData={c} 
        onSelect={onSelectCase} 
        onPrefetch={prefetchCaseDetails} 
      />
  ), [onSelectCase, prefetchCaseDetails]);

  // Virtualized Row Renderer (Mobile)
  const renderMobileRow = (c: Case) => (
    <div className="px-1 py-1.5 h-[104px]">
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
                "p-4 shadow-sm border active:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden h-full",
                theme.surface, theme.border.default
            )}
            >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", c.status === 'Trial' ? "bg-amber-500" : c.status === 'Discovery' ? "bg-blue-500" : "bg-slate-300")}></div>
            <h4 className={cn("font-bold text-lg mb-1 leading-snug line-clamp-2 pl-2", theme.text.primary)}>{c.title}</h4>
            <div className="flex items-center justify-between pl-2 mt-2">
                <StatusBadge status={c.status} />
                <Currency value={c.value || 0} className="font-bold text-sm" />
            </div>
            </div>
        </SwipeableItem>
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <h2 className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>Active Matters</h2>
        <Button variant="outline" icon={Filter} onClick={toggleFilters}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <FilterPanel isOpen={showFilters} onClose={toggleFilters} onClear={resetFilters}>
          <SearchInput 
              placeholder="Search title, client, ID..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="md:col-span-2"
          />
          <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Status</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>
          <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="Litigation">Litigation</option>
                  <option value="Appeal">Appeal</option>
                  <option value="M&A">M&A</option>
                  <option value="IP">IP</option>
              </select>
          </div>
          <Input type="date" label="Filed After" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Input type="date" label="Filed Before" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </FilterPanel>

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
                <div className="p-8 h-full">
                    <EmptyListState 
                        icon={Briefcase}
                        label="No Matters Found"
                        message="No cases match your current filter criteria. Try broadening your search or resetting the filters."
                    />
                 </div>
            ) : (
                <VirtualList 
                  items={sortedCases} 
                  height="100%" 
                  itemHeight={64} 
                  renderItem={renderDesktopRow} 
                />
            )}
        </div>
      </div>

      {/* Mobile Virtualized Card View */}
      <div className="md:hidden flex-1 min-h-0 relative -mx-1">
         <VirtualList 
            items={sortedCases}
            height="100%"
            itemHeight={104}
            renderItem={renderMobileRow}
         />
      </div>
    </div>
  );
};
