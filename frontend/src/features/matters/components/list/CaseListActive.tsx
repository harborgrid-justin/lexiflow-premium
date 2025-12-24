/**
 * CaseListActive.tsx
 * 
 * Active cases view with advanced filtering, sorting, and search.
 * Supports desktop table view and mobile swipeable cards.
 * 
 * @module components/case-list/CaseListActive
 * @category Case Management - Active Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback } from 'react';
import { Filter } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { VirtualList } from '../../common/VirtualList';
import { SwipeableItem } from '../../common/SwipeableItem';
import { Button } from '../../common/Button';
import { FilterPanel } from '../../common/FilterPanel';
import { SearchInput, Input } from '../../common/Inputs';
import { Badge } from '../../common/Badge';
import { Currency } from '../../common/Primitives';
import { ActiveCaseTable } from './ActiveCaseTable';
import { ConfirmDialog } from '../../common/ConfirmDialog';

// Hooks & Context
import { useSort } from '../../../hooks/useSort';
import { useTheme } from '../../../context/ThemeContext';
import { useNotify } from '../../../hooks/useNotify';
import { useToggle } from '../../../hooks/useToggle';
import { UseCaseListReturn } from '../../../hooks/useCaseList';
import { useMutation, queryClient } from '../../../hooks/useQueryHooks';
import { useModalState } from '../../../hooks/useModalState';

// Services & Utils
import { DataService } from '../../../services/data/dataService';
import { cn } from '../../../utils/cn';
// ✅ Migrated to backend API (2025-12-21)

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case, CaseStatus } from '../../../types';

type CaseListActiveProps = Omit<UseCaseListReturn, 'isModalOpen' | 'setIsModalOpen' | 'isLoading' | 'isError'> & {
  onSelectCase: (c: Case) => void;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Maps case status to badge variant for consistent visual representation
 */
