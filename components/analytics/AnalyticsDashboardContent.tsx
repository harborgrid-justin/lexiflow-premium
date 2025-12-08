import React, { useEffect, useState } from 'react';
import { lazy } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { JudgeProfile, OpposingCounselProfile, OutcomePredictionData, JudgeMotionStat } from '../../types';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { Loader2 } from 'lucide-react';

// Sub-components with Correct Paths and Named Exports
const JudgeAnalytics = lazy(() => import('./JudgeAnalytics').then(m => ({ default: m.JudgeAnalytics })));
const CounselAnalytics = lazy(() => import('./CounselAnalytics').then(m => ({ default: m.CounselAnalytics })));
const CasePrediction = lazy(() => import('./CasePrediction').then(m => ({ default: m.CasePrediction })));

type AnalyticsView = 'judge' | 'counsel' | 'prediction';

interface AnalyticsDashboardContentProps {
  activeTab: AnalyticsView;
}

export const AnalyticsDashboardContent: React.FC<AnalyticsDashboardContentProps> = ({ activeTab }) => {
  const { theme } = useTheme();

  // Enterprise Data Fetching
  const { data: judges = [], isLoading: loadingJudges } = useQuery<JudgeProfile[]>(
    [STORES.JUDGES, 'all'],
    DataService.analysis.getJudgeProfiles
  );
  const { data: counsel = [], isLoading: loadingCounsel } = useQuery<OpposingCounselProfile[]>(
    [STORES.COUNSEL_PROFILES, 'all'],
    DataService.analytics.getCounselProfiles
  );
  const { data: judgeStats = [], isLoading: loadingJudgeStats } = useQuery<JudgeMotionStat[]>(
    [STORES.JUDGE_MOTION_STATS, 'all'],
    DataService.analytics.getJudgeMotionStats
  );
  const { data: outcomeData = [], isLoading: loadingOutcome } = useQuery<OutcomePredictionData[]>(
    [STORES.OUTCOME_PREDICTIONS, 'all'],
    DataService.analytics.getOutcomePredictions
  );

  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  useEffect(() => {
    if (judges && judges.length > 0 && !selectedJudgeId) {
      setSelectedJudgeId(judges[0].id);
    }
  }, [judges, selectedJudgeId]);

  const currentJudge = judges.find(j => j.id === selectedJudgeId) || judges[0];
  const currentCounsel = counsel[0]; // Simple selection for demo

  const isLoading = loadingJudges || loadingCounsel || loadingJudgeStats || loadingOutcome;

  if (isLoading) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600"/></div>
  }

  switch (activeTab) {
    case 'judge': return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <label className={cn("text-sm font-medium", theme.text.secondary)}>Select Judge:</label>
                <select 
                  className={cn("p-2 rounded border text-sm outline-none", theme.surface.default, theme.border.default, theme.text.primary)}
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                >
                    {judges.map(j => ( <option key={j.id} value={j.id}>{j.name} ({j.court})</option>))}
                </select>
            </div>
            {currentJudge && <JudgeAnalytics judge={currentJudge} stats={judgeStats} />}
        </div>
    );
    case 'counsel': return currentCounsel && <CounselAnalytics counsel={currentCounsel} />;
    case 'prediction': return <CasePrediction outcomeData={outcomeData} />;
    default: return null;
  }
};
