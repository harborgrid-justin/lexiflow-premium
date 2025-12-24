import type { Meta, StoryObj } from '@storybook/react-vite';
import { CaseManagementHub } from '../../../../features/matters/components/create/CaseManagementHub';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';
import React from 'react';

/**
 * CaseManagementHub is the centralized case creation and management interface
 * providing matter intake, conflict checking, and initial case setup workflows.
 * 
 * ## Features
 * - Smart matter intake forms
 * - Automated conflict checking
 * - Client information capture
 * - Matter type selection
 * - Fee agreement setup
 * - Team assignment
 * - Initial document collection
 * - Case setup wizard
 */
const meta = {
  title: 'Pages/Case Management Hub',
  component: CaseManagementHub,
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
      defaultViewport: 'desktopLarge',
    },
    docs: {
      description: {
        component: 'Centralized case creation and management interface with intake workflows and conflict checking.',
      },
    },
    test: {
      clearMocks: true,
      restoreMocks: true,
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
} satisfies Meta<typeof CaseManagementHub>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default case management hub view
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
