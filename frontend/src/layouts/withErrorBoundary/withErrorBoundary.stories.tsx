import type { Meta, StoryObj } from '@storybook/react-vite';
import { withErrorBoundary } from './withErrorBoundary';

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
