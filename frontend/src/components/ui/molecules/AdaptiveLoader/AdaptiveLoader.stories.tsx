import type { Meta, StoryObj } from '@storybook/react';
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
  "Alternative": {},
  "shimmer": true,
  "message": "Sample Text",
  "staleContent": "<div>Sample Content</div>",
  "showStale": true,
  "itemCount": 42,
  "className": "Sample Text"
},
};
