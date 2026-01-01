import type { Meta, StoryObj } from '@storybook/react';
import { VirtualGrid } from './VirtualGrid';

const meta: Meta<typeof VirtualGrid> = {
  title: 'Components/Organisms/VirtualGrid/VirtualGrid',
  component: VirtualGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof VirtualGrid>;

export const Default: Story = {
  args: {},
};
