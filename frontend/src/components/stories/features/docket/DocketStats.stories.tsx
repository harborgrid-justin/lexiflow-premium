import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketStats } from '../../../../frontend/components/matters/docket/DocketStats';
import { Button } from '../../../../frontend/components/common/Button';
import { ThemeProvider } from '../../../../frontend/context/ThemeContext';
import { RefreshCw, Download, FileText, Plus } from 'lucide-react';
import React from 'react';

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
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-6xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
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
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-3xl">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With action buttons - Primary variant
 */
export const WithPrimaryButtons: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end">
            <Button variant="primary" icon={RefreshCw} onClick={fn()}>
              Refresh Stats
            </Button>
            <Button variant="primary" icon={Plus} onClick={fn()}>
              Add Entry
            </Button>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With action buttons - Multiple variants
 */
export const WithActionButtons: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end flex-wrap">
            <Button variant="primary" icon={Plus} onClick={fn()}>
              Add Entry
            </Button>
            <Button variant="secondary" icon={RefreshCw} onClick={fn()}>
              Refresh
            </Button>
            <Button variant="outline" icon={Download} onClick={fn()}>
              Export
            </Button>
            <Button variant="ghost" icon={FileText} onClick={fn()}>
              View All
            </Button>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With loading state buttons
 */
export const WithLoadingButtons: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end">
            <Button variant="primary" isLoading onClick={fn()}>
              Syncing...
            </Button>
            <Button variant="secondary" icon={Download} onClick={fn()}>
              Export
            </Button>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With icon-only buttons
 */
export const WithIconButtons: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end">
            <Button variant="primary" size="icon" icon={Plus} onClick={fn()} aria-label="Add entry" />
            <Button variant="secondary" size="icon" icon={RefreshCw} onClick={fn()} aria-label="Refresh" />
            <Button variant="outline" size="icon" icon={Download} onClick={fn()} aria-label="Download" />
            <Button variant="ghost" size="icon" icon={FileText} onClick={fn()} aria-label="View details" />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With button sizes
 */
export const WithButtonSizes: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end items-center">
            <Button variant="primary" size="xs" icon={Plus} onClick={fn()}>
              Extra Small
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={fn()}>
              Small
            </Button>
            <Button variant="primary" size="md" icon={Plus} onClick={fn()}>
              Medium
            </Button>
            <Button variant="primary" size="lg" icon={Plus} onClick={fn()}>
              Large
            </Button>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};

/**
 * With danger action button
 */
export const WithDangerButton: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="space-y-4">
          <Story />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={fn()}>
              Cancel
            </Button>
            <Button variant="danger" onClick={fn()}>
              Clear All Stats
            </Button>
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
};
