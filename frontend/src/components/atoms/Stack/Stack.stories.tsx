import { Stack } from './Stack';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Stack> = {
  title: 'Components/Atoms/Stack/Stack',
  component: Stack,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {},
};
