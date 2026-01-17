import { TagInput } from './TagInput';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
  "tags": [],
  "onAdd": () => {},
  "onRemove": () => {},
  "suggestions": [],
  "placeholder": "Sample Text"
},
};
