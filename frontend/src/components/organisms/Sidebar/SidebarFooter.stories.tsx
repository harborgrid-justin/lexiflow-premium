import type { UserId } from '@/types';
import type { Meta, StoryObj } from '@storybook/react';
import { SidebarFooter } from './SidebarFooter';

const meta: Meta<typeof SidebarFooter> = {
  title: 'Components/Organisms/Sidebar/SidebarFooter',
  component: SidebarFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarFooter>;

export const Default: Story = {
  args: {
    "currentUser": {
      id: '1' as UserId,
      email: 'user@example.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Associate',
    },
    onSwitchUser: () => { },
    "onNavigate": () => { },
    "activeView": "Sample Text"
  },
};
