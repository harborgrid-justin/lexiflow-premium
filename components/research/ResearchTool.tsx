
// components/ResearchTool.tsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Search, Scale, BookOpen, ScrollText, BarChart3, Gavel, Users, TrendingUp,
  BrainCircuit, Map, Calculator, FileText, Bookmark, Library
} from 'lucide-react';
import { LazyLoader } from '../common/LazyLoader';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { DataService } from '../../services/dataService';
import { JudgeProfile, Clause } from '../../types';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { RESEARCH_TAB_CONFIG } from '../../config/researchToolConfig';
import { ResearchToolContent } from './ResearchToolContent';

const ClauseHistoryModal = lazy(() => import('../clauses/ClauseHistoryModal'));

export const ResearchTool: React.FC<{ initialTab?: string; caseId?: string }> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  // Scope session storage key if in case context
  const storageKey = caseId ? `research_active_view_${caseId}` : 'research_active_view';
  const [activeView, setActiveView] = useSessionStorage<string>(storageKey, initialTab || 'search_home');

  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [judges, setJudges] = useState<JudgeProfile[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  useEffect(() => {
    if (activeView.startsWith('analytics_')) {
        const loadJudges = async () => {
            const data = await DataService.analysis.getJudgeProfiles();
            setJudges(data);
            if (data.length > 0 && !selectedJudgeId) setSelectedJudgeId(data[0].id);
        };
        loadJudges();
    }
  }, [activeView, selectedJudgeId]);

  const renderContent = () => {
    // Delegation to ResearchToolContent
    return (
      <ResearchToolContent
        activeView={activeView}
        caseId={caseId}
        selectedClause={selectedClause}
        setSelectedClause={setSelectedClause}
      />
    );
  };

  // If embedded in a case, we might want to hide the header or simplify it
  if (caseId) {
      return (
          <>
            {selectedClause && (
                <Suspense fallback={null}>
                    <ClauseHistoryModal clause={selectedClause} onClose={() => setSelectedClause(null)} />
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
      {selectedClause && (
          <Suspense fallback={null}>
              <ClauseHistoryModal clause={selectedClause} onClose={() => setSelectedClause(null)} />
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
