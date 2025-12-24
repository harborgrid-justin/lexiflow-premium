import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from '../../components/common/Drawer';
import { ThemeProvider } from '@/providers/ThemeContext';
import { Button } from '../../components/common/Button';
import React, { useState } from 'react';

/**
 * Drawer component for side panels.
 */

const meta: Meta<typeof Drawer> = {
  title: 'Common/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sliding drawer panel from the side of the screen.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the drawer is open',
    },
    side: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Side from which the drawer slides in',
    },
    title: {
      control: 'text',
      description: 'Drawer title',
    },
    children: {
      control: 'text',
      description: 'Drawer content',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-50 dark:bg-slate-800 min-h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Case Details"
          side="right"
        >
          <div className="space-y-4">
            <p>This is a drawer panel from the right side.</p>
            <p>Add any content here.</p>
          </div>
        </Drawer>
      </div>
    );
  },
};

export const Left: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Left Drawer</Button>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Filters"
          side="left"
        >
          <div className="space-y-4">
            <p>This drawer slides from the left.</p>
          </div>
        </Drawer>
      </div>
    );
  },
};
