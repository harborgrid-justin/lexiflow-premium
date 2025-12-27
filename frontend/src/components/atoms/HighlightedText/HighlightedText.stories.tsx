import type { Meta, StoryObj } from '@storybook/react';
import { HighlightedText } from '@/components';

const meta: Meta<typeof HighlightedText> = {
  title: 'Atoms/HighlightedText',
  component: HighlightedText,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HighlightedText>;

export const Default: Story = {
  args: {},
};
