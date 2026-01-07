/**
 * DocumentRow Component Tests
 * Enterprise-grade test suite for document table row display
 *
 * @module components/features/documents/DocumentRow.test
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentRow } from './DocumentRow';
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

describe('DocumentRow', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-123',
    title: 'Contract Agreement.pdf',
    description: 'Standard contract agreement template',
    type: 'Contract',
    status: 'Final',
    fileSize: '2.5 MB',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    author: 'John Attorney',
    tags: ['important', 'signed'],
    isRedacted: false,
    ocrProcessed: true,
    caseId: 'case-456',
  };

  const defaultProps = {
    document: mockDocument,
    onDelete: jest.fn(),
    onDownload: jest.fn(),
    selected: false,
    onSelect: jest.fn(),
  };

  // Helper to render in table context
  const renderInTable = (ui: React.ReactElement) => {
    return render(
      <table>
        <tbody>{ui}</tbody>
      </table>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render document title', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
    });

    it('should render document title as link', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const link = screen.getByRole('link', { name: /Contract Agreement.pdf/ });
      expect(link).toHaveAttribute('href', '/documents/doc-123');
    });

    it('should render document description', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Standard contract agreement template')).toBeInTheDocument();
    });

    it('should render document type', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Contract')).toBeInTheDocument();
    });

    it('should render file size', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    });

    it('should render last modified date', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should render status badge when status is provided', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should not render status badge when status is not provided', () => {
      const docWithoutStatus = { ...mockDocument, status: undefined };
      renderInTable(<DocumentRow document={docWithoutStatus} />);

      expect(screen.queryByText('Final')).not.toBeInTheDocument();
    });

    it('should apply green color for Final status', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const badge = screen.getByText('Final');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply green color for Signed status', () => {
      const signedDoc = { ...mockDocument, status: 'Signed' };
      renderInTable(<DocumentRow document={signedDoc} />);

      const badge = screen.getByText('Signed');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply gray color for Draft status', () => {
      const draftDoc = { ...mockDocument, status: 'Draft' };
      renderInTable(<DocumentRow document={draftDoc} />);

      const badge = screen.getByText('Draft');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply yellow color for Review status', () => {
      const reviewDoc = { ...mockDocument, status: 'Review' };
      renderInTable(<DocumentRow document={reviewDoc} />);

      const badge = screen.getByText('Review');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply blue color for Filed status', () => {
      const filedDoc = { ...mockDocument, status: 'Filed' };
      renderInTable(<DocumentRow document={filedDoc} />);

      const badge = screen.getByText('Filed');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });
  });

  describe('Indicators', () => {
    it('should show P indicator for privileged documents', () => {
      const privilegedDoc = { ...mockDocument, isRedacted: true };
      renderInTable(<DocumentRow document={privilegedDoc} />);

      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should not show P indicator when not privileged', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.queryByText('P')).not.toBeInTheDocument();
    });

    it('should have title attribute for privileged indicator', () => {
      const privilegedDoc = { ...mockDocument, isRedacted: true };
      renderInTable(<DocumentRow document={privilegedDoc} />);

      const indicator = screen.getByText('P');
      expect(indicator).toHaveAttribute('title', 'Privileged');
    });

    it('should show OCR indicator when ocrProcessed is true', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByText('OCR')).toBeInTheDocument();
    });

    it('should not show OCR indicator when not processed', () => {
      const noOcrDoc = { ...mockDocument, ocrProcessed: false };
      renderInTable(<DocumentRow document={noOcrDoc} />);

      expect(screen.queryByText('OCR')).not.toBeInTheDocument();
    });

    it('should have title attribute for OCR indicator', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const indicator = screen.getByText('OCR');
      expect(indicator).toHaveAttribute('title', 'OCR Processed');
    });
  });

  describe('Selection', () => {
    it('should render checkbox when onSelect is provided', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should not render checkbox when onSelect is not provided', () => {
      const propsWithoutSelect = { ...defaultProps, onSelect: undefined };
      renderInTable(<DocumentRow {...propsWithoutSelect} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should be checked when selected is true', () => {
      renderInTable(<DocumentRow {...defaultProps} selected />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should be unchecked when selected is false', () => {
      renderInTable(<DocumentRow {...defaultProps} selected={false} />);

      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should call onSelect with document id when clicked', async () => {
      const user = userEvent.setup();
      renderInTable(<DocumentRow {...defaultProps} />);

      await user.click(screen.getByRole('checkbox'));

      expect(defaultProps.onSelect).toHaveBeenCalledWith('doc-123');
    });

    it('should have selected row styling when selected', () => {
      renderInTable(<DocumentRow {...defaultProps} selected />);

      const row = screen.getByRole('row');
      expect(row).toHaveClass('bg-blue-50');
    });
  });

  describe('Actions', () => {
    it('should render download button', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByTitle('Download')).toBeInTheDocument();
    });

    it('should call onDownload when download button is clicked', async () => {
      const user = userEvent.setup();
      renderInTable(<DocumentRow {...defaultProps} />);

      await user.click(screen.getByTitle('Download'));

      expect(defaultProps.onDownload).toHaveBeenCalledWith('doc-123');
    });

    it('should render delete button when onDelete is provided', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    it('should not render delete button when onDelete is not provided', () => {
      const propsWithoutDelete = { ...defaultProps, onDelete: undefined };
      renderInTable(<DocumentRow {...propsWithoutDelete} />);

      expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderInTable(<DocumentRow {...defaultProps} />);

      await user.click(screen.getByTitle('Delete'));

      expect(defaultProps.onDelete).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('Styling', () => {
    it('should have hover effect', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const row = screen.getByRole('row');
      expect(row).toHaveClass('hover:bg-gray-50');
    });

    it('should have dark mode hover effect', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const row = screen.getByRole('row');
      expect(row).toHaveClass('dark:hover:bg-gray-800/50');
    });

    it('should have border styling', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      const row = screen.getByRole('row');
      expect(row).toHaveClass('border-b');
    });
  });

  describe('Edge Cases', () => {
    it('should handle document without description', () => {
      const docWithoutDesc = { ...mockDocument, description: undefined };
      renderInTable(<DocumentRow document={docWithoutDesc} />);

      expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
      expect(screen.queryByText('Standard contract agreement template')).not.toBeInTheDocument();
    });

    it('should handle document without file size', () => {
      const docWithoutSize = { ...mockDocument, fileSize: undefined };
      renderInTable(<DocumentRow document={docWithoutSize} />);

      // Row should still render
      expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
    });

    it('should truncate long descriptions', () => {
      const longDescDoc = {
        ...mockDocument,
        description: 'This is a very long description that should be truncated to fit in the table cell properly without breaking the layout',
      };
      renderInTable(<DocumentRow document={longDescDoc} />);

      const description = screen.getByText(/This is a very long description/);
      expect(description).toHaveClass('line-clamp-1');
    });
  });

  describe('Document Icon', () => {
    it('should render document icon', () => {
      renderInTable(<DocumentRow {...defaultProps} />);

      // Check that SVG icon is present
      const row = screen.getByRole('row');
      const svg = row.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
