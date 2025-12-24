import type { Meta, StoryObj } from '@storybook/react-vite';
import { RulesDashboard } from '../../../components/knowledge/rules/RulesDashboard';
import { ThemeProvider } from '../../../context/ThemeContext';
import { ToastProvider } from '../../../context/ToastContext';
import React from 'react';

/**
 * RulesDashboard provides centralized court rules management with jurisdiction
 * tracking, rule updates, and compliance monitoring.
 * 
 * ## Features
 * - Rules library
 * - Jurisdiction tracking
 * - Rule updates
 * - Compliance monitoring
 * - Deadline calculators
 * - Filing requirements
 * - Local rules
 * - Practice standards
 * - Rule alerts
 * - Citation tools
 */
const meta = {
  title: 'Pages/Rules Dashboard',
  component: RulesDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Court rules management with jurisdiction tracking and compliance monitoring.',
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
} satisfies Meta<typeof RulesDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default rules dashboard view
 */
export const Default: Story = {
  args: {
    onNavigate: (view: unknown) => console.log('Navigate to:', view),
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    onNavigate: (view: unknown) => console.log('Navigate to:', view),
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
    onNavigate: (view: unknown) => console.log('Navigate to:', view),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
