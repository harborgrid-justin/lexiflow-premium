import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContextMenu } from '../../components/common/ContextMenu';
import { ThemeProvider } from '@/providers/ThemeContext';
import { Copy, Edit, Trash2 } from 'lucide-react';
import React from 'react';

/**
 * ContextMenu component for right-click menus.
 */

const meta: Meta<typeof ContextMenu> = {
  title: 'Common/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Context menu for right-click actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of menu items',
    },
    children: {
      control: 'text',
      description: 'The trigger element',
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

const menuItems = [
  { icon: Edit, label: 'Edit', onClick: () => console.log('Edit') },
  { icon: Copy, label: 'Duplicate', onClick: () => console.log('Duplicate') },
  { icon: Trash2, label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger' as const },
];

export const Default: Story = {
  render: () => (
    <div className="p-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
      <p className="text-center text-slate-600 dark:text-slate-400">
        Right-click here to see the context menu
      </p>
      <ContextMenu items={menuItems}>
        <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-4">
          Right-click this area
        </div>
      </ContextMenu>
    </div>
  ),
};
