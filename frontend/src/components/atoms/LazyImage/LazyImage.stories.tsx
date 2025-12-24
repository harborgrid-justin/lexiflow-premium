import type { Meta, StoryObj } from '@storybook/react';
import { LazyImage } from './LazyImage';

const meta: Meta<typeof LazyImage> = {
  title: 'Atoms/LazyImage',
  component: LazyImage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LazyImage>;

export const Default: Story = {
  args: {},
};
