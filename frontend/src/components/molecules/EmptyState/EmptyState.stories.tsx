import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {},
};
