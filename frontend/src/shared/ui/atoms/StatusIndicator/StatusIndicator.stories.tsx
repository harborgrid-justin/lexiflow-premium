import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusIndicator } from './StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Components/Atoms/StatusIndicator/StatusIndicator',
  component: StatusIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

export const Default: Story = {
  args: {
  type: undefined,
  "label": "Sample Text",
  "className": "Sample Text",
  size: undefined,
  "pulse": true
},
};
