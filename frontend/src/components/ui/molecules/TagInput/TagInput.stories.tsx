import type { Meta, StoryObj } from '@storybook/react';
import { TagInput } from './TagInput';

const meta: Meta<typeof TagInput> = {
  title: 'Components/Molecules/TagInput/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TagInput>;

export const Default: Story = {
  args: {
  "tags": "Sample Text",
  "onAdd": "Sample Text",
  "onRemove": "Sample Text",
  "suggestions": "Sample Text",
  "placeholder": "Sample Text"
},
};
