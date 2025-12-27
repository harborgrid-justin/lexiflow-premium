import type { Meta, StoryObj } from '@storybook/react';
import { Primitives } from './Primitives';

const meta: Meta<typeof Primitives> = {
  title: 'Components/Organisms/_legacy/Primitives',
  component: Primitives,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Primitives>;

export const Default: Story = {
  args: {},
};
