import type { Meta, StoryObj } from '@storybook/react-vite';
import { AdaptiveLoader } from './AdaptiveLoader';

const meta: Meta<typeof AdaptiveLoader> = {
  title: 'Components/Molecules/AdaptiveLoader/AdaptiveLoader',
  component: AdaptiveLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof AdaptiveLoader>;

export const Default: Story = {
  args: {
  "structure": [],
  "shimmer": true,
  "message": "Sample Text",
  staleContent: undefined,
  "showStale": true,
  "itemCount": 42,
  "className": "Sample Text"
},
};
