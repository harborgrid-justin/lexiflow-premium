import type { Meta, StoryObj } from '@storybook/react-vite';
import { GovernanceDashboard } from '../components/admin/data/governance/GovernanceDashboard';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * GovernanceDashboard provides comprehensive data governance oversight with
 * metrics, compliance status, and policy enforcement monitoring.
 * 
 * ## Features
 * - Governance metrics
 * - Compliance status
 * - Policy enforcement
 * - Risk dashboard
 * - Audit overview
 * - Data quality metrics
 * - Access analytics
 * - Violation tracking
 * - Remediation tracking
 * - Executive reporting
 */
const meta = {
  title: 'Pages/Governance Dashboard',
  component: GovernanceDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Data governance oversight with compliance metrics and policy enforcement.',
      },
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
} satisfies Meta<typeof GovernanceDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default governance dashboard view
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
