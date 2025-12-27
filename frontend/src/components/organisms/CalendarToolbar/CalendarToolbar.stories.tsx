import type { Meta, StoryObj } from '@storybook/react';
import { CalendarToolbar } from './CalendarToolbar';

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
  "label": "Sample Text",
  "onPrev": {},
  "onNext": {},
  "onToday": {},
  "view": {},
  "onViewChange": {},
  "actions": "<div>Sample Content</div>"
},
};
