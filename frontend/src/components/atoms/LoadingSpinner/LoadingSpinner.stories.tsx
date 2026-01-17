import { LoadingSpinner } from './LoadingSpinner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/Atoms/LoadingSpinner/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
  args: {
  "text": "Sample Text",
  "className": "Sample Text"
},
};
