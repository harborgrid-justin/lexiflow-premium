import { Drawer } from './Drawer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Molecules/Drawer/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
  "isOpen": true,
  onClose: () => {},
  title: undefined,
  children: undefined,
  "width": "Sample Text"
},
};
