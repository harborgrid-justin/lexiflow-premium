import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketEntryModal } from '@/features/matters/components/docket/DocketEntryModal';
import { DocketEntry, DocketEntryType } from '@/types';
import { ThemeProvider } from '@/providers/ThemeContext';
import React from 'react';

/**
 * DocketEntryModal displays detailed information about a docket entry
 * in a modal dialog with actions for printing, downloading, and linking
 * to the case timeline.
 * 
 * ## Features
 * - Detailed entry information display
 * - Document links and metadata
 * - Print and download actions
 * - Link to case timeline
 * - Copy to clipboard functionality
 * - Supports orbital (floating window) mode
 */
const meta = {
  title: 'Docket/DocketEntryModal',
  component: DocketEntryModal,
  // Exclude mock data from being treated as stories
  excludeStories: /^mock.*/,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'neutral',
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
        component: 'Modal dialog for viewing detailed docket entry information with actions.',
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
        <div className="w-screen h-screen">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    entry: {
      description: 'The docket entry to display (null to close modal)',
      control: 'object',
    },
    isOrbital: {
      description: 'Whether the modal is in orbital (floating) mode',
      control: 'boolean',
    },
  },
  args: {
    onClose: fn(),
    onViewOnTimeline: fn(),
    renderLinkedText: (text: string) => text,
  },
} satisfies Meta<typeof DocketEntryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockFilingEntry: DocketEntry = {
  id: 'docket-1' as any,
  caseId: 'case-123' as any,
  sequenceNumber: 42,
  dateFiled: '2024-12-15',
  entryDate: '2024-12-15',
  description: 'MOTION to Dismiss for Failure to State a Claim pursuant to Fed. R. Civ. P. 12(b)(6) filed by Defendant Acme Corporation. Motion argues that Plaintiff has failed to plausibly allege essential elements of negligence claim.',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Defendant Acme Corp.',
  documentId: 'doc-1' as any,
  isSealed: false,
  metadata: {
    attorney: 'Sarah Johnson, Esq.',
    firm: 'Johnson & Associates LLP',
    page_count: 23,
    tags: ['Motion', 'Dispositive', 'Rule 12(b)(6)'],
  },
  createdAt: '2024-12-15T10:30:00Z',
  updatedAt: '2024-12-15T10:30:00Z',
};

const mockOrderEntry: DocketEntry = {
  id: 'docket-2' as any,
  caseId: 'case-123' as any,
  sequenceNumber: 43,
  dateFiled: '2024-12-18',
  entryDate: '2024-12-18',
  description: 'ORDER granting Defendant\'s Motion to Dismiss. Court finds that Plaintiff has failed to state a claim upon which relief can be granted. Case dismissed with prejudice. All pending motions denied as moot.',
  type: 'Order' as DocketEntryType,
  filedBy: 'Hon. Sarah Martinez',
  documentId: 'doc-3' as any,
  isSealed: false,
  metadata: {
    page_count: 12,
    tags: ['Order', 'Final', 'Dismissal'],
    judge: 'Hon. Sarah Martinez',
  },
  createdAt: '2024-12-18T14:00:00Z',
  updatedAt: '2024-12-18T14:00:00Z',
};

const mockSealedEntry: DocketEntry = {
  id: 'docket-3' as any,
  caseId: 'case-123' as any,
  sequenceNumber: 44,
  dateFiled: '2024-12-20',
  entryDate: '2024-12-20',
  description: 'SEALED MOTION in Limine to Exclude Expert Testimony of Dr. James Wilson regarding causation. Motion contains confidential trade secret information.',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Plaintiff',
  documentId: undefined,
  isSealed: true,
  metadata: {
    seal_reason: 'Trade Secret Protection',
    seal_expiration: '2025-12-20',
    tags: ['Sealed', 'Motion in Limine', 'Expert Testimony'],
  },
  createdAt: '2024-12-20T09:00:00Z',
  updatedAt: '2024-12-20T09:00:00Z',
};

const mockHearingEntry: DocketEntry = {
  id: 'docket-4' as any,
  caseId: 'case-123' as any,
  sequenceNumber: 45,
  dateFiled: '2024-12-22',
  entryDate: '2024-12-22',
  description: 'NOTICE of Hearing on Motion for Summary Judgment scheduled for January 15, 2025 at 2:00 PM in Courtroom 4B. Parties shall submit proposed findings of fact and conclusions of law by January 8, 2025.',
  type: 'Hearing' as DocketEntryType,
  documentId: 'doc-4' as any,
  isSealed: false,
  metadata: {
    courtroom: '4B',
    hearing_time: '14:00',
    deadline: '2025-01-15',
  },
  createdAt: '2024-12-22T11:00:00Z',
  updatedAt: '2024-12-22T11:00:00Z',
};

/**
 * Default filing entry with motion details
 */
export const Filing: Story = {
  args: {
    entry: mockFilingEntry,
    isOrbital: false,
  },
};

/**
 * Court order with judge signature
 */
export const Order: Story = {
  args: {
    entry: mockOrderEntry,
    isOrbital: false,
  },
};

/**
 * Sealed document with restricted access
 */
export const SealedDocument: Story = {
  args: {
    entry: mockSealedEntry,
    isOrbital: false,
  },
};

/**
 * Hearing notice with deadline
 */
export const Hearing: Story = {
  args: {
    entry: mockHearingEntry,
    isOrbital: false,
  },
};

/**
 * Modal in orbital (floating window) mode
 */
export const OrbitalMode: Story = {
  args: {
    entry: mockFilingEntry,
    isOrbital: true,
  },
};

/**
 * Entry with extensive metadata
 */
export const WithMetadata: Story = {
  args: {
    entry: {
      ...mockFilingEntry,
      metadata: {
        attorney: 'Sarah Johnson, Esq.',
        firm: 'Johnson & Associates LLP',
        page_count: 23,
        attachment_count: 5,
        word_count: 8542,
        citation_count: 47,
      },
    },
    isOrbital: false,
  },
};

/**
 * Entry without documents
 */
export const NoDocuments: Story = {
  args: {
    entry: {
      ...mockFilingEntry,
      documentId: undefined,
    },
    isOrbital: false,
  },
};

/**
 * Closed modal state
 */
export const Closed: Story = {
  args: {
    entry: null,
    isOrbital: false,
  },
};
