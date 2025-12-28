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
  "currentUser": {},
  "onSwitchUser": {},
  "onNavigate": "Sample Text",
  "activeView": "Sample Text"
},
};
