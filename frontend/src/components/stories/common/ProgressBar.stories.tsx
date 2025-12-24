import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from 'react';

/**
 * ProgressBar component for displaying progress indicators.
 */

const meta: Meta<typeof ProgressBar> = {
  title: 'Common/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress bar for visualizing completion status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Current progress value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 w-[400px]">
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
    value: 25,
    max: 100,
  },
};

export const Medium: Story = {
  args: {
    value: 50,
    max: 100,
  },
};

export const High: Story = {
  args: {
    value: 75,
    max: 100,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    max: 100,
  },
};
