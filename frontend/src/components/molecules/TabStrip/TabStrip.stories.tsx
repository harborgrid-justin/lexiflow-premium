import type { Meta, StoryObj } from '@storybook/react';
import { TabStrip } from './TabStrip';

const meta: Meta<typeof TabStrip> = {
  title: 'Molecules/TabStrip',
  component: TabStrip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TabStrip>;

export const Default: Story = {
  args: {},
};
