

import React, { Suspense, lazy, useTransition } from 'react';
import { Network, Shield, Link, Database, Activity, Lock, Server } from 'lucide-react';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { TabbedPageLayout, TabConfigItem } from './layout/TabbedPageLayout';
import { LazyLoader } from './common/LazyLoader';
import { cn } from '../utils/cn';
import { ADMIN_TAB_CONFIG } from '../config/adminPanelConfig';

// Sub-components with corrected relative paths
const AdminHierarchy = lazy(() => import('./admin/hierarchy/AdminHierarchy').then(m => ({ default: m.AdminHierarchy })));
const AdminSecurity = lazy(() => import('./admin/security/AdminSecurity').then(m => ({ default: m.AdminSecurity })));
const AdminDatabaseControl = lazy(() => import('./admin/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AdminIntegrations = lazy(() => import('./admin/integrations/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminAuditLog = lazy(() => import('./admin/AdminAuditLog').then(m => ({ default: m.AdminAuditLog })));
const AdminPlatformManager = lazy(() => import('./admin/platform/AdminPlatformManager').then(m => ({ default: m.AdminPlatformManager })));

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

  const renderContent = () => {
    switch (activeTab) {
      case 'hierarchy': return <AdminHierarchy />;
      case 'security': return <AdminSecurity />;
      case 'db': return <AdminDatabaseControl />;
      case 'data': return <AdminPlatformManager />;
      case 'logs': return <AdminAuditLog />;
      case 'integrations': return <AdminIntegrations />;
      default: return <AdminHierarchy />;
    }
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
            {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AdminPanel;