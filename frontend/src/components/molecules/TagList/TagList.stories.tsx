import type { Meta, StoryObj } from '@storybook/react';
import { TagList } from './TagList';

const meta: Meta<typeof TagList> = {
  title: 'Molecules/TagList',
  component: TagList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagList>;

export const Default: Story = {
  args: {},
};
