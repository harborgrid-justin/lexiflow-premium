
import React, { Suspense, lazy, useTransition } from 'react';
import { Button } from '../common/Button';
import { Download } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { LazyLoader } from '../common/LazyLoader';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { useSessionStorage } from '../../hooks/useSessionStorage';
import { ANALYTICS_TAB_CONFIG } from '../../config/analyticsDashboardConfig';
import { AnalyticsDashboardContent } from './AnalyticsDashboardContent';

type AnalyticsView = 'judge' | 'counsel' | 'prediction';

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('analytics_active_tab', 'judge');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

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
