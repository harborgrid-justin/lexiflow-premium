import { LoadingState } from './LoadingState';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LoadingState> = {
  title: 'Components/Molecules/LoadingState/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {
  args: {
  "message": "Sample Text",
  size: undefined,
  "centered": true,
  "className": "Sample Text"
},
};
