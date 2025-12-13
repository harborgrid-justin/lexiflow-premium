
/**
 * @module AdvisoryBoard
 * @category WarRoom
 * @description Manages the advisory board for a case, including experts and consultants.
 * Provides filtering, searching, and detailed views of advisors.
 */

import React, { useState } from 'react';
import { UserPlus, Filter, Layout, Loader2 } from 'lucide-react';

// Common Components
import { Button } from '../common/Button';
import { SearchToolbar } from '../common/SearchToolbar';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

// Sub-components
import { AdvisorySidebar } from './advisory/AdvisorySidebar';
import { AdvisorList, Advisor } from './advisory/AdvisorList';
import { AdvisorDetail } from './advisory/AdvisorDetail';

// Services
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';

interface AdvisoryBoardProps {
  caseId?: string;
}

export const AdvisoryBoard: React.FC<AdvisoryBoardProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Performance Engine: useQuery
  const { data: advisors = [], isLoading } = useQuery<Advisor[]>(
      [STORES.ADVISORS, caseId || 'all'],
      () => DataService.warRoom.getAdvisors(caseId)
  );

  const filteredAdvisors = advisors.filter(adv => {
    const matchesCategory = activeCategory === 'All' || 
                            (activeCategory === 'Experts' && adv.role === 'Expert Witness') ||
                            (activeCategory === 'Consultants' && adv.role !== 'Expert Witness') ||
                            (activeCategory === adv.specialty);
    const matchesSearch = adv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          adv.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <Button variant="secondary" icon={Filter} onClick={() => {}} className="hidden sm:flex">Filter</Button>
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
    </div>
  );
};
