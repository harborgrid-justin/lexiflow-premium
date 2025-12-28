import type { Meta, StoryObj } from '@storybook/react';
import { ProgressIndicator } from './ProgressIndicator';

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
  "status": {},
  "showPercentage": true,
  "showETA": true,
  "startTime": 42,
  "estimatedDuration": 42,
  "steps": [],
  "canCancel": true,
  "onCancel": {},
  "error": "Sample Text",
  "successMessage": "Sample Text",
  "label": "Sample Text",
  "size": {},
  "variant": {}
},
};
