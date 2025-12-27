import type { Meta, StoryObj } from '@storybook/react';
import { TabNavigation } from '@/components';

const meta: Meta<typeof TabNavigation> = {
  title: 'Organisms/TabNavigation',
  component: TabNavigation,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabNavigation>;

export const Default: Story = {
  args: {},
};
