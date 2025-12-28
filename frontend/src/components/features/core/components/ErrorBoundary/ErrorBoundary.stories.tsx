import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/Organisms/ErrorBoundary/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "fallback": "<div>Sample Content</div>",
  "onReset": {},
  "scope": "Sample Text"
},
};
