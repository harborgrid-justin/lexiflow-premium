import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { Button } from '@/components/ui/atoms/Button/Button';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, BarChart3, Briefcase, Clock, DollarSign, Eye, Lightbulb, Plus, Settings, TrendingUp } from 'lucide-react';
import React, { Suspense, useState } from 'react';

// Import actual Case Management components
import { NewCaseIntakeForm } from '@/features/cases/components/intake/NewCaseIntakeForm';
import { CaseAnalyticsDashboard, CaseFinancialsCenter, CaseInsightsDashboard, CaseOperationsCenter, CaseOverviewDashboard } from '@features/cases';
import { CaseCalendar } from '@features/cases/components/calendar/CaseCalendar';

/**
 * TabbedPageLayout with Actions - Matter Management pattern
 *
 * Demonstrates hybrid navigation: standard two-level tabs PLUS
 * quick-access action buttons for frequent operations.
 */

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Layout/TabbedPageLayout/Examples/Matter Management',
  component: TabbedPageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Two-level tabs enhanced with quick-access action buttons.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen bg-slate-100">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'matters_group',
        label: 'Matters',
        icon: Briefcase,
        subTabs: [
          { id: 'overview', label: 'Overview Dashboard', icon: Eye },
          { id: 'operations', label: 'Operations Center', icon: Activity },
          { id: 'intake', label: 'New Matter Intake', icon: Plus },
        ],
      },
      {
        id: 'planning_group',
        label: 'Planning',
        icon: Settings,
        subTabs: [
          { id: 'calendar', label: 'Matter Calendar', icon: Clock },
          { id: 'financials', label: 'Financials', icon: DollarSign },
          { id: 'insights', label: 'Insights & Risk', icon: Lightbulb },
        ],
      },
      {
        id: 'analytics_group',
        label: 'Analytics',
        icon: BarChart3,
        subTabs: [
          { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
        ],
      },
    ];

    // Render the appropriate component based on active tab
    const renderContent = () => {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center h-96">
            <div className="text-slate-500">Loading...</div>
          </div>
        }>
          {activeTab === 'overview' && <CaseOverviewDashboard />}
          {activeTab === 'operations' && <CaseOperationsCenter />}
          {activeTab === 'intake' && <NewCaseIntakeForm />}
          {activeTab === 'calendar' && <CaseCalendar />}
          {activeTab === 'financials' && <CaseFinancialsCenter />}
          {activeTab === 'insights' && <CaseInsightsDashboard />}
          {activeTab === 'analytics' && <CaseAnalyticsDashboard />}
        </Suspense>
      );
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
            <Button variant="primary" icon={Plus} onClick={() => setActiveTab('intake')}>
              New Matter
            </Button>
          </div>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        {renderContent()}
      </TabbedPageLayout>
    );
  },
};
