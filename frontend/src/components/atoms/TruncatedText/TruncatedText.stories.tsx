import { TruncatedText } from './TruncatedText';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof TruncatedText> = {
  title: 'Components/Atoms/TruncatedText/TruncatedText',
  component: TruncatedText,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TruncatedText>;

export const Default: Story = {
  args: {
  "text": "Sample Text",
  "limit": 42,
  "className": "Sample Text"
},
};
