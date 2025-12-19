/**
 * @module components/research/ResearchTool
 * @category Legal Research
 * @description Legal research tool with case law, statutes, and citation analysis.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Search, Scale, BookOpen, ScrollText, BarChart3, Gavel, Users, TrendingUp,
  BrainCircuit, Map, Calculator, FileText, Bookmark, Library
} from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService';
import { useQuery } from '../../hooks/useQueryHooks';
import { queryKeys } from '../../utils/queryKeys';

// Hooks & Context
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { useTheme } from '../../context/ThemeContext';
import { useSingleSelection } from '../../hooks/useMultiSelection';

// Components
import { LazyLoader } from '../common/LazyLoader';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { ResearchToolContent } from './ResearchToolContent';

// Utils & Config
import { cn } from '../../utils/cn';
import { RESEARCH_TAB_CONFIG } from '../../config/tabs.config';

// Types
import { JudgeProfile, Clause } from '../../types';

const ClauseHistoryModal = lazy(async () => {
  const module = await import('../clauses/ClauseHistoryModal');
  return { default: module.ClauseHistoryModal };
});

export const ResearchTool: React.FC<{ initialTab?: string; caseId?: string }> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  // Scope session storage key if in case context
  const storageKey = caseId ? `research_active_view_${caseId}` : 'research_active_view';
  const [activeView, setActiveView] = useSessionStorage<string>(storageKey, initialTab || 'search_home');

  const clauseSelection = useSingleSelection<Clause>(null, (a, b) => a.id === b.id);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  // Load judges from IndexedDB via useQuery for accurate, cached data
  const { data: judges = [], isLoading: isLoadingJudges } = useQuery(
    queryKeys.adminExtended.judgeProfiles(),
    () => DataService.analysis.getJudgeProfiles(),
    { enabled: activeView.startsWith('analytics_') }
  );

  // Set initial judge selection when data loads
  useEffect(() => {
    if (judges.length > 0 && !selectedJudgeId) {
      setSelectedJudgeId(judges[0].id);
    }
  }, [judges, selectedJudgeId]);

  const renderContent = () => {
    // Delegation to ResearchToolContent
    return (
      <ResearchToolContent
        activeView={activeView}
        caseId={caseId}
        selectedClause={clauseSelection.selected}
        setSelectedClause={clauseSelection.select}
      />
    );
  };

  // If embedded in a case, we might want to hide the header or simplify it
  if (caseId) {
      return (
          <>
            {clauseSelection.selected && (
                <Suspense fallback={null}>
                    <ClauseHistoryModal clause={clauseSelection.selected} onClose={clauseSelection.deselect} />
                </Suspense>
            )}
            <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
                {/* Embedded Navigation (Simplified) */}
                <div className={cn("px-6 pt-2 shrink-0 border-b", theme.border.default)}>
                     <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-3">
                         {RESEARCH_TAB_CONFIG.flatMap(g => g.subTabs).map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id)}
                                className={cn(
                                    "flex items-center text-xs font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                                    activeView === tab.id
                                        ? cn(theme.primary.light, theme.primary.text, theme.primary.border)
                                        : cn(theme.surface.default, theme.text.secondary, theme.border.default, `hover:${theme.surface.highlight}`)
                                )}
                             >
                                 <tab.icon className="h-3 w-3 mr-1.5"/>
                                 {tab.label}
                             </button>
                         ))}
                     </div>
                </div>
                <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0 pt-4">
                    <Suspense fallback={<LazyLoader message="Loading Research Tools..." />}>
                        {renderContent()}
                    </Suspense>
                </div>
            </div>
          </>
      );
  }

  return (
    <>
      {clauseSelection.selected && (
          <Suspense fallback={null}>
              <ClauseHistoryModal clause={clauseSelection.selected} onClose={clauseSelection.deselect} />
          </Suspense>
      )}
      <TabbedPageLayout
        pageTitle="Research & Knowledge Center"
        pageSubtitle="Unified intelligence hub for legal authority, firm knowledge, and strategic analysis."
        tabConfig={RESEARCH_TAB_CONFIG}
        activeTabId={activeView}
        onTabChange={setActiveView}
      >
          <Suspense fallback={<LazyLoader message="Loading Module..." />}>
              {renderContent()}
          </Suspense>
      </TabbedPageLayout>
    </>
  );
};

export default ResearchTool;

