import type { Meta, StoryObj } from '@storybook/react';
import { AsyncBoundary } from './AsyncBoundary';

const meta: Meta<typeof AsyncBoundary> = {
  title: 'Components/Layouts/AsyncBoundary/AsyncBoundary',
  component: AsyncBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AsyncBoundary>;

export const Default: Story = {
  args: {
  "children": "<div>Sample Content</div>",
  "loadingMessage": "Sample Text",
  "loadingFallback": "<div>Sample Content</div>",
  "scope": "Sample Text",
  "enableRetry": true,
  "maxRetries": 42,
  "timeout": 42,
  "onLoad": {},
  "onError": {}
},
};
