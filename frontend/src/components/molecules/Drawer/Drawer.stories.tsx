import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';

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
  "onClose": {},
  "title": "<div>Sample Content</div>",
  "children": "<div>Sample Content</div>",
  "width": "Sample Text"
},
};
