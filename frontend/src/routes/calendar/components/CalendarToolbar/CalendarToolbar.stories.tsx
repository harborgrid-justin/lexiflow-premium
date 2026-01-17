import { CalendarToolbar } from './CalendarToolbar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarToolbar> = {
  title: 'Components/Organisms/CalendarToolbar/CalendarToolbar',
  component: CalendarToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CalendarToolbar>;

export const Default: Story = {
  args: {
    label: "December 2025",
    onPrev: () => console.log('Previous'),
    onNext: () => console.log('Next'),
    onToday: () => console.log('Today'),
    view: 'month',
    onViewChange: (view: 'month' | 'list') => console.log('View changed:', view),
  },
};
