
import React, { Suspense, lazy } from 'react';
import { LazyLoader } from '../common/LazyLoader';
import { DataService } from '../../services/dataService';
import { useQuery } from '../../services/queryClient';
import { JudgeProfile, OpposingCounselProfile, OutcomePredictionData } from '../../types';

const JudgeAnalytics = lazy(() => import('./JudgeAnalytics'));
const CounselAnalytics = lazy(() => import('./CounselAnalytics'));
const CasePrediction = lazy(() => import('./CasePrediction'));

interface AnalyticsDashboardContentProps {
  activeTab: 'judge' | 'counsel' | 'prediction';
}

export const AnalyticsDashboardContent: React.FC<AnalyticsDashboardContentProps> = ({ activeTab }) => {
  // Load sample data for demonstration
  const { data: judges = [] } = useQuery<JudgeProfile[]>(['analytics', 'judges'], DataService.analysis.getJudgeProfiles);
  const { data: counsels = [] } = useQuery<OpposingCounselProfile[]>(['analytics', 'counsel'], DataService.analysis.getCounselProfiles);
  const { data: predictionData = [] } = useQuery<OutcomePredictionData[]>(['analytics', 'prediction'], DataService.analysis.getPredictionData);

  const sampleJudge = judges[0];
  const sampleCounsel = counsels[0];
  const sampleStats = sampleJudge?.motionStats || [];

  return (
    <Suspense fallback={<LazyLoader message="Loading analytics data..." />}>
      {activeTab === 'judge' && sampleJudge && (
        <JudgeAnalytics judge={sampleJudge} stats={sampleStats} />
      )}
      {activeTab === 'counsel' && sampleCounsel && (
        <CounselAnalytics counsel={sampleCounsel} />
      )}
      {activeTab === 'prediction' && (
        <CasePrediction outcomeData={predictionData} />
      )}
    </Suspense>
  );
};
