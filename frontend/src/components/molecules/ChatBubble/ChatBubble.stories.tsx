import type { Meta, StoryObj } from '@storybook/react';
import { ChatBubble } from './ChatBubble';

const meta: Meta<typeof ChatBubble> = {
  title: 'Molecules/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const Default: Story = {
  args: {},
};
