import React, { useState } from 'react';

import { Tabs } from '@/components/molecules/Tabs/Tabs';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Tabs - Segmented variant
 *
 * The default segmented style with pill-like buttons. Best for
 * compact toolbars and view switchers.
 */

const meta: Meta<typeof Tabs> = {
  title: 'Common/Tabs/Segmented',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Segmented tabs with pill-like buttons. Ideal for toolbars and compact spaces.',
      },
    },
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryObj<typeof meta>;

const DefaultComponent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div>
      <Tabs
        tabs={['overview', 'details', 'activity', 'settings']}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="segmented"
      />
      <div className="mt-6 p-4 bg-white rounded-lg shadow max-w-md">
        <p className="text-slate-600">Active: <strong>{activeTab}</strong></p>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultComponent />,
};