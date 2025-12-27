import type { Meta, StoryObj } from '@storybook/react';
import { CalendarEvent } from '@/components';

const meta: Meta<typeof CalendarEvent> = {
  title: 'Organisms/CalendarEvent',
  component: CalendarEvent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CalendarEvent>;

export const Default: Story = {
  args: {},
};
