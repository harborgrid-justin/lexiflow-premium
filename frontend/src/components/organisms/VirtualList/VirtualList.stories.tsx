import { VirtualList } from './VirtualList';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof VirtualList> = {
  title: 'Components/Organisms/VirtualList/VirtualList',
  component: VirtualList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof VirtualList>;

export const Default: Story = {
  args: {},
};
