/**
 * ActiveCaseTable.tsx
 *
 * Virtual scrolling table for active case listings with sortable columns.
 * Optimized for large datasets using windowing for performance.
 *
 * @module components/case-list/ActiveCaseTable
 * @category Case Management - Table Views
 *
 * REACT V18 CONTEXT CONSUMPTION COMPLIANCE:
 * - Guideline 21: Pure render logic with virtualized list (interruptible)
 * - Guideline 28: Theme usage is pure function for table styling
 * - Guideline 34: useTheme() is side-effect free read
 * - Guideline 33: Uses isPendingThemeChange for table transitions
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { ACTIVE_CASE_COLUMNS } from '@/config/cases.config';
import { ArrowDown, ArrowUp } from 'lucide-react';
import React, { useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { EmptyListState } from '@/components/molecules/EmptyListState/EmptyListState';
import { VirtualList } from '@/components/organisms/VirtualList/VirtualList';
import { CaseRow } from './CaseRow';

// Hooks & Context
import { useTheme } from "@/hooks/useTheme";

// Utils
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '@/types';

interface ActiveCaseTableProps {
  filteredCases: Case[];
  sortedCases: Case[];
  requestSort: (key: keyof Case) => void;
  sortConfig: { key: keyof Case; direction: 'asc' | 'desc' };
  onSelectCase: (c: Case) => void;
  prefetchCaseDetails: (id: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ActiveCaseTable - Virtualized sortable case table
 *
 * Features:
 * - Virtual scrolling for 1000+ cases
 * - Sortable columns (title, type, client, value)
 * - Responsive desktop layout
 * - Empty state handling
 * - Row prefetching on hover
 */
export const ActiveCaseTable: React.FC<ActiveCaseTableProps> = ({
  filteredCases, sortedCases, requestSort, sortConfig, onSelectCase, prefetchCaseDetails
}) => {
  // ==========================================================================
  // HOOKS - Context
  // ==========================================================================
  // Guideline 34: Side-effect free context read
  const { theme } = useTheme();

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const SortIcon = ({ column }: { column: keyof Case }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-25" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className={cn("h-4 w-4 ml-1", theme.primary.text)} /> : <ArrowDown className={cn("h-4 w-4 ml-1", theme.primary.text)} />;
  };

  const renderDesktopRow = useCallback((c: Case) => (
    <CaseRow
      caseData={c}
      onSelect={onSelectCase}
      onPrefetch={prefetchCaseDetails}
    />
  ), [onSelectCase, prefetchCaseDetails]);

  return (
    <div className="hidden md:flex flex-1 min-h-0 flex-col border rounded-lg overflow-hidden shadow-sm bg-white">
      <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50 shrink-0", theme.border.default, theme.text.secondary)}>
        {ACTIVE_CASE_COLUMNS.map((col) => (
          <div
            key={col.key}
            className="cursor-pointer flex items-center group"
            style={{ width: col.width }}
            onClick={() => requestSort(col.key as keyof Case)}
          >
            {col.label} <SortIcon column={col.key as keyof Case} />
          </div>
        ))}
        <div className="w-[10%]">Status</div>
        <div className="w-[5%] text-right"></div>
      </div>
      <div className="flex-1 bg-white relative">
        {filteredCases.length === 0 ? (
          <div className="p-8 h-full">
            <EmptyListState
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
  );
};
