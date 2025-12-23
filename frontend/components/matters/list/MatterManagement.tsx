/**
 * @module components/matters/MatterManagement
 * @category Matter Management
 * @description Main matter management interface with tabbed navigation
 * 
 * ARCHITECTURE:
 * - Uses TabbedPageLayout like DocumentManager for consistent UI/UX
 * - Lazy loads tab content via MatterManagerContent
 * - Session storage for tab persistence
 * - Backend API integration via DataService
 */

import React, { Suspense, lazy, useTransition } from 'react';
import { Plus, Clock, BarChart3 } from 'lucide-react';
import { useSessionStorage } from '../../../hooks/useSessionStorage';
import { Button } from '../../common/Button';
import { TabbedPageLayout } from '../../layout/TabbedPageLayout';
import { LazyLoader } from '../../common/LazyLoader';
import { MatterManagerContent } from './MatterManagerContent';
import { cn } from '../../../utils/cn';
import { MATTER_MANAGEMENT_TAB_CONFIG, MatterView } from '../../../config/tabs.config';
import { PATHS } from '../../../config/paths.config';

export const MatterManagement: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('matters_active_tab', 'all');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  const navigate = (path: string) => {
    window.location.hash = `#/${path}`;
  };

  const renderContent = () => {
    return <MatterManagerContent activeTab={activeTab as MatterView} />;
  };

  return (
    <TabbedPageLayout
      pageTitle="Matter Management"
      pageSubtitle="Centralized case oversight, intake pipeline, and resource coordination"
      pageActions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={Clock} onClick={() => setActiveTab('calendar')}>
            Calendar
          </Button>
          <Button variant="secondary" icon={BarChart3} onClick={() => setActiveTab('analytics')}>
            Analytics
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => navigate(PATHS.MATTERS + '/new')}>
            New Matter
          </Button>
        </div>
      }
      tabConfig={MATTER_MANAGEMENT_TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Matter Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

