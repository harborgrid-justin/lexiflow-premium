import type { Meta, StoryObj } from '@storybook/react';
import { SearchInputBar } from './SearchInputBar';

const meta: Meta<typeof SearchInputBar> = {
  title: 'Molecules/SearchInputBar',
  component: SearchInputBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchInputBar>;

export const Default: Story = {
  args: {},
};
