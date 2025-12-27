import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from '@/components';

const meta: Meta<typeof FilterPanel> = {
  title: 'Organisms/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {
  args: {},
};
