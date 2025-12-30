import type { Meta, StoryObj } from '@storybook/react';
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger';

const meta: Meta<typeof InfiniteScrollTrigger> = {
  title: 'Components/Organisms/InfiniteScrollTrigger/InfiniteScrollTrigger',
  component: InfiniteScrollTrigger,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof InfiniteScrollTrigger>;

export const Default: Story = {
  args: {
  onLoadMore: () => {},
  "hasMore": true,
  "isLoading": true,
  "className": "Sample Text"
},
};