const getCaseStatusVariant = (status: CaseStatus): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
  switch (status) {
    case CaseStatus.Settled:
    case CaseStatus.Closed:
      return 'success';
    case CaseStatus.Trial:
      return 'warning';
    case CaseStatus.Appeal:
      return 'error';
    case CaseStatus.Discovery:
      return 'info';
    default:
      return 'neutral';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CaseListActive - Active cases list with filtering and sorting
 * 
 * Features:
 * - Multi-criteria filtering (status, type, date range, search)
 * - Desktop table view with virtual scrolling
 * - Mobile swipeable card view with archive action
 * - Real-time search and filter panel
 * - Case prefetching on hover
 */
export const CaseListActive: React.FC<CaseListActiveProps> = ({
  filteredCases,
  statusFilter, setStatusFilter, typeFilter, setTypeFilter,
  searchTerm, setSearchTerm, dateFrom, setDateFrom, dateTo, setDateTo,
  resetFilters, onSelectCase
}) => {
  // ==========================================================================
  // HOOKS - Context & Custom Hooks
  // ==========================================================================
  const { theme } = useTheme();
  const notify = useNotify();
  const { isOpen: showFilters, toggle: toggleFilters } = useToggle(false);
  const archiveModal = useModalState();
  const [archiveCaseData, setArchiveCaseData] = React.useState<Case | null>(null);
  
  const { items: sortedCases, requestSort, sortConfig } = useSort<Case>(filteredCases, 'filingDate', 'desc');

  // ==========================================================================
  // HOOKS - Mutations
  // ==========================================================================
  const { mutate: archiveCase } = useMutation(
      DataService.cases.archive,
      {
          onSuccess: (_, id) => {
              notify.success("Case archived successfully");
              queryClient.invalidate(queryKeys.cases.all());
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
    // Prefetch case-related data on hover for better UX
    // Wrapped in try-catch to prevent errors from missing API methods
    try {
      if (DataService.documents?.getByCaseId) {
        queryClient.fetch(['documents', caseId], () => DataService.documents.getByCaseId(caseId));
      }
    } catch (error) {
      // Silently fail - prefetch is optional
    }
  }, []);

  const handleArchiveCase = (c: Case) => {
     setArchiveCaseData(c);
     archiveModal.open();
  };

  const confirmArchive = () => {
     if (archiveCaseData) {
         archiveCase(archiveCaseData.id);
         setArchiveCaseData(null);
     }
  };

  const handleFlagCase = (c: Case) => {
      flagCase(c.id);
  };

  // Virtualized Row Renderer (Mobile)
  const renderMobileRow = (c: Case, index: number) => (
    <div key={c.id} className="px-1 py-1.5 h-[120px]">
        <SwipeableItem 
            onSwipeLeft={() => handleArchiveCase(c)}
            onSwipeRight={() => handleFlagCase(c)}
            leftActionLabel="Archive"
            rightActionLabel="Flag"
        >
            <div 
            onClick={() => onSelectCase(c)}
            onMouseEnter={() => prefetchCaseDetails(c.id)}
            className={cn(
                "p-4 shadow-sm border active:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden h-full flex flex-col justify-between rounded-lg",
                theme.surface.default, theme.border.default
            )}
            >
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", c.status === 'Trial' ? "bg-amber-500" : c.status === 'Discovery' ? "bg-blue-500" : "bg-slate-300")}></div>
            <div>
                <div className="flex justify-between items-start mb-1 pl-2">
                    <span className={cn("text-xs font-mono opacity-70", theme.text.secondary)}>{c.id}</span>
                    <span className={cn("text-[10px] uppercase font-bold text-slate-400")}>{c.matterType}</span>
                </div>
                <h4 className={cn("font-bold text-base leading-snug line-clamp-2 pl-2", theme.text.primary)}>{c.title}</h4>
            </div>
            <div className={cn("flex items-center justify-between pl-2 pt-2 border-t", theme.border.default)}>
                <Badge variant={getCaseStatusVariant(c.status)} className="text-[10px] px-2 py-0.5">{c.status}</Badge>
                <Currency value={c.value || 0} className="font-bold text-sm" />
            </div>
            </div>
        </SwipeableItem>
    </div>
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className={cn("flex justify-between items-center shrink-0 px-1")}>
        <h2 className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>Active Matters</h2>
        <Button variant="outline" icon={Filter} onClick={toggleFilters}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <FilterPanel isOpen={showFilters} onClose={toggleFilters} onClear={resetFilters}>
          <SearchInput 
              placeholder="Search title, client, ID..." 
              value={searchTerm} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
              className="md:col-span-2"
          />
          <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Status</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)} value={statusFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)} aria-label="Status Filter">
                  <option value="All">All Statuses</option>
                  {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>
          <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)} value={typeFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)} aria-label="Type Filter">
                  <option value="All">All Types</option>
                  <option value="Litigation">Litigation</option>
                  <option value="Appeal">Appeal</option>
                  <option value="M&A">M&A</option>
                  <option value="IP">IP</option>
              </select>
          </div>
          <Input type="date" label="Filed After" value={dateFrom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)} />
          <Input type="date" label="Filed Before" value={dateTo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)} />
      </FilterPanel>

      <ActiveCaseTable 
        filteredCases={filteredCases}
        sortedCases={sortedCases}
        requestSort={requestSort}
        sortConfig={sortConfig}
        onSelectCase={onSelectCase}
        prefetchCaseDetails={prefetchCaseDetails}
      />

      {/* Mobile Virtualized Card View */}
      <div className="md:hidden flex-1 min-h-0 relative -mx-2">
         <VirtualList 
            items={sortedCases}
            height="100%"
            itemHeight={120}
            renderItem={renderMobileRow}
            emptyMessage="No cases found."
         />
      </div>

      <ConfirmDialog
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={confirmArchive}
        title="Archive Case"
        message={`Archive ${archiveCaseData?.title || 'this case'}? This will move it to the archived cases list.`}
        confirmText="Archive"
        variant="warning"
      />
    </div>
  );
};


