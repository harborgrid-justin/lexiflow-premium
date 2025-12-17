/**
 * @module components/exhibits/ExhibitManager
 * @category Exhibits
 * @description Exhibit manager with digital stickering and presentation tools.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { 
  StickyNote, Filter, Layers, Users, Printer, Plus, Search, 
  BarChart2, PenTool, Layout, Grid, List, Loader2 
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { PageHeader } from '../common/PageHeader';
import { Button } from '../common/Button';
import { ExhibitTable } from './ExhibitTable';
import { StickerDesigner } from './StickerDesigner';
import { ExhibitStats } from './ExhibitStats';

// Context & Utils
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

// Data & Types
import { CaseId, TrialExhibit } from '../../types';
import { DataService } from '../../services/dataService';
import { useQuery, useMutation } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { queryKeys } from '../../utils/queryKeys';

interface ExhibitManagerProps {
    initialTab?: 'list' | 'sticker' | 'stats';
    caseId?: string; // Integration Point: Scoped to case
}

export const ExhibitManager: React.FC<ExhibitManagerProps> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'list' | 'sticker' | 'stats'>('list');
  const [filterParty, setFilterParty] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Enterprise Data Access
  // Using caseId in query key ensures React Query manages cache independently per case
  const { data: exhibitsData = [], isLoading, error } = useQuery<TrialExhibit[]>(
      [STORES.EXHIBITS, caseId || 'all'],
      DataService.exhibits.getAll
  );

  // Ensure exhibits is always an array
  const exhibits = Array.isArray(exhibitsData) ? exhibitsData : [];

  const { mutate: addExhibit } = useMutation(
      DataService.exhibits.add,
      { invalidateKeys: [[STORES.EXHIBITS, caseId || 'all']] }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleAddExhibit = () => {
      const newExhibit: TrialExhibit = {
          id: `ex-${Date.now()}`,
          caseId: (caseId || 'General') as CaseId, 
          exhibitNumber: `PX-${exhibits.length + 1}`,
          title: 'New Evidence Document',
          dateMarked: new Date().toISOString().split('T')[0],
          party: 'Plaintiff',
          status: 'Marked',
          fileType: 'PDF',
          description: 'Added via Exhibit Pro manager'
      };
      addExhibit(newExhibit);
  };

  // Filter exhibits locally if the service returns all (fallback) 
  // though DataService could be optimized to filter server-side
  const filteredExhibits = exhibits.filter(ex => {
      const matchParty = filterParty === 'All' || ex.party === filterParty;
      const matchCase = caseId ? ex.caseId === caseId : true;
      return matchParty && matchCase;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("h-full flex items-center justify-center", theme.background)}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={cn("h-8 w-8 animate-spin", theme.primary.text)} />
          <p className={cn("text-sm", theme.text.secondary)}>Loading exhibits...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('[ExhibitManager] Error loading exhibits:', error);
  }

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        {!caseId && (
            <PageHeader 
            title="Exhibit Pro" 
            subtitle="Trial exhibit management, digital stickering, and admissibility tracking."
            actions={
                <div className="flex gap-2">
                <Button variant="outline" icon={Printer}>Export Index</Button>
                <Button variant="primary" icon={Plus} onClick={handleAddExhibit}>Add Exhibit</Button>
                </div>
            }
            />
        )}
        
        {/* Case Context Header if Embedded */}
        {caseId && (
            <div className="flex justify-between items-center mb-4">
                 <h3 className={cn("text-lg font-bold", theme.text.primary)}>Case Exhibits</h3>
                 <Button variant="primary" icon={Plus} size="sm" onClick={handleAddExhibit}>Add Exhibit</Button>
            </div>
        )}

        {/* View Toggles */}
        <div className={cn("flex justify-between items-center border-b pb-4 mb-4", theme.border.default)}>
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                        activeTab === 'list' ? cn(theme.primary.DEFAULT, theme.text.inverse) : cn(theme.surface.default, theme.border.default, "border hover:border-slate-300")
                    )}
                >
                    <Layers className="h-4 w-4 mr-2"/> Exhibits
                </button>
                <button 
                    onClick={() => setActiveTab('sticker')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                        activeTab === 'sticker' ? cn(theme.primary.DEFAULT, theme.text.inverse) : cn(theme.surface.default, theme.border.default, "border hover:border-slate-300")
                    )}
                >
                    <PenTool className="h-4 w-4 mr-2"/> Sticker Designer
                </button>
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all",
                        activeTab === 'stats' ? cn(theme.primary.DEFAULT, theme.text.inverse) : cn(theme.surface.default, theme.border.default, "border hover:border-slate-300")
                    )}
                >
                    <BarChart2 className="h-4 w-4 mr-2"/> Analytics
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Filters) - Only visible in List Mode */}
        {activeTab === 'list' && (
            <div className={cn("w-64 border-r flex flex-col shrink-0 hidden md:flex", theme.border.default, theme.surface.raised)}>
                <div className="p-4 border-b">
                    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Binders</h4>
                    <div className="space-y-1">
                        {['All', 'Plaintiff', 'Defense', 'Joint', 'Court'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterParty(p)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center",
                                    filterParty === p ? cn(theme.surface.highlight, theme.primary.text) : theme.text.secondary
                                )}
                            >
                                {p} Exhibits
                                <span className={cn("text-xs px-2 py-0.5 rounded-full", theme.surface.highlight, theme.text.secondary)}>
                                    {p === 'All' ? filteredExhibits.length : filteredExhibits.filter(e => e.party === p).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4">
                    <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.tertiary)}>Witnesses</h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {Array.from(new Set(filteredExhibits.map(e => e.witness).filter(Boolean))).map(w => (
                            <button key={w as string} className={cn("w-full text-left px-3 py-1.5 rounded text-sm flex items-center", theme.text.secondary, theme.action.ghost.hover)}>
                                <Users className="h-3 w-3 mr-2 opacity-50"/> {w}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <div className={cn("flex-1 overflow-y-auto p-6 custom-scrollbar", theme.surface.default)}>
            {activeTab === 'list' && (
                <div className="space-y-4">
                    {/* List Toolbar */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative w-72">
                            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", theme.text.tertiary)}/>
                            <input 
                                className={cn("w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500", theme.surface.default, theme.border.default)}
                                placeholder="Search exhibits..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className={cn("flex p-1 rounded-lg border", theme.border.default, theme.surface.default)}>
                                <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded transition-colors", viewMode === 'list' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><List className="h-4 w-4"/></button>
                                <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded transition-colors", viewMode === 'grid' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}><Grid className="h-4 w-4"/></button>
                            </div>
                            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>Filter</Button>
                        </div>
                    </div>

                    <ExhibitTable exhibits={filteredExhibits} viewMode={viewMode} />
                </div>
            )}

            {activeTab === 'sticker' && <StickerDesigner />}
            
            {activeTab === 'stats' && <ExhibitStats exhibits={filteredExhibits} />}
        </div>
      </div>
    </div>
  );
};