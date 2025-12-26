import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '@/components/atoms/IconButton';
import { ThemeProvider } from '@/providers/ThemeContext';
import { Plus, Edit, Trash2, Download, Share2 } from 'lucide-react';

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
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'],
      description: 'Visual style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label (required for screen readers)',
    },
    tooltip: {
      control: 'text',
      description: 'Tooltip text on hover',
    },
    rounded: {
      control: 'boolean',
      description: 'Make button circular',
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
      <IconButton icon={Plus} aria-label="Add" />
      <IconButton icon={Edit} aria-label="Edit" variant="secondary" />
      <IconButton icon={Download} aria-label="Download" variant="success" />
      <IconButton icon={Share2} aria-label="Share" variant="ghost" />
      <IconButton icon={Trash2} aria-label="Delete" variant="danger" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton icon={Plus} aria-label="Small" size="sm" />
      <IconButton icon={Plus} aria-label="Medium" size="md" />
      <IconButton icon={Plus} aria-label="Large" size="lg" />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    icon: Plus,
    'aria-label': 'Add Item',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};
