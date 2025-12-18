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
import React, { useState } from 'react';
import { Filter, Layout, Plus, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../services/infrastructure/queryClient';
import { queryKeys } from '../../utils/queryKeys';
import { STORES } from '../../services/data/dataService';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { OppositionSidebar } from './opposition/OppositionSidebar';
import { OppositionList, OppositionEntity } from './opposition/OppositionList';
import { OppositionDetail } from './opposition/OppositionDetail';
import { Modal } from '../common/Modal';

// Utils & Constants
import { cn } from '../../utils/cn';

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
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<OppositionEntity | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterFirm, setFilterFirm] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: oppositionData = [], isLoading } = useQuery<OppositionEntity[]>(
      queryKeys.warRoom.opposition(caseId),
      () => DataService.warRoom.getOpposition(caseId)
  );

  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  const filteredEntities = React.useMemo(() => {
    let result = oppositionData.filter(ent => {
      const matchesCategory = activeCategory === 'All' || 
                              (activeCategory === 'Counsel' && ent.role.includes('Counsel')) ||
                              (activeCategory === 'Parties' && ent.role === 'Defendant') ||
                              (activeCategory === 'Experts' && ent.role === 'Opposing Expert');
      const matchesSearch = ent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ent.firm.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Apply filters
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
  }, [oppositionData, activeCategory, searchTerm, filterRole, filterFirm, filterStatus]);

  const handleSelectEntity = (entity: OppositionEntity) => {
    setSelectedEntity(entity);
    setIsInspectorOpen(true);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin h-8 w-8", theme.primary.text)}/></div>;

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Header Toolbar */}
      <div className={cn("p-4 border-b flex justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4 flex-1">
            <h3 className={cn("font-bold text-lg whitespace-nowrap", theme.text.primary)}>Opposition Intel</h3>
            <div className={cn("h-6 w-px", theme.border.default)}></div>
            <SearchToolbar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search counsel, parties, experts..." 
                className="w-full max-w-md border-none shadow-none p-0 bg-transparent"
            />
        </div>
        <div className="flex gap-2">
            <Button 
                variant={isFilterOpen ? "primary" : "secondary"} 
                icon={Filter} 
                onClick={() => setIsFilterOpen(!isFilterOpen)} 
                className="hidden sm:flex"
            >
                Filter
            </Button>
            <Button 
                variant={isInspectorOpen ? "primary" : "secondary"} 
                icon={Layout} 
                onClick={() => setIsInspectorOpen(!isInspectorOpen)}
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
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory}
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
                selectedId={selectedEntity?.id}
            />
        </div>

        {/* Right Inspector Panel */}
        {isInspectorOpen && selectedEntity && (
            <OppositionDetail 
                entity={selectedEntity} 
                onClose={() => setIsInspectorOpen(false)}
            />
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Opposition">
        <div className="p-6 space-y-4">
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
            <select 
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
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
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterFirm}
              onChange={e => setFilterFirm(e.target.value)}
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
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
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
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

