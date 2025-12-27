import type { Meta, StoryObj } from '@storybook/react';
import { ConnectionStatus } from '@/components';

const meta: Meta<typeof ConnectionStatus> = {
  title: 'Organisms/ConnectionStatus',
  component: ConnectionStatus,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConnectionStatus>;

export const Default: Story = {
  args: {},
};
