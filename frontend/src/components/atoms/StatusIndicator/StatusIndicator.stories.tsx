import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from '@/components';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Atoms/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

export const Default: Story = {
  args: {},
};
