/**
 * @module components/war-room/OppositionManager
 * @category WarRoom
 * @description Manages opposition intelligence, including counsel, parties, and experts.
 * Provides filtering, searching, and detailed profiles of opposition entities.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Filter, Layout, Plus } from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';
import { useSingleSelection } from '@/hooks/useMultiSelection';
import { useTheme } from "@/hooks/useTheme";
import { useToggle } from '@/hooks/useToggle';

// Components
import { Button } from '@/components/atoms/Button';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';
import { ErrorState } from '@/components/molecules/ErrorState';
import { Modal } from '@/components/molecules/Modal';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { OppositionDetail } from './opposition/OppositionDetail';
import { OppositionEntity, OppositionList } from './opposition/OppositionList';
import { OppositionSidebar } from './opposition/OppositionSidebar';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface OppositionManagerProps {
  /** Optional case ID to filter opposition entities. If not provided, shows all entities. */
  caseId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const OppositionManager: React.FC<OppositionManagerProps> = ({ caseId }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const entitySelection = useSingleSelection<OppositionEntity>(null, (a, b) => a.id === b.id);
  const inspectorToggle = useToggle();
  const filterToggle = useToggle();
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterFirm, setFilterFirm] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: oppositionData = [], isLoading, error, refetch } = useQuery<OppositionEntity[]>(
    queryKeys.warRoom.opposition(caseId || ''),
    () => DataService.warRoom.getOpposition(caseId || '')
  );

  // ============================================================================
  // FILTER & SEARCH
  // ============================================================================
  const { filteredItems: baseFiltered, searchQuery, setSearchQuery, category, setCategory } = useFilterAndSearch<OppositionEntity & Record<string, unknown>>({
    items: oppositionData as (OppositionEntity & Record<string, unknown>)[],
    config: {
      categoryField: 'role',
      searchFields: ['name', 'firm'],
      arrayFields: []
    },
    initialCategory: 'All'
  });

  // Apply additional filters on top of search/category
  const filteredEntities = React.useMemo(() => {
    let result = baseFiltered;

    // Map category to role logic
    if (category !== 'All') {
      result = result.filter(ent => {
        if (category === 'Counsel') return ent.role.includes('Counsel');
        if (category === 'Parties') return ent.role === 'Defendant';
        if (category === 'Experts') return ent.role === 'Opposing Expert';
        return true;
      });
    }

    // Apply additional filters
    if (filterRole !== 'all') {
      result = result.filter(ent => ent.role === filterRole);
    }
    if (filterFirm !== 'all') {
      result = result.filter(ent => ent.firm === filterFirm);
    }
    if (filterStatus !== 'all') {
      result = result.filter(ent => ent.status === filterStatus);
    }

    return result;
  }, [baseFiltered, category, filterRole, filterFirm, filterStatus]);

  const handleSelectEntity = (entity: OppositionEntity) => {
    entitySelection.select(entity);
    inspectorToggle.open();
  };

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={6} shimmer />;
  if (error) return <ErrorState message="Failed to load opposition entities" onRetry={refetch} />;

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Header Toolbar */}
      <div className={cn("p-4 border-b flex justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4 flex-1">
          <h3 className={cn("font-bold text-lg whitespace-nowrap", theme.text.primary)}>Opposition Intel</h3>
          <div className={cn("h-6 w-px", theme.border.default)}></div>
          <SearchToolbar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search counsel, parties, experts..."
            className="w-full max-w-md border-none shadow-none p-0 bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterToggle.isOpen ? "primary" : "secondary"}
            icon={Filter}
            onClick={filterToggle.toggle}
            className="hidden sm:flex"
          >
            Filter
          </Button>
          <Button
            variant={inspectorToggle.isOpen ? "primary" : "secondary"}
            icon={Layout}
            onClick={inspectorToggle.toggle}
            className="hidden sm:flex"
          >
            Inspector
          </Button>
          <Button variant="primary" icon={Plus}>Add Profile</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <OppositionSidebar
          activeCategory={category}
          onSelectCategory={setCategory}
          counts={{
            all: oppositionData.length,
            counsel: oppositionData.filter(e => e.role.includes('Counsel')).length,
            parties: oppositionData.filter(e => e.role === 'Defendant').length,
            experts: oppositionData.filter(e => e.role === 'Opposing Expert').length
          }}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <OppositionList
            entities={filteredEntities}
            onSelect={handleSelectEntity}
            selectedId={entitySelection.selected?.id}
          />
        </div>

        {/* Right Inspector Panel */}
        {inspectorToggle.isOpen && entitySelection.selected && (
          <OppositionDetail
            entity={entitySelection.selected}
            onClose={inspectorToggle.close}
          />
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={filterToggle.isOpen} onClose={filterToggle.close} title="Filter Opposition">
        <div className="p-6 space-y-4">
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
            <select
              title="Filter by role"
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Lead Counsel">Lead Counsel</option>
              <option value="Associate Counsel">Associate Counsel</option>
              <option value="Defendant">Defendant</option>
              <option value="Opposing Expert">Opposing Expert</option>
            </select>
          </div>

          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Firm</label>
            <select
              title="Filter by firm"
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterFirm}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterFirm(e.target.value)}
            >
              <option value="all">All Firms</option>
              <option value="Morrison & Foerster LLP">Morrison & Foerster LLP</option>
              <option value="Baker McKenzie">Baker McKenzie</option>
              <option value="Jones Day">Jones Day</option>
            </select>
          </div>

          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Status</label>
            <select
              title="Filter by status"
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Retained">Retained</option>
              <option value="Monitoring">Monitoring</option>
            </select>
          </div>

          <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.border.default)}>
            <Button variant="ghost" onClick={() => { setFilterRole('all'); setFilterFirm('all'); setFilterStatus('all'); }}>
              Clear Filters
            </Button>
            <Button variant="primary" onClick={filterToggle.close}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
