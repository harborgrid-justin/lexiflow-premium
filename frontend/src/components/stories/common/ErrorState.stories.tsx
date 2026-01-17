import { ErrorState } from '@/components/molecules/ErrorState/ErrorState';

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * ErrorState component displays error messages with retry actions.
 */

const meta: Meta<typeof ErrorState> = {
  title: 'Common/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Error state component for displaying error messages and recovery actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Error title',
    },
    message: {
      control: 'text',
      description: 'Error message details',
    },
    onRetry: {
      action: 'retry',
      description: 'Callback for retry action',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

export const WithRetry: Story = {
  args: {
    title: 'Failed to load data',
    message: 'Unable to fetch case information.',
    onRetry: () => alert('Retry clicked'),
  },
};
