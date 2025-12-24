import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from './Drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Molecules/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {},
};
