import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrustAccountDashboard } from '../../../components/operations/billing/trust/TrustAccountDashboard';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ToastProvider } from '../../../context/ToastContext';
import React from 'react';

/**
 * TrustAccountDashboard provides comprehensive trust accounting management with
 * IOLTA compliance, reconciliation, and audit trail for client funds.
 * 
 * ## Features
 * - Trust account ledger
 * - IOLTA compliance
 * - Three-way reconciliation
 * - Client fund tracking
 * - Transaction audit trail
 * - Compliance reporting
 * - Interest calculation
 * - Automated reconciliation
 * - Disbursement tracking
 * - Audit reports
 */
const meta = {
  title: 'Pages/Trust Account Dashboard',
  component: TrustAccountDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Trust accounting management with IOLTA compliance and audit trail.',
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
} satisfies Meta<typeof TrustAccountDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default trust account dashboard view
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
