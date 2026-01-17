import { TagList } from './TagList';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TagList> = {
  title: 'Components/Molecules/TagList/TagList',
  component: TagList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  args: {
  "tags": [],
  "limit": 42
},
};
