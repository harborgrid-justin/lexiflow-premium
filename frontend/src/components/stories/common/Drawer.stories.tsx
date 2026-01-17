import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { Drawer } from '@/components/molecules/Drawer/Drawer';

import type { Meta, StoryObj } from '@storybook/react-vite';

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
    title: {
      control: 'text',
      description: 'Drawer title',
    },
    width: {
      control: 'text',
      description: 'Drawer width (Tailwind max-width class)',
    },
    children: {
      control: 'text',
      description: 'Drawer content',
    },
  }
};

export default meta;

type Story = StoryObj<typeof meta>;

const DefaultComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Drawer</Button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Case Details"
      >
        <div className="space-y-4">
          <p>This is a drawer panel from the right side.</p>
          <p>Add any content here.</p>
        </div>
      </Drawer>
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultComponent />,
};

const LargeContentComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Large Drawer</Button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filters"
        width="max-w-2xl"
      >
        <div className="space-y-4">
          <p>This is a wider drawer panel.</p>
          <p>Great for more complex content.</p>
        </div>
      </Drawer>
    </div>
  );
};

export const LargeContent: Story = {
  render: () => <LargeContentComponent />,
};
