import type { Meta, StoryObj } from '@storybook/react-vite';
import { VendorManagement } from '../../../../features/litigation/discovery/VendorManagement';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@providers/ToastContext';
import React from 'react';

/**
 * VendorManagement provides e-discovery and litigation support vendor management
 * including contract tracking, performance monitoring, and cost analysis.
 * 
 * ## Features
 * - Vendor directory
 * - Contract management
 * - Performance tracking
 * - Cost analysis
 * - Service catalog
 * - RFP management
 * - Quality metrics
 * - Vendor comparison
 * - Invoice tracking
 * - Compliance monitoring
 */
const meta = {
  title: 'Pages/Vendor Management',
  component: VendorManagement,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'E-discovery vendor management with contract tracking and performance monitoring.',
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
} satisfies Meta<typeof VendorManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default vendor management view
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
