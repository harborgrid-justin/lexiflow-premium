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
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { queryKeys } from '../../utils/queryKeys';
import { STORES } from '../../services/db';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';
import { AdvisorySidebar } from './advisory/AdvisorySidebar';
import { AdvisorList, Advisor } from './advisory/AdvisorList';
import { AdvisorDetail } from './advisory/AdvisorDetail';
import { Modal } from '../common/Modal';

// Utils & Constants
import { cn } from '../../utils/cn';

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
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: advisors = [], isLoading } = useQuery<Advisor[]>(
      queryKeys.warRoom.advisors(caseId),
      () => DataService.warRoom.getAdvisors(caseId)
  );

  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  const filteredAdvisors = React.useMemo(() => {
    let result = advisors.filter(adv => {
      const matchesCategory = activeCategory === 'All' || 
                              (activeCategory === 'Experts' && adv.role === 'Expert Witness') ||
                              (activeCategory === 'Consultants' && adv.role !== 'Expert Witness') ||
                              (activeCategory === adv.specialty);
      const matchesSearch = adv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            adv.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Apply filters
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
  }, [advisors, activeCategory, searchTerm, filterRole, filterSpecialty, filterStatus]);

  const handleSelectAdvisor = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsInspectorOpen(true);
  };

  if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin h-8 w-8", theme.primary.text)}/></div>;

  return (
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border overflow-hidden", theme.surface.default, theme.border.default)}>
      {/* Header Toolbar */}
      <div className={cn("p-4 border-b flex justify-between items-center gap-4", theme.surface.highlight, theme.border.default)}>
        <div className="flex items-center gap-4 flex-1">
            <h3 className={cn("font-bold text-lg whitespace-nowrap", theme.text.primary)}>Advisory Board</h3>
            <div className={cn("h-6 w-px", theme.border.default)}></div>
            <SearchToolbar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                placeholder="Search experts & consultants..." 
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
            <Button variant="primary" icon={UserPlus}>Retain New</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AdvisorySidebar 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory}
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
                selectedId={selectedAdvisor?.id}
            />
        </div>

        {/* Right Inspector Panel */}
        {isInspectorOpen && selectedAdvisor && (
            <AdvisorDetail 
                advisor={selectedAdvisor} 
                onClose={() => setIsInspectorOpen(false)}
            />
        )}
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Advisors">
        <div className="p-6 space-y-4">
          <div>
            <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
            <select 
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
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
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterSpecialty}
              onChange={e => setFilterSpecialty(e.target.value)}
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
              className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
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
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
