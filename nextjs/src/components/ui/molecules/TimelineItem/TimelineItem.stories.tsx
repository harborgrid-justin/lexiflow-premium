import type { Meta, StoryObj } from '@storybook/react';
import { TimelineItem } from './TimelineItem';

const meta: Meta<typeof TimelineItem> = {
  title: 'Components/Molecules/TimelineItem/TimelineItem',
  component: TimelineItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TimelineItem>;

export const Default: Story = {
  args: {
  "date": "Sample Text",
  "title": "Sample Text",
  "description": "Sample Text",
  icon: undefined,
  "colorClass": "Sample Text",
  onClick: () => {},
  "isLast": true
},
};
