import React, { Suspense } from 'react';
import { Button } from './common/Button';
import { LayoutDashboard, CheckSquare, Bell, Download, PieChart, Activity, ShieldCheck } from 'lucide-react';
import { LazyLoader } from './common/LazyLoader';
import { TabbedPageLayout } from './layout/TabbedPageLayout';
import { useSessionStorage } from '../hooks/useSessionStorage';

// Sub-components - LAZY LOADED
const DashboardOverview = React.lazy(() => import('./dashboard/DashboardOverview'));
const FinancialPerformance = React.lazy(() => import('./dashboard/FinancialPerformance'));
const PersonalWorkspace = React.lazy(() => import('./dashboard/PersonalWorkspace'));

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: string;
}

const TAB_CONFIG = [
  {
    id: 'executive', label: 'Executive', icon: LayoutDashboard,
    subTabs: [
      { id: 'overview', label: 'Firm Overview', icon: Activity },
      { id: 'financials', label: 'Performance', icon: PieChart },
    ]
  },
  {
    id: 'personal', label: 'My Workspace', icon: CheckSquare,
    subTabs: [
      { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ]
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase, initialTab }) => {
  const [activeTab, setActiveTab] = useSessionStorage<string>('dashboard_active_tab', initialTab || 'overview');

  const renderContent = () => {
    switch (activeTab) {
        case 'overview': return <DashboardOverview onSelectCase={onSelectCase} />;
        case 'financials': return <FinancialPerformance />;
        case 'tasks': return <PersonalWorkspace activeTab="tasks" />;
        case 'notifications': return <PersonalWorkspace activeTab="notifications" />;
        default: return <DashboardOverview onSelectCase={onSelectCase} />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Executive Dashboard"
      pageSubtitle="Real-time firm intelligence and personal productivity center."
      pageActions={
        <div className="flex items-center gap-2">
            <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200">
                <ShieldCheck className="h-3 w-3 mr-1"/> SYSTEM OPERATIONAL
            </span>
            <Button variant="outline" size="sm" icon={Download}>Export Report</Button>
        </div>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
        <Suspense fallback={<LazyLoader message="Loading Dashboard Module..." />}>
            {renderContent()}
        </Suspense>
    </TabbedPageLayout>
  );
};

export default Dashboard;
