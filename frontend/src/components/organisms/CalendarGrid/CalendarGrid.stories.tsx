import type { Meta, StoryObj } from '@storybook/react';
import { CalendarGrid } from './CalendarGrid';

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
  "currentDate": "2025-12-27T19:38:29.362Z",
  "renderCell": "<div>Sample Content</div>",
  "onDateClick": "2025-12-27T19:38:29.366Z"
},
};
