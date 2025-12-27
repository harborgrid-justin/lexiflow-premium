import type { Meta, StoryObj } from '@storybook/react';
import { NotificationPanel } from './NotificationPanel';

const meta: Meta<typeof NotificationPanel> = {
  title: 'Components/Organisms/NotificationPanel/NotificationPanel',
  component: NotificationPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NotificationPanel>;

export const Default: Story = {
  args: {},
};
