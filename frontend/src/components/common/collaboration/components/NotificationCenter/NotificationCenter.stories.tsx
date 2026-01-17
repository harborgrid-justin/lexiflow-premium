import { NotificationCenter } from './NotificationCenter';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
