/**
 * Document Filters Component Story
 * 
 * Sidebar filters for document browsing with smart views and folder navigation.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentFilters } from '@/routes/documents/components/DocumentFilters';

const meta: Meta<typeof DocumentFilters> = {
  title: 'Documents/Document Filters',
  component: DocumentFilters,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: 'Sidebar filter panel with smart views, folder navigation, and faceted search for document browsing.'
      }
    },
  },
  argTypes: {
    currentFolder: {
      control: 'text',
      description: 'Currently selected folder ID'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentFilters>;

/**
 * Default filters with root folder selected.
 */
export const Default: Story = {
  args: {
    currentFolder: 'root',
    setCurrentFolder: fn()
  }
};

/**
 * Pleadings folder selected.
 */
export const PleadingsFolder: Story = {
  args: {
    currentFolder: 'pleadings',
    setCurrentFolder: fn()
  }
};

/**
 * Discovery folder selected.
 */
export const DiscoveryFolder: Story = {
  args: {
    currentFolder: 'discovery',
    setCurrentFolder: fn()
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    currentFolder: 'root',
    setCurrentFolder: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

/**
 * Compact view for smaller screens.
 */
export const Compact: Story = {
  args: {
    currentFolder: 'root',
    setCurrentFolder: fn()
  }
};
