import { NeuralCommandBar } from './NeuralCommandBar';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
