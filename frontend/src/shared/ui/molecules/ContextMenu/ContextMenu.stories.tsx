import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Components/Molecules/ContextMenu/ContextMenu',
  component: ContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  args: {
  "x": 42,
  "y": 42,
  "items": [],
  onClose: () => {}
},
};
