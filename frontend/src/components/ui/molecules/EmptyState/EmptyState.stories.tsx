import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Molecules/EmptyState/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
  "icon": {},
  "title": "Sample Text",
  "description": "Sample Text",
  "action": "<div>Sample Content</div>",
  "className": "Sample Text"
},
};
