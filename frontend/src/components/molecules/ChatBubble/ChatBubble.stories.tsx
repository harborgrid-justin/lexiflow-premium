import { ChatBubble } from './ChatBubble';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ChatBubble> = {
  title: 'Components/Molecules/ChatBubble/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const Default: Story = {
  args: {
  "text": "Sample Text",
  "sender": "Sample Text",
  "isMe": true,
  "timestamp": "Sample Text",
  status: undefined,
  "isPrivileged": true,
  children: undefined
},
};
