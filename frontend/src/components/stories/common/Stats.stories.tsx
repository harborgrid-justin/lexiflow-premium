import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stats } from '@/components/molecules/Stats';
import { ThemeProvider } from '@/providers/ThemeContext';
import { Briefcase, FileText, Users, DollarSign } from 'lucide-react';
import React from 'react';

/**
 * Stats component for displaying key metrics.
 */

const meta: Meta<typeof Stats> = {
  title: 'Common/Stats',
  component: Stats,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Statistics display component for key metrics and KPIs.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of stat items with label, value, icon, color, and bg',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-50 dark:bg-slate-800">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Grid: Story = {
  render: () => {
    const statItems = [
      {
        icon: Briefcase,
        label: 'Active Cases',
        value: '24',
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
      },
      {
        icon: FileText,
        label: 'Documents',
        value: '1,234',
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/20',
      },
      {
        icon: Users,
        label: 'Team Members',
        value: '12',
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/20',
      },
      {
        icon: DollarSign,
        label: 'Revenue',
        value: '$45.2K',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/20',
      },
    ];

    return <Stats items={statItems} />;
  },
};

export const Single: Story = {
  args: {
    items: [
      {
        icon: Briefcase,
        label: 'Active Cases',
        value: '24',
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/20',
      },
    ],
  },
};
