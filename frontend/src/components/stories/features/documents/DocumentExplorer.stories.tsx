/**
 * Document Explorer Component Story
 * 
 * Core document browsing interface with list/grid views, filters, search, and preview.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentExplorer } from '../../../../features/operations/documents/DocumentExplorer';
import { ToastProvider } from '@/providers';
import { WindowProvider } from '@/providers';

const meta: Meta<typeof DocumentExplorer> = {
  title: 'Documents/Document Explorer',
  component: DocumentExplorer,
  tags: ['autodocs'],
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
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        component: 'Document explorer with advanced filtering, search, drag-drop upload, and preview capabilities. Supports both list and grid view modes.'
      }
    },
  },
  argTypes: {
    currentUserRole: {
      control: 'select',
      options: ['Partner', 'Associate', 'Paralegal', 'Admin', 'Client'],
      description: 'User role for permission checks'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentExplorer>;

/**
 * Default explorer in list view.
 */
export const Default: Story = {
  args: {
    currentUserRole: 'Associate'
  }
};

/**
 * Partner view with full permissions.
 */
export const PartnerView: Story = {
  args: {
    currentUserRole: 'Senior Partner'
  }
};

/**
 * Paralegal view with limited permissions.
 */
export const ParalegalView: Story = {
  args: {
    currentUserRole: 'Paralegal'
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    currentUserRole: 'Associate'
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

/**
 * Tablet responsive view.
 */
export const TabletView: Story = {
  args: {
    currentUserRole: 'Associate'
  },
  parameters: {
    viewport: { defaultViewport: 'tablet' }
  }
};

/**
 * Mobile responsive view.
 */
export const MobileView: Story = {
  args: {
    currentUserRole: 'Associate'
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' }
  }
};
