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
import { Download } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { TabbedPageLayout } from '@/components/layouts';
import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { AnalyticsDashboardContent } from './AnalyticsDashboardContent';

// Hooks & Context
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Services
import { api } from '@/api';

// Utils & Config
import { ANALYTICS_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/utils/cn';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AnalyticsDashboard - Business intelligence and predictive analytics
 *
 * Features:
 * - Business Intelligence (Firm Metrics, Practice Groups, Attorney Performance, Financial KPIs)
 * - Predictive Models (Case Outcome Predictions)
 * - Export Report functionality
 */
export const AnalyticsDashboard: React.FC = () => {
  // ==========================================================================
  // HOOKS - Context & State
  // ==========================================================================
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('analytics_active_tab', 'intel.firm');
  const [isExporting, setIsExporting] = useState(false);

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

  /**
   * Handles export report functionality
   */
  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const response = await api.analyticsDashboard.exportReport('pdf', {
        reportType: 'full-analytics',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

      // In a real implementation, this would trigger a download
      console.log('Report generated:', response);
      alert('Report export functionality will be available soon.');
    } catch (error) {
      console.error('Failed to export report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <TabbedPageLayout
      pageTitle="Analytics & Prediction"
      pageSubtitle="Data-driven insights for litigation strategy and outcome modeling."
      pageActions={
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={handleExportReport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export Report'}
        </Button>
      }
      tabConfig={ANALYTICS_TAB_CONFIG as any}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Analytics Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          <AnalyticsDashboardContent activeTab={activeTab} />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AnalyticsDashboard;
