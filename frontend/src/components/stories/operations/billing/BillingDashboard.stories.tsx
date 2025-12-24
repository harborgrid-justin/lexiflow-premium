/**
 * Billing Dashboard Page Story
 * 
 * Main billing dashboard with tabbed navigation for WIP, invoices, and ledger.
 * Provides financial tracking, time entry management, and revenue analytics.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import BillingDashboard from '../../../../features/operations/billing/BillingDashboard';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';

const meta: Meta<typeof BillingDashboard> = {
  title: 'Pages/Billing Dashboard',
  component: BillingDashboard,
  tags: ['autodocs', 'page'],
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
    actions: {
      handles: ['navigateTo'],
    },
    docs: {
      description: {
        component: 'Comprehensive billing and time tracking dashboard with work-in-progress (WIP) management, invoice generation, client ledger, and revenue analytics.'
      }
    },
    test: {
      clearMocks: true,
      restoreMocks: true,
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
      options: ['wip', 'invoices', 'ledger', 'analytics'],
      description: 'Initial tab to display'
    },
    navigateTo: {
      action: 'navigateTo',
      description: 'Navigation callback'
    }
  }
};

export default meta;
type Story = StoryObj<typeof BillingDashboard>;

/**
 * Default billing dashboard showing WIP (Work in Progress) view.
 */
export const Default: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'wip'
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
};

/**
 * Invoices tab view
 */
export const InvoicesView: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'invoices'
  },
  parameters: {
    backgrounds: { default: 'neutral' },
  },
};

/**
 * Analytics tab with dark mode
 */
export const AnalyticsDarkMode: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'analytics'
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Tablet responsive view
 */
export const TabletView: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'wip'
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' },
    backgrounds: { default: 'light' },
  },
};

/**
 * Work in Progress (WIP) view showing unbilled time and expenses.
 */
export const WIPView: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'wip'
  },
  parameters: {
    docs: {
      description: {
        story: 'WIP management view displaying unbilled time entries, expenses, and work ready for invoicing.'
      }
    }
  }
};

/**
 * Client ledger view showing financial history and account status.
 */
export const LedgerView: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'ledger'
  },
  parameters: {
    docs: {
      description: {
        story: 'Client ledger displaying financial transactions, trust accounting, and billing history.'
      }
    }
  }
};

/**
 * Analytics view with billing metrics and revenue insights.
 */
export const AnalyticsView: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'analytics'
  },
  parameters: {
    docs: {
      description: {
        story: 'Billing analytics dashboard with revenue trends, collection rates, and attorney productivity metrics.'
      }
    }
  }
};

/**
 * Billing dashboard with overdue invoices highlighted.
 */
export const OverdueInvoices: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'invoices'
  },
  parameters: {
    docs: {
      description: {
        story: 'Invoices view filtered to show overdue payments requiring collection action.'
      }
    }
  }
};

/**
 * Billing dashboard with pending time entries awaiting approval.
 */
export const PendingApprovals: Story = {
  args: {
    navigateTo: fn(),
    initialTab: 'wip'
  },
  parameters: {
    docs: {
      description: {
        story: 'WIP view showing time entries pending partner approval before invoicing.'
      }
    }
  }
};
