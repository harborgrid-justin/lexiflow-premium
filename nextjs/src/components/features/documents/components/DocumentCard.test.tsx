/**
 * DocumentCard Component Tests
 * Enterprise-grade test suite for document card display
 *
 * @module components/features/documents/DocumentCard.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from './DocumentCard';
import type { LegalDocument } from '@/types/documents';

// Mock react-router Link
jest.mock('react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

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

describe('DocumentCard', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-123',
    title: 'Contract Agreement.pdf',
    type: 'Contract',
    status: 'Final',
    fileSize: '2.5 MB',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    author: 'John Attorney',
    tags: ['important', 'contract', 'signed'],
    isRedacted: false,
    ocrProcessed: true,
    caseId: 'case-456',
  };

  const defaultProps = {
    document: mockDocument,
    onDelete: jest.fn(),
    onDownload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render document title', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
    });

    it('should render document type', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Contract')).toBeInTheDocument();
    });

    it('should render file size', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    });

    it('should render last modified date', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText(/Modified:/)).toBeInTheDocument();
    });

    it('should link to document detail page', () => {
      render(<DocumentCard {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Contract Agreement.pdf/ });
      expect(link).toHaveAttribute('href', '/documents/doc-123');
    });
  });

  describe('Document Icon', () => {
    it('should render PDF icon for PDF documents', () => {
      const pdfDoc = { ...mockDocument, type: 'PDF Document' };
      render(<DocumentCard document={pdfDoc} />);

      // PDF icon contains 'PDF' text
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('should render generic icon for non-PDF documents', () => {
      const wordDoc = { ...mockDocument, type: 'Word Document' };
      render(<DocumentCard document={wordDoc} />);

      // Should not have PDF text
      expect(screen.queryByText('PDF')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should render status badge when status is provided', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should not render status badge when status is not provided', () => {
      const docWithoutStatus = { ...mockDocument, status: undefined };
      render(<DocumentCard document={docWithoutStatus} />);

      expect(screen.queryByText('Final')).not.toBeInTheDocument();
    });

    it('should apply green color for Final status', () => {
      render(<DocumentCard {...defaultProps} />);

      const badge = screen.getByText('Final');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply green color for Signed status', () => {
      const signedDoc = { ...mockDocument, status: 'Signed' };
      render(<DocumentCard document={signedDoc} />);

      const badge = screen.getByText('Signed');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply gray color for Draft status', () => {
      const draftDoc = { ...mockDocument, status: 'Draft' };
      render(<DocumentCard document={draftDoc} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply yellow color for Review status', () => {
      const reviewDoc = { ...mockDocument, status: 'Review' };
      render(<DocumentCard document={reviewDoc} />);

      const badge = screen.getByText('Review');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply blue color for Filed status', () => {
      const filedDoc = { ...mockDocument, status: 'Filed' };
      render(<DocumentCard document={filedDoc} />);

      const badge = screen.getByText('Filed');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Privilege Indicator', () => {
    it('should show Privileged badge when isRedacted is true', () => {
      const privilegedDoc = { ...mockDocument, isRedacted: true };
      render(<DocumentCard document={privilegedDoc} />);

      expect(screen.getByText('Privileged')).toBeInTheDocument();
    });

    it('should not show Privileged badge when isRedacted is false', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.queryByText('Privileged')).not.toBeInTheDocument();
    });
  });

  describe('OCR Indicator', () => {
    it('should show OCR badge when ocrProcessed is true', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('OCR')).toBeInTheDocument();
    });

    it('should not show OCR badge when ocrProcessed is false', () => {
      const noOcrDoc = { ...mockDocument, ocrProcessed: false };
      render(<DocumentCard document={noOcrDoc} />);

      expect(screen.queryByText('OCR')).not.toBeInTheDocument();
    });
  });

  describe('Tags', () => {
    it('should render tags', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('contract')).toBeInTheDocument();
      expect(screen.getByText('signed')).toBeInTheDocument();
    });

    it('should show only first 3 tags', () => {
      const docWithManyTags = {
        ...mockDocument,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      render(<DocumentCard document={docWithManyTags} />);

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      expect(screen.queryByText('tag4')).not.toBeInTheDocument();
    });

    it('should show +N indicator for hidden tags', () => {
      const docWithManyTags = {
        ...mockDocument,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      render(<DocumentCard document={docWithManyTags} />);

      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not render tags section when no tags exist', () => {
      const docWithoutTags = { ...mockDocument, tags: [] };
      render(<DocumentCard document={docWithoutTags} />);

      expect(screen.queryByText('important')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should render checkbox when onSelect is provided', () => {
      const onSelect = jest.fn();
      render(<DocumentCard {...defaultProps} onSelect={onSelect} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should not render checkbox when onSelect is not provided', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should be checked when selected prop is true', () => {
      const onSelect = jest.fn();
      render(<DocumentCard {...defaultProps} onSelect={onSelect} selected />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should be unchecked when selected prop is false', () => {
      const onSelect = jest.fn();
      render(<DocumentCard {...defaultProps} onSelect={onSelect} selected={false} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should call onSelect when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<DocumentCard {...defaultProps} onSelect={onSelect} />);

      await user.click(screen.getByRole('checkbox'));

      expect(onSelect).toHaveBeenCalledWith('doc-123');
    });

    it('should have selected ring styling when selected', () => {
      const onSelect = jest.fn();
      const { container } = render(
        <DocumentCard {...defaultProps} onSelect={onSelect} selected />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('ring-2', 'ring-blue-500');
    });
  });

  describe('Actions', () => {
    it('should render Download button', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    it('should call onDownload when Download button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentCard {...defaultProps} />);

      await user.click(screen.getByText('Download'));

      expect(defaultProps.onDownload).toHaveBeenCalledWith('doc-123');
    });

    it('should render Delete button when onDelete is provided', () => {
      render(<DocumentCard {...defaultProps} />);

      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('should not render Delete button when onDelete is not provided', () => {
      const propsWithoutDelete = { ...defaultProps, onDelete: undefined };
      render(<DocumentCard {...propsWithoutDelete} />);

      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
    });

    it('should call onDelete when Delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<DocumentCard {...defaultProps} />);

      await user.click(screen.getByTitle('Delete'));

      expect(defaultProps.onDelete).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('Styling', () => {
    it('should have card styling', () => {
      const { container } = render(<DocumentCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-white', 'shadow-sm');
    });

    it('should have hover shadow effect', () => {
      const { container } = render(<DocumentCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-md');
    });

    it('should have dark mode support', () => {
      const { container } = render(<DocumentCard {...defaultProps} />);

      const card = container.firstChild;
      expect(card).toHaveClass('dark:bg-gray-800', 'dark:border-gray-700');
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

      render(<DocumentCard document={minimalDoc} />);

      expect(screen.getByText('Minimal Document')).toBeInTheDocument();
    });

    it('should handle long title', () => {
      const longTitleDoc = {
        ...mockDocument,
        title: 'This is a Very Long Document Title That Should Be Truncated or Wrapped Properly',
      };

      render(<DocumentCard document={longTitleDoc} />);

      expect(screen.getByText(/This is a Very Long/)).toBeInTheDocument();
    });
  });
});
