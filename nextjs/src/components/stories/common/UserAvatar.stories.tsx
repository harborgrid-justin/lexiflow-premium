import { UserAvatar } from '@/components/ui/atoms/UserAvatar/UserAvatar';
import { ThemeProvider } from '@/providers/ThemeContext';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from "react";

/**
 * UserAvatar component displays user profile pictures or initials.
 */

const meta: Meta<typeof UserAvatar> = {
  title: 'Common/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'User avatar with fallback to initials.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
      description: 'User name (used for initials)',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
    },
    indicatorStatus: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: 'Status indicator',
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

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-4">
      <UserAvatar name="Alice Anderson" size="sm" />
      <UserAvatar name="Bob Brown" size="md" />
      <UserAvatar name="Carol Chen" size="lg" />
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <UserAvatar name="User" size="xs" />
      <UserAvatar name="User" size="sm" />
      <UserAvatar name="User" size="md" />
      <UserAvatar name="User" size="lg" />
      <UserAvatar name="User" size="xl" />
    </div>
  ),
};
