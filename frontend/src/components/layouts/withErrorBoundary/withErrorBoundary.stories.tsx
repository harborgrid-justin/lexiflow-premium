import type { Meta, StoryObj } from '@storybook/react';
import { withErrorBoundary } from './withErrorBoundary';

const meta: Meta<typeof withErrorBoundary> = {
  title: 'Components/Layouts/withErrorBoundary/withErrorBoundary',
  component: withErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof withErrorBoundary>;

export const Default: Story = {
  args: {},
};
