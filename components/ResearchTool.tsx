
import React, { useState, useEffect, Suspense } from 'react';
import { 
  Search, Scale, BookOpen, ScrollText, BarChart3, Gavel, Users, TrendingUp, 
  BrainCircuit, Map, Calculator, FileText, Bookmark, Library
} from 'lucide-react';
import { LazyLoader } from './common/LazyLoader';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { DataService } from '../services/dataService';
import { JudgeProfile, Clause } from '../types';
import { TabbedPageLayout } from './layout/TabbedPageLayout';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

// --- Lazy Loaded Components ---
// Updated to handle named exports correctly
const WikiView = React.lazy(() => import('./knowledge/WikiView').then(m => ({ default: m.WikiView })));
const PrecedentsView = React.lazy(() => import('./knowledge/PrecedentsView').then(m => ({ default: m.PrecedentsView })));
const QAView = React.lazy(() => import('./knowledge/QAView').then(m => ({ default: m.QAView })));
const KnowledgeAnalytics = React.lazy(() => import('./knowledge/KnowledgeAnalytics').then(m => ({ default: m.KnowledgeAnalytics })));
const ClauseList = React.lazy(() => import('./clauses/ClauseList').then(m => ({ default: m.ClauseList })));
const ClauseHistoryModal = React.lazy(() => import('./ClauseHistoryModal').then(m => ({ default: m.ClauseHistoryModal })));
const JudgeAnalytics = React.lazy(() => import('./analytics/JudgeAnalytics').then(m => ({ default: m.JudgeAnalytics })));
const CounselAnalytics = React.lazy(() => import('./analytics/CounselAnalytics').then(m => ({ default: m.CounselAnalytics })));
const CasePrediction = React.lazy(() => import('./analytics/CasePrediction').then(m => ({ default: m.CasePrediction })));
const SettlementCalculator = React.lazy(() => import('./analytics/SettlementCalculator').then(m => ({ default: m.SettlementCalculator })));
const RuleBookViewer = React.lazy(() => import('./rules/RuleBookViewer').then(m => ({ default: m.RuleBookViewer })));
const StandingOrders = React.lazy(() => import('./rules/StandingOrders').then(m => ({ default: m.StandingOrders })));
const LocalRulesMap = React.lazy(() => import('./rules/LocalRulesMap').then(m => ({ default: m.LocalRulesMap })));
const CitationLibrary = React.lazy(() => import('./citation/CitationLibrary').then(m => ({ default: m.CitationLibrary })));
const BriefAnalyzer = React.lazy(() => import('./citation/BriefAnalyzer').then(m => ({ default: m.BriefAnalyzer })));

