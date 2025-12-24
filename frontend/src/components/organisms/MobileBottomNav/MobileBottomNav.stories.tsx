import type { Meta, StoryObj } from '@storybook/react';
import { MobileBottomNav } from './MobileBottomNav';

const meta: Meta<typeof MobileBottomNav> = {
  title: 'Organisms/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MobileBottomNav>;

export const Default: Story = {
  args: {},
};
