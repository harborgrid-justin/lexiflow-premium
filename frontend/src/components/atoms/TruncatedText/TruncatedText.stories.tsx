import type { Meta, StoryObj } from '@storybook/react';
import { TruncatedText } from './TruncatedText';

const meta: Meta<typeof TruncatedText> = {
  title: 'Atoms/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TruncatedText>;

export const Default: Story = {
  args: {},
};
