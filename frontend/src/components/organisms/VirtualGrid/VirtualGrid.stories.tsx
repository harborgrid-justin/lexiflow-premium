import type { Meta, StoryObj } from '@storybook/react';
import { VirtualGrid } from '@/components';

const meta: Meta<typeof VirtualGrid> = {
  title: 'Organisms/VirtualGrid',
  component: VirtualGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualGrid>;

export const Default: Story = {
  args: {},
};
