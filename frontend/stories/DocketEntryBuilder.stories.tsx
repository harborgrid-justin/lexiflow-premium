import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketEntryBuilder } from '../components/matters/docket/DocketEntryBuilder';
import { DocketEntry, DocketEntryType } from '../types';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import React from 'react';

/**
 * DocketEntryBuilder provides a comprehensive form for creating and editing
 * docket entries with automatic task generation and rule association capabilities.
 * 
 * ## Features
 * - Complete docket entry form
 * - Entry type selection
 * - Party and attorney information
 * - Document association
 * - Deadline calculation
 * - Task generation
 * - Rule linking
 * - Validation and error handling
 */
const meta = {
  title: 'Docket/DocketEntryBuilder',
  component: DocketEntryBuilder,
  // Exclude mock data from being treated as stories
  excludeStories: /^mock.*/,
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
    viewport: {
      defaultViewport: 'desktop',
    },
    actions: {
      handles: ['onSave', 'onCancel'],
    },
    docs: {
      description: {
        component: 'Form builder for creating and editing docket entries with automatic task and deadline generation.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <ToastProvider>
          <div className="w-full max-w-4xl">
            <Story />
          </div>
        </ToastProvider>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    initialData: {
      description: 'Initial data for editing an existing entry',
      control: 'object',
    },
    caseParties: {
      description: 'Array of party names for dropdown selection',
      control: 'object',
    },
    onSave: {
      description: 'Callback when entry is saved',
      action: 'onSave',
    },
    onCancel: {
      description: 'Callback when form is cancelled',
      action: 'onCancel',
    },
  },
  args: {
    onSave: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DocketEntryBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockParties = [
  'Plaintiff John Doe',
  'Plaintiff Jane Smith',
  'Defendant Acme Corporation',
  'Defendant XYZ Industries',
  'Third-Party Defendant ABC LLC',
];

const mockExistingEntry: Partial<DocketEntry> = {
  id: 'docket-1' as any,
  sequenceNumber: 42,
  dateFiled: '2024-12-15',
  description: 'MOTION to Dismiss for Failure to State a Claim',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Defendant Acme Corporation',
};

/**
 * Default empty form for creating a new entry
 */
export const NewEntry: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Empty form for creating a new docket entry from scratch.',
      },
    },
  },
};

/**
 * Form pre-filled with existing entry data for editing
 */
export const EditExisting: Story = {
  args: {
    initialData: mockExistingEntry,
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'neutral' },
    docs: {
      description: {
        story: 'Form pre-populated with existing docket entry data for editing.',
      },
    },
  },
};

/**
 * Dark mode variant
 */
export const DarkMode: Story = {
  args: {
    caseParties: mockParties,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * Creating a new filing entry
 */
export const NewFiling: Story = {
  args: {
    initialData: {
      type: 'Filing' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a new court order
 */
export const NewOrder: Story = {
  args: {
    initialData: {
      type: 'Order' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a hearing notice with deadline
 */
export const NewHearing: Story = {
  args: {
    initialData: {
      type: 'Hearing' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a minute entry
 */
export const NewMinuteEntry: Story = {
  args: {
    initialData: {
      type: 'Minute Entry' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Creating a notice entry
 */
export const NewNotice: Story = {
  args: {
    initialData: {
      type: 'Notice' as DocketEntryType,
      dateFiled: new Date().toISOString().split('T')[0],
    },
    caseParties: mockParties,
  },
};

/**
 * Form with no parties available
 */
export const NoParties: Story = {
  args: {
    caseParties: [],
  },
};

/**
 * Complex entry with all fields populated
 */
export const CompleteEntry: Story = {
  args: {
    initialData: {
      sequenceNumber: 100,
      dateFiled: '2024-12-20',
      description: 'MOTION for Summary Judgment on all counts pursuant to Fed. R. Civ. P. 56. Defendant argues that no genuine issue of material fact exists and Defendant is entitled to judgment as a matter of law.',
      type: 'Filing' as DocketEntryType,
      filedBy: 'Defendant Acme Corporation',
      deadline: '2025-01-20',
      metadata: {
        attorney: 'Sarah Johnson, Esq.',
        firm: 'Johnson & Associates LLP',
      },
    },
    caseParties: mockParties,
  },
};
