/**
 * Document Grid Card Component Story
 * 
 * Individual document card used in grid view.
 */

import { fn } from 'storybook/test';

import { ThemeProvider } from "@/providers/infrastructure/ThemeProvider";
import { type LegalDocument } from '@/types';

import { DocumentGridCard } from '../../../../features/operations/documents/DocumentGridCard';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DocumentGridCard> = {
  title: 'Documents/Document Grid Card',
  component: DocumentGridCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'neutral',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'neutral', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    docs: {
      description: {
        component: 'Document card component for grid view display with selection, preview, and metadata.'
      }
    },
  },
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the document is selected'
    }
  }
};

export default meta;
type Story = StoryObj<typeof DocumentGridCard>;

const mockDocument: LegalDocument = {
  id: '1' as unknown as LegalDocument['id'],
  title: 'Motion to Dismiss.pdf',
  type: 'Pleading',
  status: 'Active',
  fileSize: '245KB',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  uploadDate: '2024-01-15',
  lastModified: '2024-01-20',
  creatorId: 'user1' as unknown as LegalDocument['creatorId'],
  caseId: 'case1' as unknown as LegalDocument['caseId'],
  content: '',
  tags: ['motion', 'civil', 'litigation'],
  versions: []
};

/**
 * Default document card.
 */
export const Default: Story = {
  args: {
    doc: mockDocument,
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * Selected document card.
 */
export const Selected: Story = {
  args: {
    doc: mockDocument,
    isSelected: true,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * PDF document.
 */
export const PDFDocument: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Contract Agreement.pdf',
      type: 'Contract',
      fileSize: '1.2MB'
    },
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * Word document.
 */
export const WordDocument: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Legal Brief.docx',
      type: 'Brief',
      fileSize: '456KB'
    },
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * Large file size.
 */
export const LargeFile: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Discovery Documents.zip',
      type: 'Evidence',
      fileSize: '24.5MB',
      status: 'Archived'
    },
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * Long filename.
 */
export const LongFilename: Story = {
  args: {
    doc: {
      ...mockDocument,
      title: 'Very Long Document Title That Should Be Truncated In The Display Area.pdf',
      type: 'Pleading',
      fileSize: '128KB'
    },
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  }
};

/**
 * Dark theme variant.
 */
export const DarkTheme: Story = {
  args: {
    doc: mockDocument,
    isSelected: false,
    onToggleSelection: fn(),
    onPreview: fn()
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};

/**
 * Grid of multiple cards.
 */
export const GridLayout: Story = {
  render: () => (
    <ThemeProvider>
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="w-full h-64">
          <DocumentGridCard
            doc={mockDocument}
            isSelected={false}
            onToggleSelection={fn()}
            onPreview={fn()}
          />
        </div>
        <div className="w-full h-64">
          <DocumentGridCard
            doc={{ ...mockDocument, id: '2' as unknown as LegalDocument['id'], title: 'Brief.pdf' }}
            isSelected={true}
            onToggleSelection={fn()}
            onPreview={fn()}
          />
        </div>
        <div className="w-full h-64">
          <DocumentGridCard
            doc={{ ...mockDocument, id: '3' as unknown as LegalDocument['id'], title: 'Evidence.pdf' }}
            isSelected={false}
            onToggleSelection={fn()}
            onPreview={fn()}
          />
        </div>
      </div>
    </ThemeProvider>
  )
};
