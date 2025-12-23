import type { Meta, StoryObj } from '@storybook/react-vite';
import { CRMDashboard } from '../components/operations/crm/CRMDashboard';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * CRMDashboard provides client relationship management tools including contact
 * management, client development tracking, and relationship analytics.
 * 
 * ## Features
 * - Contact database
 * - Client development pipeline
 * - Relationship tracking
 * - Communication history
 * - Meeting scheduling
 * - Business development metrics
 * - Client satisfaction surveys
 * - Referral tracking
 * - Conflict checking
 * - Client portal access
 */
const meta = {
  title: 'Pages/CRM Dashboard',
  component: CRMDashboard,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'blue', value: '#1e40af' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Client relationship management dashboard with contact tracking and business development tools.',
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
} satisfies Meta<typeof CRMDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default CRM dashboard view
 */
export const Default: Story = {};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
