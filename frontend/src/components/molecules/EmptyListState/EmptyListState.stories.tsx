import type { Meta, StoryObj } from '@storybook/react';
import { EmptyListState } from './EmptyListState';

const meta: Meta<typeof EmptyListState> = {
  title: 'Molecules/EmptyListState',
  component: EmptyListState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyListState>;

export const Default: Story = {
  args: {},
};
