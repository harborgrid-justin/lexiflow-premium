import { VirtualGrid } from './VirtualGrid';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
