
// components/Dashboard.tsx
import React, { Suspense, useTransition } from 'react';
import { Button } from './common/Button';
import { LayoutDashboard, CheckSquare, Bell, Download, PieChart, Activity, ShieldCheck } from 'lucide-react';
import { LazyLoader } from './common/LazyLoader';
import { TabbedPageLayout } from './layout/TabbedPageLayout';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { cn } from '../utils/cn';
import { DASHBOARD_TAB_CONFIG } from '../config/dashboardConfig';
import { DashboardContent } from './dashboard/DashboardContent';
import { User } from '../types';

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
  initialTab?: string;
  currentUser: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCase, initialTab, currentUser }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('dashboard_active_tab', initialTab || 'overview');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  const renderContent = () => {
    // Delegation to DashboardContent
    return <DashboardContent activeTab={activeTab} onSelectCase={onSelectCase} currentUser={currentUser} />;
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
      tabConfig={DASHBOARD_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
        <Suspense fallback={<LazyLoader message="Loading Dashboard Module..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
          </div>
        </Suspense>
    </TabbedPageLayout>
  );
};

export default Dashboard;
