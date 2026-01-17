import { ProgressIndicator } from '@/components/atoms/ProgressIndicator/ProgressIndicator';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * ProgressIndicator component for task progress tracking.
 */

const meta: Meta<typeof ProgressIndicator> = {
  title: 'Common/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Visual indicator for tracking task completion progress.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Progress percentage',
    },
    label: {
      control: 'text',
      description: 'Status label text',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Starting: Story = {
  args: {
    progress: 10,
    label: 'Starting upload...',
  },
};

export const InProgress: Story = {
  args: {
    progress: 45,
    label: 'Processing documents...',
  },
};

export const AlmostDone: Story = {
  args: {
    progress: 85,
    label: 'Finalizing...',
  },
};

export const Complete: Story = {
  args: {
    progress: 100,
    label: 'Complete!',
  },
};
