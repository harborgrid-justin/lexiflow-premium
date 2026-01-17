import { LazyLoader } from './LazyLoader';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof LazyLoader> = {
  title: 'Components/Molecules/LazyLoader/LazyLoader',
  component: LazyLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LazyLoader>;

export const Default: Story = {
  args: {
  "message": "Sample Text"
},
};
