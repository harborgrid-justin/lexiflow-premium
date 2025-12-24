import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Molecules/TagInput',
  component: TagInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  args: {},
};
