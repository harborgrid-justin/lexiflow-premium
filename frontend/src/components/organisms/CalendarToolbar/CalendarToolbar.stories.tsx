import type { Meta, StoryObj } from '@storybook/react';
import { CalendarToolbar } from '@/components';

const meta: Meta<typeof CalendarToolbar> = {
  title: 'Organisms/CalendarToolbar',
  component: CalendarToolbar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarToolbar>;

export const Default: Story = {
  args: {},
};
