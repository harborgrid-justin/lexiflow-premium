import { ErrorBoundary } from './ErrorBoundary';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  children: undefined,
  fallback: undefined,
  onReset: () => {},
  "scope": "Sample Text"
},
};
