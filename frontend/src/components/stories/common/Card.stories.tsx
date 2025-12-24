import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@/components/molecules/Card';
import { ThemeProvider } from '@/providers/ThemeContext';
import { Button } from '@/components/atoms/Button';
import React from 'react';

/**
 * Card component provides a container with optional header and footer sections.
 */

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Reusable card container with optional header, subtitle, actions, and footer.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <ThemeProvider>
        <div className="p-8 bg-slate-50 dark:bg-slate-800">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: (
      <div>
        <p>This is a simple card with default padding.</p>
      </div>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: (
      <div>
        <p>Card content goes here with a title.</p>
      </div>
    ),
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'User Profile',
    subtitle: 'Manage your account settings',
    children: (
      <div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: 'Document Review',
    subtitle: 'Pending items require your attention',
    action: <Button size="sm">View All</Button>,
    children: (
      <div className="space-y-2">
        <p>5 documents awaiting review</p>
        <p>3 signatures pending</p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Case Summary',
    children: (
      <div className="space-y-2">
        <p>Case: Smith v. Jones</p>
        <p>Status: Active</p>
      </div>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save Changes</Button>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    title: 'Custom Layout',
    noPadding: true,
    children: (
      <div className="divide-y">
        <div className="p-4">Item 1</div>
        <div className="p-4">Item 2</div>
        <div className="p-4">Item 3</div>
      </div>
    ),
  },
};
