import { ErrorState } from './ErrorState';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/Molecules/ErrorState/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
  "title": "Sample Text",
  "message": "Sample Text",
  onRetry: () => {},
  "retryText": "Sample Text",
  "className": "Sample Text",
  "centered": true
},
};
