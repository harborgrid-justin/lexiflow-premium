/**
 * ActiveCaseTable.tsx
 * 
 * Virtual scrolling table for active case listings with sortable columns.
 * Optimized for large datasets using windowing for performance.
 * 
 * @module components/case-list/ActiveCaseTable
 * @category Case Management - Table Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown, Briefcase } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { VirtualList } from '../../components/organisms/VirtualList';
import { EmptyListState } from '../../common/RefactoredCommon';
import { CaseRow } from './CaseRow';

// Hooks & Context
import { useTheme } from '../../../providers/ThemeContext';

// Utils
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
import { Case } from '../../../types';

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
            <div className="w-[35%] cursor-pointer flex items-center group" onClick={() => requestSort('title')}>Matter <SortIcon column="title"/></div>
            <div className="w-[15%] cursor-pointer flex items-center group" onClick={() => requestSort('matterType')}>Type <SortIcon column="matterType"/></div>
            <div className="w-[20%] cursor-pointer flex items-center group" onClick={() => requestSort('client')}>Client <SortIcon column="client"/></div>
            <div className="w-[15%] cursor-pointer flex items-center group" onClick={() => requestSort('value')}>Value <SortIcon column="value"/></div>
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
  );
};
