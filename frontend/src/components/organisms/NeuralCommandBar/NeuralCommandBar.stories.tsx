import type { Meta, StoryObj } from '@storybook/react';
import { NeuralCommandBar } from './NeuralCommandBar';

const meta: Meta<typeof NeuralCommandBar> = {
  title: 'Organisms/NeuralCommandBar',
  component: NeuralCommandBar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NeuralCommandBar>;

export const Default: Story = {
  args: {},
};
