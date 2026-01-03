/**
 * Document Table Component Story
 * 
 * Sortable table view for document listing with selection and actions.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DocumentTable } from '@features/operations/documents/table/DocumentTable';
import { ThemeProvider } from '@/contexts/theme/ThemeContext';
import { LegalDocument, DocumentId, UserId, CaseId } from '@/types';

const meta: Meta<typeof DocumentTable> = {
  title: 'Documents/Document Table',
  component: DocumentTable,
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
        component: 'Sortable document table with selection, virtual scrolling, and row actions.'
      }
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="h-screen">
          <Story />
        </div>
      </ThemeProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof DocumentTable>;

const mockDocuments: LegalDocument[] = [
  {
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
  },
  {
    id: '2' as DocumentId,
    title: 'Discovery Request.docx',
    type: 'Discovery',
    status: 'Draft',
    sourceModule: 'Discovery',
    fileSize: '128KB',
    lastModified: '2024-12-19',
    uploadDate: '2024-12-18',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-19',
    creatorId: 'user1' as UserId,
    caseId: 'case1' as CaseId,
    content: '',
    tags: ['discovery'],
    versions: []
  },
  {
    id: '3' as DocumentId,
    title: 'Evidence Photo 001.jpg',
    type: 'Evidence',
    status: 'Active',
    sourceModule: 'Evidence',
    fileSize: '2.4MB',
    lastModified: '2024-12-18',
    uploadDate: '2024-12-10',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-18',
    creatorId: 'user2' as UserId,
    caseId: 'case1' as CaseId,
    content: '',
    tags: ['evidence', 'photo'],
    versions: []
  },
  {
    id: '4' as DocumentId,
    title: 'Client Agreement.pdf',
    type: 'Contract',
    status: 'Signed',
    sourceModule: 'Documents',
    fileSize: '567KB',
    lastModified: '2024-12-17',
    uploadDate: '2024-12-01',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-17',
    creatorId: 'user1' as UserId,
    caseId: 'case2' as CaseId,
    content: '',
    tags: ['contract', 'agreement'],
    versions: []
  },
  {
    id: '5' as DocumentId,
    title: 'Deposition Transcript.pdf',
    type: 'Discovery',
    status: 'Active',
    sourceModule: 'Discovery',
    fileSize: '1.8MB',
    lastModified: '2024-12-16',
    uploadDate: '2024-12-16',
    createdAt: '2024-12-16',
    updatedAt: '2024-12-16',
    creatorId: 'user3' as UserId,
    caseId: 'case1' as CaseId,
    content: '',
    tags: ['deposition', 'transcript'],
    versions: []
  }
];

/**
 * Default table with documents.
 */
export const Default: Story = {
  args: {
    documents: mockDocuments,
    viewMode: 'list',
    selectedDocs: [],
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: false,
    isSelected: () => false,
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * With some documents selected.
 */
export const WithSelection: Story = {
  args: {
    documents: mockDocuments,
    viewMode: 'list',
    selectedDocs: ['1', '3'],
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: false,
    isSelected: (id: string) => ['1', '3'].includes(id),
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * All documents selected.
 */
export const AllSelected: Story = {
  args: {
    documents: mockDocuments,
    viewMode: 'list',
    selectedDocs: mockDocuments.map(d => d.id),
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: true,
    isSelected: () => true,
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Empty table state.
 */
export const Empty: Story = {
  args: {
    documents: [],
    viewMode: 'list',
    selectedDocs: [],
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: false,
    isSelected: () => false,
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  }
};

/**
 * Large dataset with many documents.
 */
export const LargeDataset: Story = {
  args: {
    documents: Array.from({ length: 100 }, (_, i) => ({
      id: `doc-${i}` as DocumentId,
      title: `Document ${i + 1}.pdf`,
      type: ['Pleading', 'Discovery', 'Evidence', 'Contract'][i % 4] as LegalDocument['type'],
      status: ['Signed', 'Draft', 'Active'][i % 3] as LegalDocument['status'],
      sourceModule: ['Pleadings', 'Discovery', 'Evidence', 'Documents'][i % 4],
      fileSize: `${Math.floor(Math.random() * 1000)}KB`,
      lastModified: `2024-12-${String(20 - (i % 20)).padStart(2, '0')}`,
      uploadDate: '2024-12-01',
      createdAt: '2024-12-01',
      updatedAt: `2024-12-${String(20 - (i % 20)).padStart(2, '0')}`,
      creatorId: `user${(i % 3) + 1}` as UserId,
      caseId: `case${(i % 2) + 1}` as CaseId,
      content: '',
      tags: ['doc', `tag${i % 5}`],
      versions: []
    })),
    viewMode: 'list',
    selectedDocs: [],
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: false,
    isSelected: () => false,
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
    documents: mockDocuments,
    viewMode: 'list',
    selectedDocs: [],
    toggleSelection: fn(),
    selectAll: fn(),
    isAllSelected: false,
    isSelected: () => false,
    setSelectedDocForHistory: fn(),
    setTaggingDoc: fn(),
    onRowClick: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};
