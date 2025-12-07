import React, { useEffect, useState } from 'react';
import { lazy } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { JudgeProfile } from '../../types';
import { MOCK_COUNSEL, MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../../data/mockAnalytics';
import { useQuery } from '../../services/queryClient';

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
  const [judges, setJudges] = useState<JudgeProfile[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  // Use useQuery for fetching judge profiles
  const { data: fetchedJudges, isLoading: isLoadingJudges } = useQuery<JudgeProfile[]>(
    ['analytics', 'judgeProfiles'],
    DataService.analytics.getJudgeProfiles
  );

  useEffect(() => {
    if (fetchedJudges && fetchedJudges.length > 0) {
      setJudges(fetchedJudges);
      if (!selectedJudgeId) {
        setSelectedJudgeId(fetchedJudges[0].id);
      }
    }
  }, [fetchedJudges, selectedJudgeId]);

  const currentJudge = judges.find(j => j.id === selectedJudgeId) || judges[0];

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
            {currentJudge && <JudgeAnalytics judge={currentJudge} stats={MOCK_JUDGE_STATS} />}
        </div>
    );
    case 'counsel': return <CounselAnalytics counsel={MOCK_COUNSEL[0]} />;
    case 'prediction': return <CasePrediction outcomeData={MOCK_OUTCOME_DATA} />;
    default: return null;
  }
};
