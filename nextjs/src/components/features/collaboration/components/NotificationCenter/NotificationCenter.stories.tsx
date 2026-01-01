import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from './NotificationCenter';

const meta: Meta<typeof NotificationCenter> = {
  title: 'Components/Organisms/NotificationCenter/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {
  args: {},
};
