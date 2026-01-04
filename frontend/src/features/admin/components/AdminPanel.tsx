/**
 * @module components/admin/AdminPanel
 * @category Administration
 * @description System administration panel with security and data management.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { Suspense, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/core';

// Components
import { TabbedPageLayout } from '@/components/layouts';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { AdminPanelContent } from './AdminPanelContent';

// Utils & Config
import { ADMIN_TAB_CONFIG } from '@/config/tabs.config';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type AdminView = 'hierarchy' | 'security' | 'db' | 'data' | 'logs' | 'integrations';

interface AdminPanelProps {
  /** Optional initial tab to display. */
  initialTab?: AdminView;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('admin_active_tab', initialTab || 'profile');

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
      <Suspense fallback={<LazyLoader message="Loading Admin Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          <AdminPanelContent activeTab={activeTab as AdminView} />
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default AdminPanel;
