/**
 * @module components/calendar/CalendarView
 * @category Calendar
 * @description Full calendar view with event management and scheduling.
 *
 * THEME SYSTEM USAGE:
 * Uses theme indirectly through child components.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AlertTriangle, Calendar, Clock, Download, Gavel, Layers, Plus, RefreshCw, Settings, Users } from 'lucide-react';
import React, { lazy, Suspense, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks
import { useSessionStorage } from '@/hooks/useSessionStorage';

// Components
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { Button } from '@/components/ui/atoms/Button/Button';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';

// Utils & Config
import { cn } from '@/utils/cn';

// Lazy load sub-components
const CalendarMaster = lazy(() => import('./CalendarMaster').then(m => ({ default: m.CalendarMaster })));
const CalendarDeadlines = lazy(() => import('./CalendarDeadlines').then(m => ({ default: m.CalendarDeadlines })));
const CalendarTeam = lazy(() => import('./CalendarTeam').then(m => ({ default: m.CalendarTeam })));
const CalendarHearings = lazy(() => import('./CalendarHearings').then(m => ({ default: m.CalendarHearings })));
const CalendarSOL = lazy(() => import('./CalendarSOL').then(m => ({ default: m.CalendarSOL })));
const CalendarRules = lazy(() => import('./CalendarRules').then(m => ({ default: m.CalendarRules })));
const CalendarSync = lazy(() => import('./CalendarSync').then(m => ({ default: m.CalendarSync })));

const TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'schedules', label: 'Schedules', icon: Calendar,
    subTabs: [
      { id: 'master', label: 'Master Calendar', icon: Calendar },
      { id: 'team', label: 'Team Availability', icon: Users },
    ]
  },
  {
    id: 'critical', label: 'Critical Dates', icon: AlertTriangle,
    subTabs: [
      { id: 'deadlines', label: 'Deadlines', icon: Clock },
      { id: 'hearings', label: 'Hearings', icon: Gavel },
      { id: 'sol', label: 'SOL Watch', icon: Layers },
    ]
  },
  {
    id: 'ops', label: 'Operations', icon: Settings,
    subTabs: [
      { id: 'rules', label: 'Rules & Triggers', icon: Settings },
      { id: 'sync', label: 'Integrations', icon: RefreshCw },
    ]
  }
];

export const CalendarView: React.FC = () => {
  const [, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useSessionStorage<string>('calendar_active_tab', 'master');

  const setActiveTab = (tab: string) => {
    startTransition(() => {
      _setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'master': return <CalendarMaster />;
      case 'deadlines': return <CalendarDeadlines />;
      case 'team': return <CalendarTeam />;
      case 'hearings': return <CalendarHearings />;
      case 'sol': return <CalendarSOL />;
      case 'rules': return <CalendarRules />;
      case 'sync': return <CalendarSync />;
      default: return <CalendarMaster />;
    }
  };

  return (
    <TabbedPageLayout
      pageTitle="Master Calendar"
      pageSubtitle="Deadlines, Court Filings, and Compliance Schedules."
      pageActions={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Sync to Outlook</Button>
          <Button variant="primary" size="sm" icon={Plus}>New Event</Button>
        </div>
      }
      tabConfig={TAB_CONFIG}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
    >
      <Suspense fallback={<LazyLoader message="Loading Calendar Module..." />}>
        <div className={cn(isPending && 'opacity-60 transition-opacity')}>
          {renderContent()}
        </div>
      </Suspense>
    </TabbedPageLayout>
  );
};

export default CalendarView;
