import type { Meta, StoryObj } from '@storybook/react-vite';
import { TagInput } from '../../components/common/TagInput';
import { ThemeProvider } from '../../context/ThemeContext';
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
    onChange: {
      action: 'change',
      description: 'Callback when tags change',
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
        onChange={setTags}
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
        onChange={setTags}
        placeholder="Type to add tags..."
      />
    );
  },
};
