import type { Meta, StoryObj } from '@storybook/react';
import { TagList } from './TagList';

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
  "tags": "Sample Text",
  "limit": 42
},
};
