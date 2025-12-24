import type { Meta, StoryObj } from '@storybook/react';
import { TabsV2 } from './TabsV2';

const meta: Meta<typeof TabsV2> = {
  title: 'Molecules/TabsV2',
  component: TabsV2,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabsV2>;

export const Default: Story = {
  args: {},
};
