import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatterAnalyticsDashboard } from '../components/matters/analytics/MatterAnalyticsDashboard';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * MatterAnalyticsDashboard provides case-level analytics including time tracking,
 * financial performance, activity metrics, and outcome predictions.
 * 
 * ## Features
 * - Case performance metrics
 * - Time utilization
 * - Financial analytics
 * - Activity tracking
 * - Team productivity
 * - Document analytics
 * - Deadline compliance
 * - Budget variance
 * - Outcome predictions
 * - Comparative analysis
 */
const meta = {
  title: 'Pages/Matter Analytics Dashboard',
  component: MatterAnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Case-level analytics with performance metrics and outcome predictions.',
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
} satisfies Meta<typeof MatterAnalyticsDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default matter analytics view
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
