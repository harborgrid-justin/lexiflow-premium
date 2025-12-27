import type { Meta, StoryObj } from '@storybook/react';
import { TimelineItem } from '@/components';

const meta: Meta<typeof TimelineItem> = {
  title: 'Molecules/TimelineItem',
  component: TimelineItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimelineItem>;

export const Default: Story = {
  args: {},
};
