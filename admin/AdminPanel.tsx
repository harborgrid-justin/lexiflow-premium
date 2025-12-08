
import React, { Suspense, lazy, useTransition } from 'react';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout } from '../layout/TabbedPageLayout';
import { LazyLoader } from '../common/LazyLoader';
import { cn } from '../utils/cn';
import { ADMIN_TAB_CONFIG } from '../config/adminPanelConfig';
import { AdminPanelContent } from './AdminPanelContent';

type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelProps {
    initialTab?: AdminView;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('admin_active_tab', initialTab || 'hierarchy');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  return (
    <TabbedPageLayout
      pageTitle="Admin Console"
      pageSubtitle="System settings, security audits, and data management."
      tabConfig={ADMIN_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Admin Module..."/>}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            <AdminPanelContent activeTab={activeTab as AdminView} />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AdminPanel;
