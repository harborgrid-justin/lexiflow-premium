import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '../../components/common/IconButton';
import { ThemeProvider } from '../../context/ThemeContext';
import { Plus, Edit, Trash2, Download, Share2 } from 'lucide-react';
import React from 'react';

/**
 * IconButton component for icon-only buttons.
 */

const meta: Meta<typeof IconButton> = {
  title: 'Common/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon-only button for compact actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'Visual style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    label: {
      control: 'text',
      description: 'Accessible label (aria-label)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
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

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconButton icon={Plus} label="Add" />
      <IconButton icon={Edit} label="Edit" variant="secondary" />
      <IconButton icon={Download} label="Download" variant="outline" />
      <IconButton icon={Share2} label="Share" variant="ghost" />
      <IconButton icon={Trash2} label="Delete" variant="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={Plus} label="Small" size="sm" />
      <IconButton icon={Plus} label="Medium" size="md" />
      <IconButton icon={Plus} label="Large" size="lg" />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    icon: Plus,
    label: 'Add Item',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};
