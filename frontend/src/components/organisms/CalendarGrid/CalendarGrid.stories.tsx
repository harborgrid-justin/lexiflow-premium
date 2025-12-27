import type { Meta, StoryObj } from '@storybook/react';
import { CalendarGrid } from '@/components';

const meta: Meta<typeof CalendarGrid> = {
  title: 'Organisms/CalendarGrid',
  component: CalendarGrid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarGrid>;

export const Default: Story = {
  args: {},
};
