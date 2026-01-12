import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConnectionStatus } from './ConnectionStatus';

const meta: Meta<typeof ConnectionStatus> = {
  title: 'Components/Organisms/ConnectionStatus/ConnectionStatus',
  component: ConnectionStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionStatus>;

export const Default: Story = {
  args: {
  "className": "Sample Text"
},
};
