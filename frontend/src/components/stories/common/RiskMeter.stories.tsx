import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiskMeter } from '@/components/organisms';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from "react";

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
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Risk/strength value (0-100)',
    },
    label: {
      control: 'text',
      description: 'Label text',
    },
    type: {
      control: 'select',
      options: ['strength', 'risk'],
      description: 'Meter type (affects color interpretation)',
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

export const LowRisk: Story = {
  args: {
    value: 25,
    label: 'Low Risk',
    type: 'risk',
  },
};

export const MediumRisk: Story = {
  args: {
    value: 55,
    label: 'Medium Risk',
    type: 'risk',
  },
};

export const HighRisk: Story = {
  args: {
    value: 85,
    label: 'High Risk',
    type: 'risk',
  },
};

export const StrengthMeter: Story = {
  args: {
    value: 75,
    label: 'Password Strength',
    type: 'strength',
  },
};
