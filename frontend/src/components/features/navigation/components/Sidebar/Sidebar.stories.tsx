import type { Meta, StoryObj } from '@storybook/react';
import type { UserId } from '@/types';
import { Sidebar } from './Sidebar';

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
  "setActiveView": () => {},
  "isOpen": true,
  onClose: () => {},
  "currentUser": {
    id: '1' as UserId,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'Associate',
  },
  onSwitchUser: () => {}
},
};
