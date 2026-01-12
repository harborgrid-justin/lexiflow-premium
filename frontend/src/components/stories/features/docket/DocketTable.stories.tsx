import { DocketTable } from '@/features/cases/components/docket/DocketTable';
import { CaseId, DocketEntry, DocketEntryType, DocketId, DocumentId } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

/**
 * DocketTable provides a virtualized table view for displaying docket entries
 * with infinite scroll, keyboard navigation, and filtering capabilities.
 *
 * ## Features
 * - Virtualized rendering for performance with large datasets
 * - Infinite scroll with load more trigger
 * - Keyboard navigation with arrow keys
 * - Sortable columns
 * - Optional case column for multi-case views
 * - Row selection and actions
 */
const meta = {
  title: 'Docket/DocketTable',
  component: DocketTable,
  parameters: {
    layout: 'fullscreen',
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
    actions: {
      handles: ['onSelectEntry', 'onSelectCaseId', 'onLoadMore'],
    },
    docs: {
      description: {
        component: 'Virtualized table component for displaying and managing docket entries with infinite scroll.',
      },
    },
    test: {
      clearMocks: true,
    },
  },
  tags: ['autodocs']
  argTypes: {
    entries: {
      description: 'Array of docket entries to display',
      control: 'object',
    },
    showCaseColumn: {
      description: 'Show the case column for multi-case view',
      control: 'boolean',
    },
    hasMore: {
      description: 'Whether there are more entries to load',
      control: 'boolean',
    },
    isLoadingMore: {
      description: 'Whether additional entries are currently loading',
      control: 'boolean',
    },
  },
  args: {
    onSelectEntry: fn(),
    onSelectCaseId: fn(),
    onLoadMore: fn(),
  },
} satisfies Meta<typeof DocketTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data generator
const generateMockEntry = (index: number): DocketEntry => {
  const types: DocketEntryType[] = ['Filing', 'Order', 'Hearing', 'Minute Entry', 'Notice'];
  const type = types[index % types.length];

  const descriptions = [
    'MOTION to Dismiss for Failure to State a Claim',
    'ORDER granting Motion for Summary Judgment',
    'NOTICE of Hearing on Motion for Preliminary Injunction',
    'MINUTE ENTRY - Status Conference held',
    'RESPONSE to Motion to Compel Discovery',
    'ORDER denying Motion for Extension of Time',
    'NOTICE of Appearance by Attorney',
    'MOTION in Limine to Exclude Evidence',
  ];

  return {
    id: `docket-${index}` as DocketId,
    caseId: `case-${Math.floor(index / 10)}` as CaseId,
    sequenceNumber: index + 1,
    dateFiled: new Date(2024, 11, 1 + (index % 30)).toISOString().split('T')[0] || '',
    entryDate: new Date(2024, 11, 1 + (index % 30)).toISOString().split('T')[0] || '',
    description: descriptions[index % descriptions.length] || '',
    type: type!,
    filedBy: index % 3 === 0 ? 'Plaintiff' : 'Defendant',
    documentId: index % 4 === 0 ? undefined : (`doc-${index}` as DocumentId),
    isSealed: index % 10 === 0,
    createdAt: new Date(2024, 11, 1 + (index % 30)).toISOString(),
    updatedAt: new Date(2024, 11, 1 + (index % 30)).toISOString(),
  };
};

const mockEntries10 = Array.from({ length: 10 }, (_, i) => generateMockEntry(i));
const mockEntries50 = Array.from({ length: 50 }, (_, i) => generateMockEntry(i));
const mockEntries100 = Array.from({ length: 100 }, (_, i) => generateMockEntry(i));

/**
 * Default view with 10 entries, no infinite scroll
 */
export const Default: Story = {
  args: {
    entries: mockEntries10,
    showCaseColumn: false,
    hasMore: false,
    isLoadingMore: false,
  },
};

/**
 * Large dataset with 50 entries showing virtualization
 */
export const LargeDataset: Story = {
  args: {
    entries: mockEntries50,
    showCaseColumn: false,
    hasMore: true,
    isLoadingMore: false,
  },
};

/**
 * Very large dataset with 100 entries
 */
export const VeryLargeDataset: Story = {
  args: {
    entries: mockEntries100,
    showCaseColumn: false,
    hasMore: true,
    isLoadingMore: false,
  },
};

/**
 * Multi-case view with case column visible
 */
export const MultiCaseView: Story = {
  args: {
    entries: mockEntries50,
    showCaseColumn: true,
    hasMore: false,
    isLoadingMore: false,
  },
};

/**
 * Loading more entries state
 */
export const LoadingMore: Story = {
  args: {
    entries: mockEntries50,
    showCaseColumn: false,
    hasMore: true,
    isLoadingMore: true,
  },
};

/**
 * Empty state with no entries
 */
export const Empty: Story = {
  args: {
    entries: [],
    showCaseColumn: false,
    hasMore: false,
    isLoadingMore: false,
  },
};

/**
 * Single entry in table
 */
export const SingleEntry: Story = {
  args: {
    entries: [generateMockEntry(0)],
    showCaseColumn: false,
    hasMore: false,
    isLoadingMore: false,
  },
};

/**
 * Mixed entry types showing various docket entries
 */
export const MixedTypes: Story = {
  args: {
    entries: [
      { ...generateMockEntry(0), type: 'Filing' as DocketEntryType },
      { ...generateMockEntry(1), type: 'Order' as DocketEntryType },
      { ...generateMockEntry(2), type: 'Hearing' as DocketEntryType },
      { ...generateMockEntry(3), type: 'Minute Entry' as DocketEntryType },
      { ...generateMockEntry(4), type: 'Notice' as DocketEntryType },
    ],
    showCaseColumn: false,
    hasMore: false,
    isLoadingMore: false,
  },
};
