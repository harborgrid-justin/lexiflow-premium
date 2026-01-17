import { Box } from './Box';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Box> = {
  title: 'Components/Atoms/Box/Box',
  component: Box,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {},
};
