import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatterOverviewDashboard } from '../../../../features/matters/components/overview/MatterOverviewDashboard';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';
import React from 'react';

/**
 * MatterOverviewDashboard provides comprehensive case overview with key metrics,
 * timeline, team, documents, and activity feed for individual matters.
 * 
 * ## Features
 * - Case summary
 * - Key metrics
 * - Timeline view
 * - Team roster
 * - Document library
 * - Activity feed
 * - Financial summary
 * - Deadline alerts
 * - Status indicators
 * - Quick actions
 */
const meta = {
  title: 'Pages/Matter Overview Dashboard',
  component: MatterOverviewDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive case overview with metrics, timeline, and activity tracking.',
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
} satisfies Meta<typeof MatterOverviewDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default matter overview view
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
