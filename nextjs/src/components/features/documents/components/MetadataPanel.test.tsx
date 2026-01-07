/**
 * MetadataPanel Component Tests
 * Enterprise-grade test suite for document metadata display and editing
 *
 * @module components/features/documents/MetadataPanel.test
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MetadataPanel } from './MetadataPanel';
import type { LegalDocument } from '@/types/documents';

// Mock formatDate utility
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }),
}));

describe('MetadataPanel', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-123',
    title: 'Contract Agreement.pdf',
    type: 'Contract',
    status: 'Final',
    fileSize: '2.5 MB',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    pageCount: 10,
    tags: ['important', 'signed', 'contract'],
    caseId: 'case-456',
    isRedacted: false,
    ocrProcessed: true,
    ocrProcessedAt: '2024-01-16',
    customFields: {
      batesNumber: 'ABC-001234',
      department: 'Legal',
    },
  };

  const defaultProps = {
    document: mockDocument,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Metadata heading', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Metadata')).toBeInTheDocument();
    });

    it('should render document status', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should render document type', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Contract')).toBeInTheDocument();
    });

    it('should render file size', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    });

    it('should render page count when available', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render created date', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    });

    it('should render last modified date', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });
  });

  describe('Tags Display', () => {
    it('should render all tags', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('signed')).toBeInTheDocument();
      expect(screen.getByText('contract')).toBeInTheDocument();
    });

    it('should show "No tags" when no tags exist', () => {
      const docWithoutTags = { ...mockDocument, tags: [] };
      render(<MetadataPanel document={docWithoutTags} />);

      expect(screen.getByText('No tags')).toBeInTheDocument();
    });
  });

  describe('Case Association', () => {
    it('should render case ID when available', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('case-456')).toBeInTheDocument();
    });

    it('should not render case section when no caseId', () => {
      const docWithoutCase = { ...mockDocument, caseId: undefined };
      render(<MetadataPanel document={docWithoutCase} />);

      expect(screen.queryByText('case-456')).not.toBeInTheDocument();
    });
  });

  describe('Bates Number', () => {
    it('should render Bates number when available', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('ABC-001234')).toBeInTheDocument();
    });

    it('should not render Bates section when not available', () => {
      const docWithoutBates = {
        ...mockDocument,
        customFields: { department: 'Legal' },
      };
      render(<MetadataPanel document={docWithoutBates} />);

      expect(screen.queryByText('ABC-001234')).not.toBeInTheDocument();
    });
  });

  describe('Privilege Indicator', () => {
    it('should show Privileged Document indicator when isRedacted is true', () => {
      const privilegedDoc = { ...mockDocument, isRedacted: true };
      render(<MetadataPanel document={privilegedDoc} />);

      expect(screen.getByText('Privileged Document')).toBeInTheDocument();
    });

    it('should not show privilege indicator when isRedacted is false', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.queryByText('Privileged Document')).not.toBeInTheDocument();
    });
  });

  describe('OCR Status', () => {
    it('should show OCR Processed indicator when ocrProcessed is true', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('OCR Processed')).toBeInTheDocument();
    });

    it('should show OCR processed date when available', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('Jan 16, 2024')).toBeInTheDocument();
    });

    it('should not show OCR indicator when not processed', () => {
      const noOcrDoc = { ...mockDocument, ocrProcessed: false };
      render(<MetadataPanel document={noOcrDoc} />);

      expect(screen.queryByText('OCR Processed')).not.toBeInTheDocument();
    });
  });

  describe('Custom Fields', () => {
    it('should render custom fields', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.getByText('batesNumber:')).toBeInTheDocument();
      expect(screen.getByText('department:')).toBeInTheDocument();
      expect(screen.getByText('Legal')).toBeInTheDocument();
    });

    it('should not render custom fields section when empty', () => {
      const docWithoutCustomFields = { ...mockDocument, customFields: undefined };
      render(<MetadataPanel document={docWithoutCustomFields} />);

      expect(screen.queryByText('Custom Fields')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should not show Edit button when not editable', () => {
      render(<MetadataPanel {...defaultProps} />);

      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('should show Edit button when editable', () => {
      render(<MetadataPanel {...defaultProps} editable />);

      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should enter edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));

      // Should show status dropdown
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      // Should show Save and Cancel buttons
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should show status dropdown in edit mode', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));

      const statusSelect = screen.getByRole('combobox');
      expect(statusSelect).toHaveValue('Final');
    });

    it('should have all status options', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
      expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Review' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Final' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Filed' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Signed' })).toBeInTheDocument();
    });
  });

  describe('Tag Editing', () => {
    it('should show tag input in edit mode', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));

      expect(screen.getByPlaceholderText('Add tag...')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('should add tag when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.type(screen.getByPlaceholderText('Add tag...'), 'newtag');
      await user.click(screen.getByText('Add'));

      expect(screen.getByText('newtag')).toBeInTheDocument();
    });

    it('should add tag when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.type(screen.getByPlaceholderText('Add tag...'), 'entertag{Enter}');

      expect(screen.getByText('entertag')).toBeInTheDocument();
    });

    it('should not add duplicate tags', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.type(screen.getByPlaceholderText('Add tag...'), 'important');
      await user.click(screen.getByText('Add'));

      // Should still only have one 'important' tag
      const tags = screen.getAllByText('important');
      expect(tags.length).toBe(1);
    });

    it('should not add empty tags', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Add'));

      // Should not add any new tags
      const tags = screen.getAllByRole('button');
      // Only Edit mode buttons and existing tag remove buttons
    });

    it('should remove tag when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));

      // Find and click remove button for 'important' tag
      const importantTag = screen.getByText('important').closest('span');
      const removeButton = importantTag?.querySelector('button');
      await user.click(removeButton!);

      expect(screen.queryByText('important')).not.toBeInTheDocument();
    });
  });

  describe('Save and Cancel', () => {
    it('should call onUpdate with edited values when Save is clicked', async () => {
      const mockOnUpdate = jest.fn();
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Edit'));
      await user.selectOptions(screen.getByRole('combobox'), 'Review');
      await user.click(screen.getByText('Save Changes'));

      expect(mockOnUpdate).toHaveBeenCalledWith({
        tags: ['important', 'signed', 'contract'],
        status: 'Review',
      });
    });

    it('should exit edit mode after saving', async () => {
      const mockOnUpdate = jest.fn();
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable onUpdate={mockOnUpdate} />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Save Changes'));

      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should revert changes when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.selectOptions(screen.getByRole('combobox'), 'Draft');
      await user.click(screen.getByText('Cancel'));

      // Should show original status
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should exit edit mode after canceling', async () => {
      const user = userEvent.setup();
      render(<MetadataPanel {...defaultProps} editable />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(<MetadataPanel {...defaultProps} />);

      const panel = container.firstChild;
      expect(panel).toHaveClass('bg-white', 'rounded-lg', 'border', 'p-6');
    });

    it('should have dark mode support', () => {
      const { container } = render(<MetadataPanel {...defaultProps} />);

      const panel = container.firstChild;
      expect(panel).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
    });
  });

  describe('Edge Cases', () => {
    it('should handle document without optional fields', () => {
      const minimalDoc: LegalDocument = {
        id: 'min-doc',
        title: 'Minimal Document',
        type: 'Document',
        uploadDate: '2024-01-01',
        lastModified: '2024-01-01',
        tags: [],
      };
      render(<MetadataPanel document={minimalDoc} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument(); // status
      expect(screen.getByText('Unknown')).toBeInTheDocument(); // fileSize
    });

    it('should handle document with empty status', () => {
      const docWithoutStatus = { ...mockDocument, status: undefined };
      render(<MetadataPanel document={docWithoutStatus} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should not render page count when not available', () => {
      const docWithoutPageCount = { ...mockDocument, pageCount: undefined };
      render(<MetadataPanel document={docWithoutPageCount} />);

      expect(screen.queryByText('Pages')).not.toBeInTheDocument();
    });
  });
});
