/**
 * @module components/evidence/EvidenceInventory
 * @category Evidence
 * @description Main list view with filtering, search, and task creation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { CheckSquare, Filter, Loader2, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TaskCreationModal } from '@/features/cases/ui/components/TaskCreationModal/TaskCreationModal';
import { FilterPanel } from '@/shared/ui/organisms/FilterPanel';
import { VirtualList } from '@/shared/ui/organisms/VirtualList';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { EvidenceTypeIcon } from '@/shared/ui/atoms/EvidenceTypeIcon';

// Context & Utils
import { EvidenceFilters } from '@/hooks/useEvidenceManager';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useToggle } from '@/shared/hooks/useToggle';
import { useWorkerSearch } from '@/hooks/useWorkerSearch';
import { useTheme } from '@/features/theme';
import { AdmissibilityStatusEnum } from '@/types/enums';
import { cn } from '@/shared/lib/cn';

// Types
import { EvidenceItem } from '@/types';

interface EvidenceInventoryProps {
  items: EvidenceItem[];
  filteredItems: EvidenceItem[]; // Kept for interface compatibility but we'll use worker result internally mostly
  filters: EvidenceFilters;
  setFilters: React.Dispatch<React.SetStateAction<EvidenceFilters>>;
  onItemClick: (item: EvidenceItem) => void;
  onIntakeClick: () => void;
}

const EvidenceInventoryComponent: React.FC<EvidenceInventoryProps> = ({
  items, filters, setFilters, onItemClick, onIntakeClick
}) => {
  const { theme } = useTheme();
  const filtersToggle = useToggle();
  const [taskModalEvidence, setTaskModalEvidence] = useState<EvidenceItem | null>(null);

  // Use worker search for text based filtering, combining with other filters locally
  // We apply the text search first via worker, then structural filters
  const { filteredItems: textFiltered, isSearching } = useWorkerSearch({
    items,
    query: filters.search,
    fields: ['title', 'description', 'custodian', 'trackingUuid', 'caseId']
  });

  // Structural filtering on top of search result
  const finalFiltered = React.useMemo(() => {
    // If search is empty, textFiltered is just items.
    // We apply the specific filters (type, admissibility, etc) here.
    return textFiltered.filter(e => {
      const matchesType = !filters.type || e.type === filters.type;
      const matchesAdmissibility = !filters.admissibility || e.admissibility === filters.admissibility;
      const matchesCaseId = !filters.caseId || e.caseId.toLowerCase().includes(filters.caseId.toLowerCase());
      // ... add other specific filters if needed
      return matchesType && matchesAdmissibility && matchesCaseId;
    });
  }, [textFiltered, filters]);

  const handleFilterChange = useCallback((key: keyof EvidenceFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '', type: '', admissibility: '', caseId: '', custodian: '',
      dateFrom: '', dateTo: '', location: '', tags: '', collectedBy: '', hasBlockchain: false
    });
  }, [setFilters]);

  // Memoized badge variant logic
  const getBadgeVariant = useCallback((admissibility: string) => {
    switch (admissibility) {
      case AdmissibilityStatusEnum.ADMISSIBLE:
        return 'success';
      case AdmissibilityStatusEnum.CHALLENGED:
        return 'warning';
      case AdmissibilityStatusEnum.INADMISSIBLE:
        return 'error';
      default:
        return 'neutral';
    }
  }, []);

  const renderRow = useCallback((item: EvidenceItem) => (
    <div
      key={item.id}
      onClick={() => onItemClick(item)}
      className={cn("flex items-center border-b h-[72px] px-6 hover:bg-slate-50 transition-colors cursor-pointer group", theme.border.default)}
    >
      <div className="w-[15%] font-mono text-xs text-slate-500">{item.id}</div>
      <div className="w-[25%]">
        <div className="flex items-center">
          <div className={cn("mr-3 p-1.5 rounded border self-start md:self-center", theme.surface.highlight, theme.border.default)}><EvidenceTypeIcon type={item.type} /></div>
          <div className="min-w-0">
            <div className={cn("font-medium", theme.text.primary)}>{item.title}</div>
            <div className={cn("text-xs text-slate-400 md:truncate")}>{item.description}</div>
          </div>
        </div>
      </div>
      <div className="w-[10%] text-sm">{item.type}</div>
      <div className="w-[15%] text-sm">{item.custodian}</div>
      <div className="w-[15%] text-xs">{item.collectionDate}</div>
      <div className="w-[10%]">
        <Badge variant={getBadgeVariant(item.admissibility)}>
          {item.admissibility}
        </Badge>
      </div>
      <div className="w-[10%] text-right">
        <div className="flex justify-end gap-2" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" className={theme.text.tertiary} icon={CheckSquare} onClick={() => setTaskModalEvidence(item)} title="Create Task" />
          <Button size="sm" variant="ghost" className={theme.primary.text} onClick={() => onItemClick(item)}>Manage</Button>
        </div>
      </div>
    </div>
  ), [onItemClick, theme, getBadgeVariant]);

  // Keyboard shortcuts for power users
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlOrCmd: true,
      action: onIntakeClick,
      description: 'Log new evidence'
    },
    {
      key: 'f',
      ctrlOrCmd: true,
      action: () => filtersToggle.toggle(),
      description: 'Toggle filters'
    }
  ]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {taskModalEvidence && (
        <TaskCreationModal
          isOpen={true}
          onClose={() => setTaskModalEvidence(null)}
          initialTitle={`Audit Evidence: ${taskModalEvidence.title}`}
          relatedModule="Evidence"
          relatedItemId={taskModalEvidence.id}
          relatedItemTitle={taskModalEvidence.title}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2 shrink-0">
        <div>
          <h2 className={cn("text-2xl font-bold tracking-tight", theme.text.primary)}>Inventory Index</h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>Master Chain of Custody & Asset Tracking</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" icon={Filter} onClick={filtersToggle.toggle} className="w-full md:w-auto justify-center">
            {filtersToggle.isOpen ? 'Hide Filters' : 'Filters'}
          </Button>
          <Button variant="primary" icon={Plus} onClick={onIntakeClick} className="w-full md:w-auto justify-center">Log New Item</Button>
        </div>
      </div>

      <FilterPanel isOpen={filtersToggle.isOpen} onClose={filtersToggle.close} onClear={clearFilters}>
        <div className="relative">
          <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface.default)} placeholder="Search..." value={filters.search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)} />
          {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="h-4 w-4 animate-spin text-blue-500" /></div>}
        </div>
        <select className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface.default)} value={filters.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="Physical">Physical</option>
          <option value="Digital">Digital</option>
          <option value="Document">Document</option>
        </select>
        <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface.default)} placeholder="Case ID" value={filters.caseId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('caseId', e.target.value)} />
        <input className={cn("p-2 border rounded text-sm w-full outline-none", theme.border.default, theme.surface.default)} placeholder="Custodian" value={filters.custodian} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('custodian', e.target.value)} />
      </FilterPanel>

      <div className={cn("flex-1 min-h-0 flex flex-col border rounded-lg overflow-hidden shadow-sm bg-white", theme.border.default)}>
        {/* Fixed Header */}
        <div className={cn("flex items-center px-6 py-3 border-b font-bold text-xs uppercase tracking-wider bg-slate-50 shrink-0", theme.border.default, theme.text.secondary)}>
          <div className="w-[15%]">Evidence ID</div>
          <div className="w-[25%]">Description</div>
          <div className="w-[10%]">Type</div>
          <div className="w-[15%]">Custodian</div>
          <div className="w-[15%]">Date</div>
          <div className="w-[10%]">Status</div>
          <div className="w-[10%] text-right">Action</div>
        </div>

        <div className="flex-1 relative">
          <VirtualList
            items={finalFiltered}
            height="100%"
            itemHeight={72}
            renderItem={renderRow}
            emptyMessage="No evidence found."
          />
        </div>
      </div>
    </div>
  );
};

// Export memoized version to prevent unnecessary re-renders
export const EvidenceInventory = React.memo(EvidenceInventoryComponent);
