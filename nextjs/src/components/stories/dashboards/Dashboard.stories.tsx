/**
 * Dashboard Page Story
 * 
 * Main dashboard with real-time firm intelligence and personal productivity center.
 * Features tabbed navigation across overview, tasks, and notifications.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Dashboard } from '../../../features/dashboard/components/Dashboard';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import type { User, UserId } from '@/types';

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
 * Includes play function to demonstrate automated tab switching interaction.
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
        story: 'Tasks view with personal task management and deadline tracking. Demonstrates automated interaction testing.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify tasks tab is active
    const tasksTab = canvas.getByRole('tab', { name: /tasks/i });
    await expect(tasksTab).toHaveAttribute('aria-selected', 'true');
    
    // Verify task list is visible
    const taskElements = canvas.getAllByRole('listitem');
    await expect(taskElements.length).toBeGreaterThan(0);
  },
};

/**
 * Dashboard with Notifications tab active, showing system alerts and activity feed.
 * Includes play function to test notification interactions.
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
        story: 'Notifications view displaying system alerts, mentions, and activity feed with interaction testing.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Verify notifications tab is active
    const notificationsTab = canvas.getByRole('tab', { name: /notifications/i });
    await expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
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

/**
 * Interactive test demonstrating tab switching behavior.
 * Tests user clicking through all three tabs: Overview → Tasks → Notifications.
 */
export const TabSwitching: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: { default: 'neutral' },
    docs: {
      description: {
        story: 'Automated test of tab switching functionality. Demonstrates play function with multiple user interactions.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Start on overview tab
    const overviewTab = canvas.getByRole('tab', { name: /overview/i });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    
    // Click Tasks tab
    const tasksTab = canvas.getByRole('tab', { name: /tasks/i });
    await userEvent.click(tasksTab);
    await expect(tasksTab).toHaveAttribute('aria-selected', 'true');
    await expect(overviewTab).toHaveAttribute('aria-selected', 'false');
    
    // Click Notifications tab
    const notificationsTab = canvas.getByRole('tab', { name: /notifications/i });
    await userEvent.click(notificationsTab);
    await expect(notificationsTab).toHaveAttribute('aria-selected', 'true');
    await expect(tasksTab).toHaveAttribute('aria-selected', 'false');
    
    // Return to Overview tab
    await userEvent.click(overviewTab);
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    await expect(notificationsTab).toHaveAttribute('aria-selected', 'false');
  },
};
