/**
 * @module components/war-room/AdvisoryBoard
 * @category WarRoom
 * @description Manages the advisory board for a case, including experts and consultants.
 * Provides filtering, searching, and detailed views of advisors.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState } from 'react';
import { UserPlus, Filter, Layout, Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useFilterAndSearch } from '@/hooks/useFilterAndSearch';
import { useSelection } from '@/hooks/useSelectionState';
import { useToggle } from '@/hooks/useToggle';

// Components
import { Button } from '@/components/atoms/Button';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { AdaptiveLoader } from '@/components/molecules/AdaptiveLoader';
import { AdvisorySidebar } from './advisory/AdvisorySidebar';
import { AdvisorList, Advisor } from './advisory/AdvisorList';
import { AdvisorDetail } from './advisory/AdvisorDetail';
import { Modal } from '@/components/molecules/Modal';
import { ErrorState } from '@/components/molecules/ErrorState';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AdvisoryBoardProps {
  /** Optional case ID to filter advisors. If not provided, shows all advisors. */
  caseId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdvisoryBoard: React.FC<AdvisoryBoardProps> = ({ caseId }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const advisorSelection = useSelection<Advisor>();
  const inspectorToggle = useToggle();
  const filterToggle = useToggle();
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: advisors = [], isLoading, error, refetch } = useQuery<Advisor[]>(
      queryKeys.warRoom.advisors(caseId),
      () => DataService.warRoom.getAdvisors(caseId)
  );

  // ============================================================================
  // FILTER & SEARCH
  // ============================================================================
  const { filteredItems: baseFiltered, searchQuery, setSearchQuery, category, setCategory } = useFilterAndSearch({
    items: advisors,
    config: {
      categoryField: 'specialty',
      searchFields: ['name', 'specialty'],
      arrayFields: []
    },
    initialCategory: 'All'
  });

  // Apply additional filters and category logic
  const filteredAdvisors = React.useMemo(() => {
    let result = baseFiltered;

    // Map category to role/specialty logic
    if (category !== 'All') {
      result = result.filter(adv => {
        if (category === 'Experts') return adv.role === 'Expert Witness';
        if (category === 'Consultants') return adv.role !== 'Expert Witness';
        return adv.specialty === category;
      });
    }

    // Apply additional filters
    if (filterRole !== 'all') {
      result = result.filter(adv => adv.role === filterRole);
    }
    if (filterSpecialty !== 'all') {
      result = result.filter(adv => adv.specialty === filterSpecialty);
    }
    if (filterStatus !== 'all') {
      result = result.filter(adv => adv.status === filterStatus);
    }

    return result;
  }, [baseFiltered, category, filterRole, filterSpecialty, filterStatus]);

  const handleSelectAdvisor = (advisor: Advisor) => {
    advisorSelection.select(advisor);
    inspectorToggle.open();
  };

  if (isLoading) return <AdaptiveLoader contentType="list" itemCount={6} shimmer />;

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Header Toolbar */}
      <div className={cn("p-4 border-b flex justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4 flex-1">
            <h3 className={cn("font-bold text-lg whitespace-nowrap", theme.text.primary)}>Advisory Board</h3>
            <div className={cn("h-6 w-px", theme.border.default)}></div>
            <SearchToolbar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder="Search experts & consultants..." 
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
            <Button variant="primary" icon={UserPlus}>Retain New</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AdvisorySidebar 
            activeCategory={category} 
            onSelectCategory={setCategory}
            counts={{
                all: advisors.length,
                experts: advisors.filter(a => a.role === 'Expert Witness').length,
                consultants: advisors.filter(a => a.role !== 'Expert Witness').length
            }}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
            <AdvisorList 
                advisors={filteredAdvisors} 
                onSelect={handleSelectAdvisor}
                selectedId={advisorSelection.selected?.id}
            />
        </div>

        {/* Right Inspector Panel */}
        {inspectorToggle.isOpen && advisorSelection.selected && (
            <AdvisorDetail 
                advisor={advisorSelection.selected} 
                onClose={inspectorToggle.close}
            />
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={filterToggle.isOpen} onClose={filterToggle.close} title="Filter Advisors">
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
              <option value="Expert Witness">Expert Witness</option>
              <option value="Consultant">Consultant</option>
              <option value="Technical Advisor">Technical Advisor</option>
            </select>
          </div>

          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Specialty</label>
            <select 
              title="Filter by specialty"
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterSpecialty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              <option value="Medical">Medical</option>
              <option value="Financial">Financial</option>
              <option value="Forensic">Forensic</option>
              <option value="Engineering">Engineering</option>
              <option value="Technology">Technology</option>
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
              <option value="Retained">Retained</option>
              <option value="Consulting">Consulting</option>
              <option value="Potential">Potential</option>
            </select>
          </div>

          <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.border.default)}>
            <Button variant="ghost" onClick={() => { setFilterRole('all'); setFilterSpecialty('all'); setFilterStatus('all'); }}>
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


