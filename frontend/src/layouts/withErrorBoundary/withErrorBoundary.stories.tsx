import { withErrorBoundary } from './withErrorBoundary';

import type { Meta, StoryObj } from '@storybook/react-vite';

// Create a sample component to demonstrate the HOC
const SampleComponent = () => <div>Sample Component</div>;
const WrappedComponent = withErrorBoundary(SampleComponent, { componentName: 'Sample' });

const meta: Meta<typeof WrappedComponent> = {
  title: 'Components/Layouts/withErrorBoundary/withErrorBoundary',
  component: WrappedComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof WrappedComponent>;

export const Default: Story = {
  args: {},
};
