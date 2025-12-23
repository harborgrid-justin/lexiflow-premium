/**
 * Dashboard Page Story
 * 
 * Main dashboard with real-time firm intelligence and personal productivity center.
 * Features tabbed navigation across overview, tasks, and notifications.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Dashboard } from '../components/dashboard/Dashboard';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import type { User, UserId } from '../types';

const meta: Meta<typeof Dashboard> = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  // Exclude mock data exports from being treated as stories
  excludeStories: /^mock.*/,
  tags: ['autodocs', 'page'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'neutral',
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Main dashboard page with tabbed navigation for overview, tasks, and notifications. Provides firm intelligence, personal productivity metrics, and real-time updates.'
      }
    },
    test: {
      clearMocks: true,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </ThemeProvider>
    )
  ],
  argTypes: {
    initialTab: {
      control: 'select',
      options: ['overview', 'tasks', 'notifications'],
      description: 'Initial tab to display'
    },
    currentUser: {
      description: 'Current authenticated user object',
      control: 'object',
    },
    onSelectCase: {
      description: 'Callback when a case is selected',
      action: 'onSelectCase',
    },
  }
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

// Mock current user
const mockCurrentUser: User = {
  id: 'user_001' as UserId,
  email: 'sarah.thompson@lexiflow.com',
  firstName: 'Sarah',
  lastName: 'Thompson',
  name: 'Sarah Thompson',
  role: 'Associate',
  title: 'Senior Associate',
  department: 'Corporate Law',
  phone: '+1-555-0123',
  avatarUrl: undefined,
  status: 'online',
  isActive: true,
  isVerified: true,
  lastLoginAt: '2024-12-23T10:30:00Z',
  createdAt: '2024-01-15T08:00:00Z',
  updatedAt: '2024-12-18T10:30:00Z'
};

/**
 * Default dashboard view showing overview tab with metrics, recent activity, and quick actions.
 */
export const Default: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: mockCurrentUser,
    initialTab: 'overview'
  },
  parameters: {
    backgrounds: { default: 'neutral' },
  },
};

/**
 * Dashboard with Tasks tab active, showing personal task list and upcoming deadlines.
 */
export const TasksView: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: mockCurrentUser,
    initialTab: 'tasks'
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Tasks view with personal task management and deadline tracking.',
      },
    },
  },
};

/**
 * Dashboard with Notifications tab active, showing system alerts and activity feed.
 */
export const NotificationsView: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: mockCurrentUser,
    initialTab: 'notifications'
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Notifications view displaying system alerts, mentions, and activity feed.',
      },
    },
  },
};

/**
 * Dashboard for a paralegal user with different permission levels.
 */
export const ParalegalDashboard: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: {
      ...mockCurrentUser,
      role: 'Paralegal',
      firstName: 'Michael',
      lastName: 'Chen',
      name: 'Michael Chen',
      title: 'Paralegal'
    },
    initialTab: 'overview'
  },
  parameters: {
    backgrounds: { default: 'neutral' },
    docs: {
      description: {
        story: 'Dashboard view for paralegal role with appropriate permission restrictions.',
      },
    },
  },
};

/**
 * Dashboard for a partner with elevated access and analytics.
 */
export const PartnerDashboard: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: {
      ...mockCurrentUser,
      role: 'Senior Partner',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      name: 'Jennifer Martinez',
      title: 'Senior Partner'
    },
    initialTab: 'overview'
  }
};

/**
 * Dashboard for an admin user with system management capabilities.
 */
export const AdminDashboard: Story = {
  args: {
    onSelectCase: fn(),
    currentUser: {
      ...mockCurrentUser,
      role: 'Administrator',
      firstName: 'Robert',
      lastName: 'Kim',
      name: 'Robert Kim',
      title: 'System Administrator'
    },
    initialTab: 'overview'
  }
};
