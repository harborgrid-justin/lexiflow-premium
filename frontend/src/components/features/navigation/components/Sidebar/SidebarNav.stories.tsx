import type { Meta, StoryObj } from '@storybook/react';
import { SidebarNav } from './SidebarNav';

const meta: Meta<typeof SidebarNav> = {
  title: 'Components/Organisms/Sidebar/SidebarNav',
  component: SidebarNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNav>;

export const Default: Story = {
  args: {
  "activeView": "Sample Text",
  "setActiveView": "Sample Text",
  "currentUserRole": "Sample Text"
},
};
