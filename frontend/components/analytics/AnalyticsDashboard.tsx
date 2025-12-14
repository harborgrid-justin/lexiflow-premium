/**
 * @module components/analytics/AnalyticsDashboard
 * @category Analytics
 * @description Business intelligence dashboard with firm-wide metrics and insights.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, lazy, useTransition } from 'react';
import { Download } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '../common/Button';
import { LazyLoader } from '../common/LazyLoader';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { AnalyticsDashboardContent } from './AnalyticsDashboardContent';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';
import { useSessionStorage } from '../../hooks/useSessionStorage';

// Utils & Config
import { cn } from '../../utils/cn';
import { ANALYTICS_TAB_CONFIG } from '../../config/analyticsDashboardConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type AnalyticsView = 'judge' | 'counsel' | 'prediction';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AnalyticsDashboard - Predictive intelligence hub for litigation strategy
 * 
 * Features:
 * - Judge analytics with ruling patterns and tendencies
 * - Opposing counsel behavioral analysis
 * - Case outcome predictions using historical data
 * - Monte Carlo settlement simulations
 */
export const AnalyticsDashboard: React.FC = () => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('analytics_active_tab', 'judge');

  // ==========================================================================
  // CALLBACKS - Event Handlers
  // ==========================================================================
  
  /**
   * Handles tab changes with React transition for smoother UX
   */
  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================
  
  return (
    <TabbedPageLayout
      pageTitle="Analytics & Prediction"
      pageSubtitle="Data-driven insights for litigation strategy and outcome modeling."
      pageActions={<Button variant="outline" size="sm" icon={Download}>Export Report</Button>}
      tabConfig={ANALYTICS_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Analytics Module..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            <AnalyticsDashboardContent activeTab={activeTab as AnalyticsView} />
          </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AnalyticsDashboard;
