import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingState } from '@/components/molecules/LoadingState/LoadingState';

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
  }
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
