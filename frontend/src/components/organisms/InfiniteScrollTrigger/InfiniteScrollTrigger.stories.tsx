import type { Meta, StoryObj } from '@storybook/react';
import { InfiniteScrollTrigger } from '@/components';

const meta: Meta<typeof InfiniteScrollTrigger> = {
  title: 'Organisms/InfiniteScrollTrigger',
  component: InfiniteScrollTrigger,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfiniteScrollTrigger>;

export const Default: Story = {
  args: {},
};
