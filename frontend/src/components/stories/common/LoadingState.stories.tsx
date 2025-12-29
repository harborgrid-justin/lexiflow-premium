import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingState } from '@/components/molecules';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from "react";

/**
 * LoadingState component displays loading indicators.
 */

const meta: Meta<typeof LoadingState> = {
  title: 'Common/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading state indicator for async operations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'Loading message text',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 min-h-[300px] flex items-center justify-center">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Loading...',
  },
};

export const WithCustomMessage: Story = {
  args: {
    message: 'Fetching case documents...',
  },
};
