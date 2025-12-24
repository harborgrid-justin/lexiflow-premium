import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiskMeter } from '../../components/common/RiskMeter';
import { ThemeProvider } from '../../context/ThemeContext';
import React from 'react';

/**
 * RiskMeter component for displaying risk levels.
 */

const meta: Meta<typeof RiskMeter> = {
  title: 'Common/RiskMeter',
  component: RiskMeter,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visual risk level indicator with color-coded display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['low', 'medium', 'high', 'critical'],
      description: 'Risk level',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Low: Story = {
  args: {
    level: 'low',
    label: 'Low Risk',
  },
};

export const Medium: Story = {
  args: {
    level: 'medium',
    label: 'Medium Risk',
  },
};

export const High: Story = {
  args: {
    level: 'high',
    label: 'High Risk',
  },
};

export const Critical: Story = {
  args: {
    level: 'critical',
    label: 'Critical Risk',
  },
};
