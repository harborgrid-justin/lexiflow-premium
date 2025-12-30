import { CopyButton } from '@/components/ui/atoms/CopyButton/CopyButton';
import { ThemeProvider } from '@/providers/ThemeContext';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from "react";

/**
 * CopyButton component for copying text to clipboard.
 */

const meta: Meta<typeof CopyButton> = {
  title: 'Common/CopyButton',
  component: CopyButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Button for copying text to clipboard with visual feedback.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Text to copy',
    },
    label: {
      control: 'text',
      description: 'Button label text',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Button size',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-white dark:bg-slate-900">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This is the text that will be copied to the clipboard',
  },
};

export const WithCustomLabel: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <code className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded">
          case-id-12345
        </code>
        <CopyButton text="case-id-12345" />
      </div>
    </div>
  ),
};
