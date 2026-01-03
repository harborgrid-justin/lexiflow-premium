import { ContextMenu } from '@/components/ui/molecules/ContextMenu/ContextMenu';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
    x: {
      control: 'number',
      description: 'X coordinate for menu position',
    },
    y: {
      control: 'number',
      description: 'Y coordinate for menu position',
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
  { icon: Edit, label: 'Edit', action: () => console.log('Edit') },
  { icon: Copy, label: 'Duplicate', action: () => console.log('Duplicate') },
  { icon: Trash2, label: 'Delete', action: () => console.log('Delete'), danger: true },
];

const DefaultComponent = () => {
  const [menuState, setMenuState] = React.useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuState({ x: e.clientX, y: e.clientY, visible: true });
  };

  return (
    <div className="p-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
      <div
        className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer"
        onContextMenu={handleContextMenu}
      >
        <p className="text-center text-slate-600 dark:text-slate-400">
          Right-click here to see the context menu
        </p>
      </div>
      {menuState.visible && (
        <ContextMenu
          items={menuItems}
          x={menuState.x}
          y={menuState.y}
          onClose={() => setMenuState({ ...menuState, visible: false })}
        />
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultComponent />,
};
