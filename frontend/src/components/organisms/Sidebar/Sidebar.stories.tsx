import { Sidebar } from './Sidebar';

import type { UserId } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Organisms/Sidebar/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    "activeView": "dashboard",
    "setActiveView": () => { },
    "isOpen": true,
    onClose: () => { },
    "currentUser": {
      id: '1' as UserId,
      email: 'user@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Associate',
    },
    onSwitchUser: () => { }
  },
};