import { MOCK_COUNSEL, MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../data/mockAnalytics';

const UniversalSearch = () => {
    const { theme } = useTheme();
    return (
        <div className={cn("h-full flex flex-col items-center justify-center text-center p-8", theme.text.tertiary)}>
            <div className={cn("p-6 rounded-full mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border", theme.border.default)}>
                <BrainCircuit className="h-16 w-16 opacity-50 text-blue-600"/>
            </div>
            <h2 className={cn("text-2xl font-bold", theme.text.primary)}>Universal Knowledge Graph</h2>
            <p className="max-w-md mt-2 mb-8">Perform semantic searches across case law, firm wikis, clauses, and predictive analytics with a single natural language query.</p>
            <div className={cn("w-full max-w-xl p-4 rounded-lg border bg-opacity-50 flex items-center gap-3", theme.surfaceHighlight, theme.border.default)}>
                <Search className="h-5 w-5 opacity-50"/>
                <span className="text-sm opacity-50">Search all firm intelligence...</span>
            </div>
        </div>
    );
};

const TAB_CONFIG = [
  {
    id: 'intel', label: 'Intelligence', icon: BrainCircuit,
    subTabs: [
      { id: 'search_home', label: 'Universal Search', icon: Search },
      { id: 'analytics_judge', label: 'Judge Analytics', icon: Gavel },
      { id: 'analytics_counsel', label: 'Opposing Counsel', icon: Users },
      { id: 'analytics_prediction', label: 'Case Outcome', icon: TrendingUp },
    ]
  },
  {
    id: 'authority', label: 'Legal Authority', icon: Scale,
    subTabs: [
      { id: 'authority_fre', label: 'Evidence (FRE)', icon: BookOpen },
      { id: 'authority_frcp', label: 'Civil Proc. (FRCP)', icon: BookOpen },
      { id: 'authority_local', label: 'Local Rules', icon: Map },
      { id: 'authority_standing', label: 'Standing Orders', icon: Gavel },
      { id: 'authority_citations', label: 'Citation Library', icon: Bookmark },
    ]
  },
  {
    id: 'knowledge', label: 'Firm Knowledge', icon: Library,
    subTabs: [
      { id: 'knowledge_wiki', label: 'Practice Wiki', icon: FileText },
      { id: 'knowledge_precedents', label: 'Precedents', icon: ScrollText },
      { id: 'knowledge_qa', label: 'Firm Q&A', icon: Users },
      { id: 'knowledge_analytics', label: 'Usage Stats', icon: BarChart3 },
    ]
  },
  {
    id: 'tools', label: 'Drafting Tools', icon: ScrollText,
    subTabs: [
      { id: 'drafting_clauses', label: 'Clause Library', icon: ScrollText },
      { id: 'drafting_analyzer', label: 'Brief Analyzer', icon: BrainCircuit },
      { id: 'analytics_settlement', label: 'Settlement Calc', icon: Calculator },
    ]
  }
];

export const ResearchTool: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useSessionStorage<string>('research_active_view', initialTab || 'search_home');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [judges, setJudges] = useState<JudgeProfile[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  useEffect(() => {
    if (activeView.startsWith('analytics_')) {
        const loadJudges = async () => {
            const data = await DataService.analytics.getJudgeProfiles();
            setJudges(data);
            if (data.length > 0 && !selectedJudgeId) setSelectedJudgeId(data[0].id);
        };
        loadJudges();
    }
  }, [activeView, selectedJudgeId]);

  const renderContent = () => {
    switch (activeView) {
        case 'search_home': return <UniversalSearch />;
        case 'analytics_judge': {
            const currentJudge = judges.find(j => j.id === selectedJudgeId) || judges[0];
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <label className={cn("text-sm font-medium", theme.text.secondary)}>Select Judge:</label>
                        <select 
                            className={cn("p-2 rounded border text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                            value={selectedJudgeId} onChange={(e) => setSelectedJudgeId(e.target.value)}
                        >
                            {judges.map(j => <option key={j.id} value={j.id}>{j.name} ({j.court})</option>)}
                        </select>
                    </div>
                    {currentJudge && <JudgeAnalytics judge={currentJudge} stats={MOCK_JUDGE_STATS} />}
                </div>
            );
        }
        case 'analytics_counsel': return <CounselAnalytics counsel={MOCK_COUNSEL[0]} />;
        case 'analytics_prediction': return <CasePrediction outcomeData={MOCK_OUTCOME_DATA} />;
        case 'authority_fre': return <RuleBookViewer type="FRE" title="Federal Rules of Evidence" />;
        case 'authority_frcp': return <RuleBookViewer type="FRCP" title="Federal Rules of Civil Procedure" />;
        case 'authority_local': return <div className="h-full"><LocalRulesMap /></div>;
        case 'authority_standing': return <StandingOrders />;
        case 'authority_citations': return <CitationLibrary onSelect={() => {}} />;
        case 'knowledge_wiki': return <WikiView />;
        case 'knowledge_precedents': return <div className="h-full overflow-y-auto p-1"><PrecedentsView /></div>;
        case 'knowledge_qa': return <div className="h-full overflow-y-auto p-1"><QAView /></div>;
        case 'knowledge_analytics': return <div className="h-full overflow-y-auto p-1"><KnowledgeAnalytics /></div>;
        case 'drafting_clauses': return <ClauseList onSelectClause={setSelectedClause} />;
        case 'drafting_analyzer': return <BriefAnalyzer />;
        case 'analytics_settlement': return <SettlementCalculator />;
        default: return <UniversalSearch />;
    }
  };

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
        tabConfig={TAB_CONFIG}
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
