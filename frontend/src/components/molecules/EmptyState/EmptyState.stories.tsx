import { EmptyState } from './EmptyState';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  icon: undefined,
  "title": "Sample Text",
  "description": "Sample Text",
  action: undefined,
  "className": "Sample Text"
},
};
