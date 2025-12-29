/**
 * @module components/navigation/QuickActions.stories
 * @category Navigation - Stories
 * @description Storybook stories for QuickActions component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QuickActions } from './QuickActions';
import {
  Clock, FileText, UserPlus, Briefcase, Calendar,
  FolderPlus, MessageSquare, Settings, Bell, Check
} from 'lucide-react';
import type { QuickActionGroup } from './QuickActions';

const meta: Meta<typeof QuickActions> = {
  title: 'Navigation/QuickActions',
  component: QuickActions,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Enterprise quick actions menu with role-based visibility and keyboard shortcuts.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    position: {
      control: 'select',
      options: ['left', 'right', 'center'],
    },
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof QuickActions>;

// Sample action groups
const commonGroups: QuickActionGroup[] = [
  {
    id: 'common',
    title: 'Common Actions',
    actions: [
      {
        id: '1',
        label: 'Log Time',
        description: 'Log billable time entries',
        icon: Clock,
        iconVariant: 'success',
        shortcut: 'Ctrl+T',
        shortcutKey: 'ctrl+t',
        onClick: () => console.log('Log Time'),
      },
      {
        id: '2',
        label: 'New Document',
        description: 'Create a new document',
        icon: FileText,
        iconVariant: 'primary',
        shortcut: 'Ctrl+N',
        shortcutKey: 'ctrl+n',
        onClick: () => console.log('New Document'),
      },
      {
        id: '3',
        label: 'New Case',
        description: 'Open a new case file',
        icon: Briefcase,
        iconVariant: 'info',
        onClick: () => console.log('New Case'),
      },
    ],
  },
  {
    id: 'schedule',
    title: 'Scheduling',
    actions: [
      {
        id: '4',
        label: 'Schedule Meeting',
        description: 'Schedule a team meeting',
        icon: Calendar,
        iconVariant: 'primary',
        onClick: () => console.log('Schedule Meeting'),
      },
      {
        id: '5',
        label: 'Set Reminder',
        description: 'Set a task reminder',
        icon: Bell,
        iconVariant: 'warning',
        badge: 'New',
        onClick: () => console.log('Set Reminder'),
      },
    ],
  },
];

const adminGroups: QuickActionGroup[] = [
  {
    id: 'user-mgmt',
    title: 'User Management',
    allowedRoles: ['Administrator', 'Senior Partner'],
    actions: [
      {
        id: '6',
        label: 'Add New User',
        description: 'Create a new user account',
        icon: UserPlus,
        iconVariant: 'primary',
        onClick: () => console.log('Add User'),
      },
      {
        id: '7',
        label: 'Manage Roles',
        description: 'Configure user roles and permissions',
        icon: Settings,
        iconVariant: 'danger',
        allowedRoles: ['Administrator'],
        onClick: () => console.log('Manage Roles'),
      },
    ],
  },
];

const allGroups: QuickActionGroup[] = [...commonGroups, ...adminGroups];

// Stories
export const Default: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'md',
  },
};

export const WithAdmin: Story = {
  args: {
    groups: allGroups,
    currentUserRole: 'Administrator',
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all actions including admin-only actions for Administrator role.',
      },
    },
  },
};

export const AssociateView: Story = {
  args: {
    groups: allGroups,
    currentUserRole: 'Associate',
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin actions are hidden for Associate role.',
      },
    },
  },
};

export const PositionLeft: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    position: 'left',
    maxWidth: 'md',
  },
};

export const PositionCenter: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    position: 'center',
    maxWidth: 'md',
  },
};

export const SmallWidth: Story = {
  args: {
    groups: commonGroups.slice(0, 1),
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'sm',
  },
};

export const LargeWidth: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    disabled: true,
  },
};

export const WithDisabledActions: Story = {
  args: {
    groups: [
      {
        id: 'mixed',
        title: 'Actions',
        actions: [
          {
            id: '1',
            label: 'Available Action',
            icon: Check,
            iconVariant: 'success',
            onClick: () => console.log('Available'),
          },
          {
            id: '2',
            label: 'Disabled Action',
            description: 'This action is currently unavailable',
            icon: FileText,
            iconVariant: 'primary',
            onClick: () => console.log('Disabled'),
            disabled: true,
          },
        ],
      },
    ],
    label: 'Quick Add',
  },
};

export const MinimalActions: Story = {
  args: {
    groups: [
      {
        id: 'minimal',
        actions: [
          {
            id: '1',
            label: 'Quick Action 1',
            icon: Check,
            onClick: () => console.log('Action 1'),
          },
          {
            id: '2',
            label: 'Quick Action 2',
            icon: FileText,
            onClick: () => console.log('Action 2'),
          },
        ],
      },
    ],
    label: 'Quick Add',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal action items without descriptions or groups.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    groups: commonGroups,
    label: 'Quick Add',
    position: 'right',
    maxWidth: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive menu. Check console for action outputs.',
      },
    },
  },
};
