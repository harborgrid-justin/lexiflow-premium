import { TabbedPageLayout } from '@/components/layouts';
import { DASHBOARD_TAB_CONFIG } from '@/config/tabs.config';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { Suspense, useMemo } from 'react';
import { useDashboard } from './DashboardProvider';

// Components
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { DashboardOverview } from './components/DashboardOverview';
import { PersonalWorkspace } from './components/PersonalWorkspace';

/**
 * DashboardView - Main Presentation Layout
 */
export function DashboardView() {
  const { activeTab, setActiveTab, currentUser, tasks, metrics } = useDashboard();

  const chartData = useMemo(() =>
    Object.entries(metrics.casesByStatus).map(([name, count]) => ({ name, count })),
    [metrics.casesByStatus]
  );

  const activeProjects = useMemo(() =>
    tasks.slice(0, 5).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      case: t.caseId || 'General',
      due: t.dueDate || '',
      progress: 0 // Default progress if not available
    })),
    [tasks]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'tasks':
        return <PersonalWorkspace activeTab="tasks" currentUser={currentUser!} />;
      case 'notifications':
        return <PersonalWorkspace activeTab="notifications" currentUser={currentUser!} />;
      case 'analytics':
        return <DashboardAnalytics activeProjects={activeProjects} chartData={chartData} />;
      case 'activity':
        return <div className="p-4">Activity Log (Implement me)</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Dashboard"
      pageSubtitle="Overview of your legal practice"
      tabConfig={DASHBOARD_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader />}>
        {renderContent()}
      </Suspense>
    </TabbedPageLayout>
  );
}
