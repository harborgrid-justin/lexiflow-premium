import { CalendarGrid } from './CalendarGrid';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarGrid> = {
  title: 'Components/Organisms/CalendarGrid/CalendarGrid',
  component: CalendarGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CalendarGrid>;

export const Default: Story = {
  args: {
    currentDate: new Date('2025-12-27T19:38:29.362Z'),
    renderCell: (date: Date) => <div>{date.toDateString()}</div>,
    onDateClick: (date: Date) => console.log('Date clicked:', date),
  },
};
