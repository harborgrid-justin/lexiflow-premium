import { ProgressIndicator } from './ProgressIndicator';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ProgressIndicator> = {
  title: 'Components/Atoms/ProgressIndicator/ProgressIndicator',
  component: ProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ProgressIndicator>;

export const Default: Story = {
  args: {
  "progress": 42,
  status: undefined,
  "showPercentage": true,
  "showETA": true,
  "startTime": 42,
  "estimatedDuration": 42,
  "steps": [],
  "canCancel": true,
  onCancel: () => {},
  "error": "Sample Text",
  "successMessage": "Sample Text",
  "label": "Sample Text",
  size: undefined,
  variant: undefined
},
};
