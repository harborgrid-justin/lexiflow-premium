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
// Components
import { LazyLoader } from '@/components/molecules';

// ============================================================================
// LAZY-LOADED COMPONENTS
// ============================================================================
const BusinessIntelligence = lazy(() => import('./BusinessIntelligence'));
const PredictiveModels = lazy(() => import('./PredictiveModels'));

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface AnalyticsDashboardContentProps {
  activeTab: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnalyticsDashboardContent: React.FC<AnalyticsDashboardContentProps> = ({ activeTab }) => {
  // ==========================================================================
  // DETERMINE ACTIVE VIEW
  // ==========================================================================
  // Parse tab format: "parent" or "parent.child"
  const [mainTab, subTab] = activeTab.includes('.') ? activeTab.split('.') : [activeTab, ''];

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  return (
    <Suspense fallback={<LazyLoader message="Loading analytics data..." />}>
      {/* Business Intelligence: Firm, Practice, Attorney, Financial */}
      {mainTab === 'intel' && (
        <BusinessIntelligence 
          subTab={(subTab || 'firm') as 'firm' | 'practice' | 'attorney' | 'financial'} 
        />
      )}

      {/* Predictive Models: Case Outcomes */}
      {mainTab === 'model' && (
        <PredictiveModels subTab={(subTab || 'outcomes') as 'outcomes'} />
      )}
    </Suspense>
  );
};

