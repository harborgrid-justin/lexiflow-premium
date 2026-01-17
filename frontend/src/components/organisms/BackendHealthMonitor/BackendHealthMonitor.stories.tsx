import { BackendHealthMonitor } from './BackendHealthMonitor';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BackendHealthMonitor> = {
  title: 'Components/Organisms/BackendHealthMonitor/BackendHealthMonitor',
  component: BackendHealthMonitor,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof BackendHealthMonitor>;

export const Default: Story = {
  args: {
  "isOpen": true,
  onClose: () => {}
},
};
