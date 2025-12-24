import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserManagement } from '../../components/admin/users/UserManagement';
import { ThemeProvider } from '../../context/ThemeContext';
import { ToastProvider } from '../../context/ToastContext';
import React from 'react';

/**
 * UserManagement provides comprehensive user administration including role management,
 * permissions, authentication, and access control for the legal platform.
 * 
 * ## Features
 * - User account management
 * - Role-based access control
 * - Permission assignment
 * - Authentication settings
 * - Multi-factor authentication
 * - Active directory integration
 * - User activity monitoring
 * - License management
 * - Audit logging
 * - Bulk user operations
 */
const meta = {
  title: 'Pages/User Management',
  component: UserManagement,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'User administration with role management, permissions, and access control.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs', 'page'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="h-screen w-screen">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof UserManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default user management view
 */
export const Default: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

/**
 * Dark mode variant for user management
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    backgrounds: { default: 'neutral' },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};
