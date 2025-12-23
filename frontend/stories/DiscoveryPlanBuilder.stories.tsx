import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiscoveryPlanBuilder } from '../components/matters/detail/collaboration/DiscoveryPlanBuilder';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * DiscoveryPlanBuilder provides collaborative discovery planning tools including
 * strategy development, cost estimation, and timeline planning.
 * 
 * ## Features
 * - Discovery strategy canvas
 * - Custodian identification
 * - Data source mapping
 * - Cost estimation
 * - Timeline planning
 * - Production planning
 * - ESI protocol builder
 * - Preservation plan
 * - Search term development
 * - Review workflow planning
 */
const meta = {
  title: 'Pages/Discovery Plan Builder',
  component: DiscoveryPlanBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Collaborative discovery planning with strategy development and cost estimation.',
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
} satisfies Meta<typeof DiscoveryPlanBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default discovery plan builder view
 */
export const Default: Story = {
  args: {
    caseId: 'case-001',
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    caseId: 'case-001',
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
    caseId: 'case-001',
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
