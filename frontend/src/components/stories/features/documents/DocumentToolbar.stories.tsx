/**
 * Document Toolbar Component Story
 * 
 * Toolbar with search, view mode toggle, and bulk actions.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentToolbar } from '../../../../features/operations/documents/DocumentToolbar';
import { ThemeProvider } from '@/providers/ThemeContext';
import { WindowProvider } from '@/providers/WindowContext';

const meta: Meta<typeof DocumentToolbar> = {
  title: 'Documents/Document Toolbar',
  component: DocumentToolbar,
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
    docs: {
      description: {
        component: 'Document toolbar with search, view mode toggle, selection counter, and bulk action buttons.'
      }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <WindowProvider>
          <Story />
        </WindowProvider>
      </ThemeProvider>
    )
  ],
  argTypes: {
    selectedDocsCount: {
      control: 'number',
      description: 'Number of selected documents'
    },
    searchTerm: {
      control: 'text',
      description: 'Current search term'
    },
    viewMode: {
      control: 'select',
      options: ['list', 'grid'],
      description: 'Current view mode'
    },
    isDetailsOpen: {
      control: 'boolean',
      description: 'Whether details panel is open'
    },
    isProcessingAI: {
      control: 'boolean',
      description: 'Whether AI is processing'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentToolbar>;

/**
 * Default toolbar with no selection.
 */
export const Default: Story = {
  args: {
    selectedDocsCount: 0,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * With search term entered.
 */
export const WithSearch: Story = {
  args: {
    selectedDocsCount: 0,
    searchTerm: 'motion to dismiss',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * Grid view mode.
 */
export const GridView: Story = {
  args: {
    selectedDocsCount: 0,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'grid',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * With documents selected.
 */
export const WithSelection: Story = {
  args: {
    selectedDocsCount: 5,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * AI processing active.
 */
export const AIProcessing: Story = {
  args: {
    selectedDocsCount: 3,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: true,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * Details panel open.
 */
export const DetailsOpen: Story = {
  args: {
    selectedDocsCount: 0,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: true,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * Many documents selected.
 */
export const ManySelected: Story = {
  args: {
    selectedDocsCount: 47,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'grid',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    selectedDocsCount: 0,
    searchTerm: '',
    setSearchTerm: fn(),
    viewMode: 'list',
    setViewMode: fn(),
    isDetailsOpen: false,
    setIsDetailsOpen: fn(),
    isProcessingAI: false,
    onBulkSummarize: fn(),
    onClearSelection: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};
