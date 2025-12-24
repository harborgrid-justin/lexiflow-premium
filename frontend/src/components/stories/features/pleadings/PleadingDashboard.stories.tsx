import type { Meta, StoryObj } from '@storybook/react-vite';
import { PleadingDashboard } from '../../../../features/litigation/pleadings/PleadingDashboard';
import { ThemeProvider } from '@/providers/ThemeContext';
import { ToastProvider } from '@/providers/ToastContext';
import React from 'react';

/**
 * PleadingDashboard provides centralized pleading document management with
 * status tracking, version control, and court filing integration.
 * 
 * ## Features
 * - Pleading library
 * - Status tracking
 * - Version control
 * - Filing deadlines
 * - Court integration
 * - Template management
 * - Approval workflow
 * - Citation checking
 * - Format validation
 * - Filing history
 */
const meta = {
  title: 'Pages/Pleading Dashboard',
  component: PleadingDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Pleading document management with status tracking and court filing integration.',
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
} satisfies Meta<typeof PleadingDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default pleading dashboard view
 */
export const Default: Story = {
  args: {
    onCreate: (newDoc) => {
      console.log('Created pleading:', newDoc);
    },
    onEdit: (id) => {
      console.log('Edit pleading:', id);
    },
  },
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {
    onCreate: (newDoc) => {
      console.log('Created pleading:', newDoc);
    },
    onEdit: (id) => {
      console.log('Edit pleading:', id);
    },
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
    onCreate: (newDoc) => {
      console.log('Created pleading:', newDoc);
    },
    onEdit: (id) => {
      console.log('Edit pleading:', id);
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
