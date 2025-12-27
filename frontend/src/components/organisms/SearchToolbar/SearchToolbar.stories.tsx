import type { Meta, StoryObj } from '@storybook/react';
import { SearchToolbar } from '@/components';

const meta: Meta<typeof SearchToolbar> = {
  title: 'Organisms/SearchToolbar',
  component: SearchToolbar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchToolbar>;

export const Default: Story = {
  args: {},
};
