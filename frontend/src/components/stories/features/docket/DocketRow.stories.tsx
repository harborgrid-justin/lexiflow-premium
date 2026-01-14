import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocketRow } from '@/routes/cases/components/docket/DocketRow';
import { DocketEntry, DocketEntryType, DocketId, CaseId, DocumentId } from '@/types';

/**
 * DocketRow displays an individual docket entry row with type icons, 
 * badges, and action buttons. It shows entry details including sequence 
 * number, date filed, description, and associated metadata.
 * 
 * ## Features
 * - Type-specific icons (Filing, Order, Hearing, etc.)
 * - Status badges (Sealed, Pending, Completed)
 * - Action buttons for viewing documents
 * - Optional case column display
 * - Focus states for keyboard navigation
 */
const meta = {
  title: 'Docket/DocketRow',
  component: DocketRow,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Individual docket entry row component used in docket tables and lists.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    entry: {
      description: 'The docket entry data object',
      control: 'object',
    },
    showCaseColumn: {
      description: 'Whether to display the case column',
      control: 'boolean',
    },
    isFocused: {
      description: 'Whether the row is currently focused',
      control: 'boolean',
    },
  },
  args: {
    onSelect: fn(),
    onSelectCaseId: fn(),
    onViewDoc: fn(),
  },
} satisfies Meta<typeof DocketRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockFilingEntry: DocketEntry = {
  id: 'docket-1' as DocketId,
  caseId: 'case-123' as CaseId,
  sequenceNumber: 42,
  dateFiled: '2024-12-15',
  entryDate: '2024-12-15',
  description: 'MOTION to Dismiss for Failure to State a Claim filed by Defendant Acme Corp.',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Defendant Acme Corp.',
  documentId: 'doc-1' as DocumentId,
  isSealed: false,
  createdAt: '2024-12-15T10:30:00Z',
  updatedAt: '2024-12-15T10:30:00Z',
};

const mockOrderEntry: DocketEntry = {
  id: 'docket-2' as DocketId,
  caseId: 'case-123' as CaseId,
  sequenceNumber: 43,
  dateFiled: '2024-12-18',
  entryDate: '2024-12-18',
  description: 'ORDER granting Motion to Dismiss. Case dismissed with prejudice.',
  type: 'Order' as DocketEntryType,
  filedBy: 'Hon. Sarah Martinez',
  documentId: 'doc-3' as DocumentId,
  isSealed: false,
  createdAt: '2024-12-18T14:00:00Z',
  updatedAt: '2024-12-18T14:00:00Z',
};

const mockSealedEntry: DocketEntry = {
  id: 'docket-3' as DocketId,
  caseId: 'case-123' as CaseId,
  sequenceNumber: 44,
  dateFiled: '2024-12-20',
  entryDate: '2024-12-20',
  description: 'SEALED MOTION in Limine to Exclude Expert Testimony',
  type: 'Filing' as DocketEntryType,
  filedBy: 'Plaintiff',
  isSealed: true,
  createdAt: '2024-12-20T09:00:00Z',
  updatedAt: '2024-12-20T09:00:00Z',
};

const mockHearingEntry: DocketEntry = {
  id: 'docket-4' as DocketId,
  caseId: 'case-123' as CaseId,
  sequenceNumber: 45,
  dateFiled: '2024-12-22',
  entryDate: '2024-12-22',
  description: 'NOTICE of Hearing on Motion for Summary Judgment scheduled for January 15, 2025 at 2:00 PM',
  type: 'Hearing' as DocketEntryType,
  documentId: 'doc-4' as DocumentId,
  isSealed: false,
  createdAt: '2024-12-22T11:00:00Z',
  updatedAt: '2024-12-22T11:00:00Z',
};

/**
 * Default filing entry showing standard motion with documents
 */
export const Filing: Story = {
  args: {
    entry: mockFilingEntry,
    showCaseColumn: false,
    isFocused: false,
  },
};

/**
 * Court order entry with judge information
 */
export const Order: Story = {
  args: {
    entry: mockOrderEntry,
    showCaseColumn: false,
    isFocused: false,
  },
};

/**
 * Sealed document entry showing restricted access
 */
export const SealedDocument: Story = {
  args: {
    entry: mockSealedEntry,
    showCaseColumn: false,
    isFocused: false,
  },
};

/**
 * Hearing notice with deadline indicator
 */
export const Hearing: Story = {
  args: {
    entry: mockHearingEntry,
    showCaseColumn: false,
    isFocused: false,
  },
};

/**
 * Row in focused state for keyboard navigation
 */
export const Focused: Story = {
  args: {
    entry: mockFilingEntry,
    showCaseColumn: false,
    isFocused: true,
  },
};

/**
 * Entry with case column visible (multi-case view)
 */
export const WithCaseColumn: Story = {
  args: {
    entry: mockFilingEntry,
    showCaseColumn: true,
    isFocused: false,
  },
};

/**
 * Entry without any document attachments
 */
export const NoDocuments: Story = {
  args: {
    entry: {
      ...mockFilingEntry,
      documentId: undefined,
    },
    showCaseColumn: false,
    isFocused: false,
  },
};
