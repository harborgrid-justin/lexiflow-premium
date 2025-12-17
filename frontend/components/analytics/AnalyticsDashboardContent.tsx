/**
 * AnalyticsDashboardContent.tsx
 * 
 * Content router for analytics dashboard tabs - loads data and renders
 * appropriate analytics view based on active tab selection.
 * 
 * @module components/analytics/AnalyticsDashboardContent
 * @category Analytics - Content Router
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/dataService';

// Hooks
import { useQuery } from '../../services/queryClient';

// Components
import { LazyLoader } from '../common/LazyLoader';

// Types
import type { JudgeProfile, OpposingCounselProfile, OutcomePredictionData } from '../../types';

// ============================================================================
// LAZY-LOADED COMPONENTS
// ============================================================================
const JudgeAnalytics = lazy(() => import('./JudgeAnalytics'));
const CounselAnalytics = lazy(() => import('./CounselAnalytics'));
const CasePrediction = lazy(() => import('./CasePrediction'));

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AnalyticsDashboardContentProps {
  activeTab: 'judge' | 'counsel' | 'prediction';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnalyticsDashboardContent: React.FC<AnalyticsDashboardContentProps> = ({ activeTab }) => {
  // ==========================================================================
  // HOOKS - Data Fetching
  // ==========================================================================
  
  const { data: judges } = useQuery<JudgeProfile[]>(
    ['analytics', 'judges'], 
    DataService.analysis.getJudgeProfiles,
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );
  
  const { data: counsels } = useQuery<OpposingCounselProfile[]>(
    ['analytics', 'counsel'], 
    () => DataService.analysis.getCounselProfiles(),
    { staleTime: 5 * 60 * 1000 }
  );
  
  const { data: predictionData } = useQuery<OutcomePredictionData[]>(
    ['analytics', 'prediction'], 
    () => DataService.analysis.getPredictionData(),
    { staleTime: 5 * 60 * 1000 }
  );

  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================
  const sampleJudge = (judges || [])[0];
  const sampleCounsel = (counsels || [])[0];
  const sampleStats = sampleJudge?.motionStats || [];

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  
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
