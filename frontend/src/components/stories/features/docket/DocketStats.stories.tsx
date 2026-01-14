import { DocketStats } from '@/routes/cases/components/docket/DocketStats';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * DocketStats displays summary metric cards showing key docket activity
 * including recent filings, new orders, pending deadlines, and court sync status.
 *
 * ## Features
 * - Recent filings count (24h)
 * - New orders count
 * - Pending deadlines count
 * - Court sync connection status
 * - Color-coded indicators
 * - Icon-based metrics
 */
const meta = {
  title: 'Docket/DocketStats',
  component: DocketStats,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'slate', value: '#0f172a' },
      ],
    },
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Summary metric cards for docket activity showing filings, orders, deadlines, and sync status.',
      },
    },
  },
  tags: ['autodocs']
} satisfies Meta<typeof DocketStats>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default stats display with standard metrics
 */
export const Default: Story = {
  parameters: {
    backgrounds: { default: 'neutral' },
  },
};

/**
 * Stats in light theme
 */
export const LightTheme: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

/**
 * Stats in dark theme
 */
export const DarkTheme: Story = {
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
    backgrounds: { default: 'light' },
  },
};

/**
 * Tablet responsive view with custom width
 */
export const TabletCustom: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  }
};

/**
 * With action buttons - Primary variant
 */
export const WithPrimaryButtons: Story = {
};

/**
 * With action buttons - Multiple variants
 */
export const WithActionButtons: Story = {
};

/**
 * With loading state buttons
 */
export const WithLoadingButtons: Story = {
};

/**
 * With icon-only buttons
 */
export const WithIconButtons: Story = {
};

/**
 * With button sizes
 */
export const WithButtonSizes: Story = {
};

/**
 * With danger action button
 */
export const WithDangerButton: Story = {
};
