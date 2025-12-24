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
    label: {
      control: 'text',
      description: 'Statistic label',
    },
    value: {
      control: 'text',
      description: 'Statistic value',
    },
    change: {
      control: 'text',
      description: 'Change indicator text',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction',
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
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stats
        icon={Briefcase}
        label="Active Cases"
        value="24"
        change="+12%"
        trend="up"
      />
      <Stats
        icon={FileText}
        label="Documents"
        value="1,234"
        change="+5%"
        trend="up"
      />
      <Stats
        icon={Users}
        label="Team Members"
        value="12"
        change="-2%"
        trend="down"
      />
      <Stats
        icon={DollarSign}
        label="Revenue"
        value="$45.2K"
        change="+18%"
        trend="up"
      />
    </div>
  ),
};

export const Single: Story = {
  args: {
    icon: Briefcase,
    label: 'Active Cases',
    value: '24',
    change: '+12%',
    trend: 'up',
  },
};
