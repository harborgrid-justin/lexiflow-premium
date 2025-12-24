import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '../../../../frontend/components/common/Tabs';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import React, { useState } from 'react';
import { FileText, Users, Settings } from 'lucide-react';

/**
 * Tabs - Underline variant
 * 
 * Border-bottom indicator style. Best for full-width page sections
 * and content areas that need clear separation.
 */

const meta: Meta<typeof Tabs> = {
  title: 'Common/Tabs/Underline',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Underline tabs with border-bottom indicators. Best for page sections.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="min-h-[400px] bg-slate-50 p-8">
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
      <div className="w-full max-w-2xl">
        <Tabs
          tabs={[
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h3>
          <p className="text-slate-600">Tab content goes here</p>
        </div>
      </div>
    );
  },
};
