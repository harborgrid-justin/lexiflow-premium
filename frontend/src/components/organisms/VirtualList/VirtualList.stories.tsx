import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from '@/components';

const meta: Meta<typeof VirtualList> = {
  title: 'Organisms/VirtualList',
  component: VirtualList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VirtualList>;

export const Default: Story = {
  args: {},
};
