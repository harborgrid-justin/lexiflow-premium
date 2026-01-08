/**
 * Document Row Component Story
 *
 * Individual document row for table view with actions.
 */

import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { CaseId, DocumentId, LegalDocument, UserId } from '@/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentRow } from '../../../../features/operations/documents/table/DocumentRow';

// Wrapper to provide theme to DocumentRow
const DocumentRowWrapper = (props: React.ComponentProps<typeof DocumentRow>) => {
  return <DocumentRow {...props} />;
};

const meta: Meta<typeof DocumentRowWrapper> = {
  title: 'Documents/Document Row',
  component: DocumentRowWrapper,
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
        component: 'Document row component with selection, status badges, and action buttons.'
      }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="border rounded-lg p-2">
          <Story />
        </div>
      </ThemeProvider>
    )
  ],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the document is selected'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentRowWrapper>;

const mockDocument: LegalDocument = {
  id: '1' as DocumentId,
  title: 'Motion to Dismiss.pdf',
  type: 'Pleading',
  status: 'Signed',
  sourceModule: 'Pleadings',
  fileSize: '245KB',
  lastModified: '2024-12-20',
  uploadDate: '2024-12-15',
  createdAt: '2024-12-15',
  updatedAt: '2024-12-20',
  creatorId: 'user1' as UserId,
  caseId: 'case1' as CaseId,
  content: '',
  tags: ['motion', 'civil'],
  versions: []
};

/**
 * Default unselected document row.
 */
export const Default: Story = {
  args: {
    doc: mockDocument,
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Selected document row.
 */
export const Selected: Story = {
  args: {
    doc: mockDocument,
    isSelected: true,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Draft status document.
 */
export const Draft: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Draft Brief.docx',
      status: 'Draft',
      sourceModule: 'Documents'
    },
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Discovery document.
 */
export const Discovery: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Discovery Request.pdf',
      type: 'Discovery',
      status: 'Active',
      sourceModule: 'Discovery'
    },
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Evidence document.
 */
export const Evidence: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Evidence Photo 001.jpg',
      type: 'Evidence',
      status: 'Active',
      sourceModule: 'Evidence',
      fileSize: '2.4MB'
    },
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Long filename document.
 */
export const LongFilename: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Very Long Document Title That Should Be Truncated In The Display Area For Better UX.pdf'
    },
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Large file size.
 */
export const LargeFile: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Deposition Video.mp4',
      type: 'Evidence',
      fileSize: '245MB',
      sourceModule: 'Evidence'
    },
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    doc: mockDocument,
    isSelected: false,
    toggleSelection: fn(),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};
