import { CalendarPage } from './CalendarPage';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarPage> = {
  title: 'Components/Pages/collaboration/CalendarPage',
  component: CalendarPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof CalendarPage>;

export const Default: Story = {
  args: {
  "caseId": "Sample Text"
},
};
