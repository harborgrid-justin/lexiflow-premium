import type { Meta, StoryObj } from '@storybook/react';
import { SwipeableItem } from './SwipeableItem';

const meta: Meta<typeof SwipeableItem> = {
  title: 'Organisms/SwipeableItem',
  component: SwipeableItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SwipeableItem>;

export const Default: Story = {
  args: {},
};
