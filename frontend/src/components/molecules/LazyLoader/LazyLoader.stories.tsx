import type { Meta, StoryObj } from '@storybook/react';
import { LazyLoader } from './LazyLoader';

const meta: Meta<typeof LazyLoader> = {
  title: 'Molecules/LazyLoader',
  component: LazyLoader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LazyLoader>;

export const Default: Story = {
  args: {},
};
