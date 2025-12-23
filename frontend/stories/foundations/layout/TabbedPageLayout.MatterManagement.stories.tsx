import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabbedPageLayout, TabConfigItem } from '../components/layout/TabbedPageLayout';
import { Button } from '../components/common/Button';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState } from 'react';
import { Briefcase, Folder, Activity, Plus, Settings, Clock, DollarSign, Users, BarChart3, TrendingUp } from 'lucide-react';

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
        <div className="h-screen bg-slate-100">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('all');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'matters_group',
        label: 'Matters',
        icon: Briefcase,
        subTabs: [
          { id: 'all', label: 'All Matters', icon: Folder },
          { id: 'active', label: 'Active', icon: Activity },
          { id: 'intake', label: 'Intake Pipeline', icon: Plus },
        ],
      },
      {
        id: 'ops_group',
        label: 'Operations',
        icon: Settings,
        subTabs: [
          { id: 'calendar', label: 'Matter Calendar', icon: Clock },
          { id: 'financials', label: 'Financials', icon: DollarSign },
          { id: 'team', label: 'Team Assignment', icon: Users },
        ],
      },
      {
        id: 'insights_group',
        label: 'Insights',
        icon: BarChart3,
        subTabs: [
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        ],
      },
    ];

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
            <Button variant="primary" icon={Plus} onClick={() => alert('Navigate to New Matter form')}>
              New Matter
            </Button>
          </div>
        }
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {activeTab === 'all' && 'All Matters'}
              {activeTab === 'active' && 'Active Matters'}
              {activeTab === 'intake' && 'Intake Pipeline'}
              {activeTab === 'calendar' && 'Matter Calendar'}
              {activeTab === 'financials' && 'Financial Overview'}
              {activeTab === 'team' && 'Team Assignment'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
            </h3>
            <p className="text-slate-600">
              Notice how the action buttons (Calendar, Analytics, New Matter) provide quick access to key features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-slate-800">{i * 42}</div>
                <div className="text-sm text-slate-600">Sample Metric {i}</div>
              </div>
            ))}
          </div>
        </div>
      </TabbedPageLayout>
    );
  },
};
