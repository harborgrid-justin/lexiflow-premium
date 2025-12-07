

import React, { useState, useMemo, useCallback, useEffect, Suspense, useTransition } from 'react';
import { PageHeader } from './common/PageHeader';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { BarChart3, Gavel, Users, TrendingUp, BrainCircuit, Download, Search } from 'lucide-react';
import { Button } from './common/Button';
import { DataService } from '../services/dataService';
import { LazyLoader } from './common/LazyLoader';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { JudgeProfile } from '../types';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { MOCK_COUNSEL, MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../data/mockAnalytics';

// Sub-components with Correct Paths and Named Exports
const JudgeAnalytics = React.lazy(() => import('./analytics/JudgeAnalytics').then(m => ({ default: m.JudgeAnalytics })));
const CounselAnalytics = React.lazy(() => import('./analytics/CounselAnalytics').then(m => ({ default: m.CounselAnalytics })));
const CasePrediction = React.lazy(() => import('./analytics/CasePrediction').then(m => ({ default: m.CasePrediction })));

type AnalyticsView = 'judge' | 'counsel' | 'prediction';

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'intel', label: 'Litigation Intelligence', icon: BarChart3,
    subTabs: [
      { id: 'judge', label: 'Judge Analytics', icon: Gavel },
      { id: 'counsel', label: 'Opposing Counsel', icon: Users },
    ]
  },
  {
    id: 'model', label: 'Predictive Modeling', icon: BrainCircuit,
    subTabs: [
      { id: 'prediction', label: 'Outcome Forecast', icon: TrendingUp },
    ]
  }
];

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('analytics_active_tab', 'judge');
  const [judges, setJudges] = useState<JudgeProfile[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  useEffect(() => {
      const loadJudges = async () => {
          const data = await DataService.analytics.getJudgeProfiles();
          setJudges(data);
          if (data.length > 0 && !selectedJudgeId) setSelectedJudgeId(data[0].id);
      };
      loadJudges();
  }, [selectedJudgeId]);

  const renderContent = () => {
    const currentJudge = judges.find(j => j.id === selectedJudgeId) || judges[0];
    
    switch (activeTab) {
      case 'judge': return (
          <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <label className={cn("text-sm font-medium", theme.text.secondary)}>Select Judge:</label>
                  <select 
                    className={cn("p-2 rounded border text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                  >
                      {judges.map(j => ( <option key={j.id} value={j.id}>{j.name} ({j.court})</option>))}
                  </select>
              </div>
              {currentJudge && <JudgeAnalytics judge={currentJudge} stats={MOCK_JUDGE_STATS} />}
          </div>
      );
      case 'counsel': return <CounselAnalytics counsel={MOCK_COUNSEL[0]} />;
      case 'prediction': return <CasePrediction outcomeData={MOCK_OUTCOME_DATA} />;
      default: return null;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Analytics & Prediction"
      pageSubtitle="Data-driven insights for litigation strategy and outcome modeling."
      pageActions={<Button variant="outline" size="sm" icon={Download}>Export Report</Button>}
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Analytics Module..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
          </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AnalyticsDashboard;