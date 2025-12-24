import type { Meta, StoryObj } from '@storybook/react';
import { NotificationCenter } from './NotificationCenter';

const meta: Meta<typeof NotificationCenter> = {
  title: 'Organisms/NotificationCenter',
  component: NotificationCenter,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

export const Default: Story = {
  args: {},
};
