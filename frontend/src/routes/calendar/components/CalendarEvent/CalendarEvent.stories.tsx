import { CalendarEvent } from './CalendarEvent';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarEvent> = {
  title: 'Components/Organisms/CalendarEvent/CalendarEvent',
  component: CalendarEvent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CalendarEvent>;

export const Default: Story = {
  args: {
    title: "Sample Text",
    time: "Sample Text",
    variant: "default" as const,
    onClick: () => {},
    icon: undefined,
    isCompact: false
  },
};
