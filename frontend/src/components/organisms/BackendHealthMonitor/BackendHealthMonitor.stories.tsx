import type { Meta, StoryObj } from '@storybook/react';
import { BackendHealthMonitor } from '@/components';

const meta: Meta<typeof BackendHealthMonitor> = {
  title: 'Organisms/BackendHealthMonitor',
  component: BackendHealthMonitor,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackendHealthMonitor>;

export const Default: Story = {
  args: {},
};
