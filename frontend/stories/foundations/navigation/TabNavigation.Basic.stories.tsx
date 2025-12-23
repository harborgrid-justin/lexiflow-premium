import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabNavigation } from '../components/common/TabNavigation';
import { ThemeProvider } from '../context/ThemeContext';
import React, { useState } from 'react';
import { FileText, Users, Calendar, BarChart3 } from 'lucide-react';

/**
 * TabNavigation - Basic single-level navigation
 * 
 * The simplest tab pattern with icons. Use this for straightforward navigation
 * within a single context or page section.
 */

const meta: Meta<typeof TabNavigation> = {
  title: 'Common/TabNavigation/Basic',
  component: TabNavigation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Single-level tab navigation with icon support. The foundation for all tab patterns.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="min-h-[300px] bg-slate-50 p-6">
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
    const [activeTab, setActiveTab] = useState('documents');
    return (
      <div>
        <TabNavigation
          tabs={[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p className="text-slate-600">Active tab: <strong>{activeTab}</strong></p>
        </div>
      </div>
    );
  },
};
