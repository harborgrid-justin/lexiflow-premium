import type { Meta, StoryObj } from '@storybook/react';
import { HighlightedText } from './HighlightedText';

const meta: Meta<typeof HighlightedText> = {
  title: 'Components/Atoms/HighlightedText/HighlightedText',
  component: HighlightedText,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof HighlightedText>;

export const Default: Story = {
  args: {
  "text": "Sample Text",
  "query": "Sample Text",
  "className": "Sample Text",
  "highlightClassName": "Sample Text"
},
};
