import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagInput } from '@/components/ui/molecules/TagInput/TagInput';
import { ThemeProvider } from '@/providers';
import React, { useState } from 'react';

/**
 * TagInput component for adding and removing tags.
 */

const meta: Meta<typeof TagInput> = {
  title: 'Common/TagInput',
  component: TagInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tag input field for adding and managing tags.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of current tags',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder',
    },
    onAdd: {
      action: 'add',
      description: 'Callback when tag is added',
    },
    onRemove: {
      action: 'remove',
      description: 'Callback when tag is removed',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900 w-[500px]">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>(['contract', 'litigation']);
    return (
      <TagInput
        tags={tags}
        onAdd={(tag) => setTags([...tags, tag])}
        onRemove={(tag) => setTags(tags.filter(t => t !== tag))}
        placeholder="Add tags..."
      />
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>([]);
    return (
      <TagInput
        tags={tags}
        onAdd={(tag) => setTags([...tags, tag])}
        onRemove={(tag) => setTags(tags.filter(t => t !== tag))}
        placeholder="Type to add tags..."
      />
    );
  },
};
