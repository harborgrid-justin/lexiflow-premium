import type { Meta, StoryObj } from '@storybook/react';
import { NeuralCommandBar } from './NeuralCommandBar';

const meta: Meta<typeof NeuralCommandBar> = {
  title: 'Components/Organisms/NeuralCommandBar/NeuralCommandBar',
  component: NeuralCommandBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof NeuralCommandBar>;

export const Default: Story = {
  args: {
  "globalSearch": "Sample Text",
  "setGlobalSearch": () => {},
  onGlobalSearch: () => {},
  onSearchResultClick: () => {},
  onNeuralCommand: () => {}
},
};
