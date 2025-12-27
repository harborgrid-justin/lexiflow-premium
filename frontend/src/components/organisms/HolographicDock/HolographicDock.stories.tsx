import type { Meta, StoryObj } from '@storybook/react';
import { HolographicDock } from '@/components';

const meta: Meta<typeof HolographicDock> = {
  title: 'Organisms/HolographicDock',
  component: HolographicDock,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HolographicDock>;

export const Default: Story = {
  args: {},
};
