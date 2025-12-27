import type { Meta, StoryObj } from '@storybook/react';
import { EditorToolbar } from './EditorToolbar';

const meta: Meta<typeof EditorToolbar> = {
  title: 'Components/Organisms/EditorToolbar/EditorToolbar',
  component: EditorToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof EditorToolbar>;

export const Default: Story = {
  args: {
  "wordCount": 42,
  "onCmd": "Sample Text",
  "onSave": {}
},
};
