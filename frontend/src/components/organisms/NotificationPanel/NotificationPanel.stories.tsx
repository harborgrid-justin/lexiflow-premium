import type { Meta, StoryObj } from '@storybook/react';
import { NotificationPanel } from './NotificationPanel';

const meta: Meta<typeof NotificationPanel> = {
  title: 'Organisms/NotificationPanel',
  component: NotificationPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationPanel>;

export const Default: Story = {
  args: {},
};
