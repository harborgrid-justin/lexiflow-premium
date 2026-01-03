import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabbedPageLayout, TabConfigItem } from '@/components/layouts';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import React, { useState } from 'react';
import { UserCircle, Shield, Settings, Sliders, Activity } from 'lucide-react';

/**
 * TabbedPageLayout - User Profile pattern
 * 
 * Two-level navigation for settings and profile pages.
 * Parent tabs organize major sections, sub-tabs provide detailed navigation.
 */

const meta: Meta<typeof TabbedPageLayout> = {
  title: 'Layout/TabbedPageLayout/Examples/User Profile',
  component: TabbedPageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Two-level tabbed layout for user profile and settings pages.',
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
    const [activeTab, setActiveTab] = useState('overview');

    const tabConfig: TabConfigItem[] = [
      {
        id: 'general',
        label: 'General',
        icon: UserCircle,
        subTabs: [
          { id: 'overview', label: 'Overview', icon: UserCircle },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
        ],
      },
      {
        id: 'security',
        label: 'Security & Access',
        icon: Shield,
        subTabs: [
          { id: 'access', label: 'Access Matrix', icon: Settings },
          { id: 'security', label: 'Security & Sessions', icon: Shield },
          { id: 'audit', label: 'Audit Log', icon: Activity },
        ],
      },
    ];

    return (
      <TabbedPageLayout
        pageTitle="User Profile"
        pageSubtitle="Manage identity, granular permissions, and workspace preferences."
        tabConfig={tabConfig}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content
          </h3>
          <p className="text-slate-600">
            Content for the <strong>{activeTab}</strong> tab would be rendered here.
          </p>
        </div>
      </TabbedPageLayout>
    );
  },
};
