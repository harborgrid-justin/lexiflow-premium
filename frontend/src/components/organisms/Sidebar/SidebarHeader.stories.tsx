import { SidebarHeader } from './SidebarHeader';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof SidebarHeader> = {
  title: 'Components/Organisms/Sidebar/SidebarHeader',
  component: SidebarHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarHeader>;

export const Default: Story = {
  args: {
  onClose: () => {}
},
};
