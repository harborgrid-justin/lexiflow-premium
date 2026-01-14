import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocketSheet } from '@/routes/cases/components/docket/DocketSheet';

/**
 * DocketSheet is the main docket view component that integrates filtering,
 * search, table display, and entry editing capabilities.
 * 
 * ## Features
 * - Complete docket management interface
 * - Real-time search and filtering
 * - Entry creation and editing
 * - Bulk operations
 * - Live feed integration
 * - Worker-based search
 * - Virtualized table for performance
 * - Modal entry details
 * - Import capabilities
 * - Responsive design
 */
const meta = {
  title: 'Docket/DocketSheet',
  component: DocketSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main docket sheet view with filtering, search, editing, and comprehensive docket management.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    filterType: {
      description: 'Type of entries to display',
      control: 'select',
      options: ['all', 'filings', 'orders'],
    },
  },
} satisfies Meta<typeof DocketSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing all docket entries
 */
export const AllEntries: Story = {
  args: {
    filterType: 'all',
  },
};

/**
 * View filtered to show only filings
 */
export const FilingsOnly: Story = {
  args: {
    filterType: 'filings',
  },
};

/**
 * View filtered to show only orders
 */
export const OrdersOnly: Story = {
  args: {
    filterType: 'orders',
  },
};

/**
 * Light theme view
 */
export const LightTheme: Story = {
  args: {
    filterType: 'all',
  }
};

/**
 * Dark theme view
 */
export const DarkTheme: Story = {
  args: {
    filterType: 'all',
  }
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    filterType: 'all',
  },
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
  args: {
    filterType: 'all',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
