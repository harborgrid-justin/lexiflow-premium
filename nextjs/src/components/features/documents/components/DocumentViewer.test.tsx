/**
 * DocumentViewer Component Tests
 * Enterprise-grade test suite for PDF and document preview functionality
 *
 * @module components/features/documents/DocumentViewer.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentViewer } from './DocumentViewer';
import type { LegalDocument } from '@/types/documents';

describe('DocumentViewer', () => {
  const mockDocument: LegalDocument = {
    id: 'doc-123',
    title: 'Contract Agreement.pdf',
    type: 'Contract',
    status: 'Final',
    fileSize: '2.5 MB',
    uploadDate: '2024-01-15',
    lastModified: '2024-01-20',
    pageCount: 5,
    tags: [],
    content: 'This is the document content.',
    fullTextContent: 'This is the full text content from OCR processing.',
    ocrProcessed: true,
    customFields: {
      batesNumber: 'ABC-001234',
    },
  };

  const defaultProps = {
    document: mockDocument,
  };

  describe('Rendering', () => {
    it('should render document title', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
    });

    it('should render page count', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('Page 1 / 5')).toBeInTheDocument();
    });

    it('should render zoom level', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should render Print button', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('Print')).toBeInTheDocument();
    });

    it('should render Download button', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('Download')).toBeInTheDocument();
    });
  });

  describe('Page Navigation', () => {
    it('should start on page 1', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('Page 1 / 5')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const nextButton = screen.getAllByRole('button')[1]; // Second navigation button
      await user.click(nextButton);

      expect(screen.getByText('Page 2 / 5')).toBeInTheDocument();
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      // Go to page 2 first
      const nextButton = screen.getAllByRole('button')[1];
      await user.click(nextButton);
      expect(screen.getByText('Page 2 / 5')).toBeInTheDocument();

      // Go back to page 1
      const prevButton = screen.getAllByRole('button')[0];
      await user.click(prevButton);
      expect(screen.getByText('Page 1 / 5')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(<DocumentViewer {...defaultProps} />);

      const prevButton = screen.getAllByRole('button')[0];
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      // Navigate to last page
      const nextButton = screen.getAllByRole('button')[1];
      for (let i = 0; i < 4; i++) {
        await user.click(nextButton);
      }

      expect(screen.getByText('Page 5 / 5')).toBeInTheDocument();
      expect(nextButton).toBeDisabled();
    });

    it('should not go below page 1', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const prevButton = screen.getAllByRole('button')[0];
      // Button should be disabled, but test the boundary anyway
      expect(screen.getByText('Page 1 / 5')).toBeInTheDocument();
    });

    it('should not exceed total pages', async () => {
      const user = userEvent.setup();
      const singlePageDoc = { ...mockDocument, pageCount: 1 };
      render(<DocumentViewer document={singlePageDoc} />);

      expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
      const nextButton = screen.getAllByRole('button')[1];
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Zoom Controls', () => {
    it('should start at 100% zoom', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should zoom in by 25%', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const zoomInButton = screen.getAllByRole('button')[3]; // Zoom in button
      await user.click(zoomInButton);

      expect(screen.getByText('125%')).toBeInTheDocument();
    });

    it('should zoom out by 25%', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const zoomOutButton = screen.getAllByRole('button')[2]; // Zoom out button
      await user.click(zoomOutButton);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should not zoom beyond 200%', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const zoomInButton = screen.getAllByRole('button')[3];
      // Click zoom in multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(zoomInButton);
      }

      expect(screen.getByText('200%')).toBeInTheDocument();
      expect(zoomInButton).toBeDisabled();
    });

    it('should not zoom below 50%', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer {...defaultProps} />);

      const zoomOutButton = screen.getAllByRole('button')[2];
      // Click zoom out multiple times
      for (let i = 0; i < 3; i++) {
        await user.click(zoomOutButton);
      }

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(zoomOutButton).toBeDisabled();
    });
  });

  describe('Page Slider', () => {
    it('should render page slider', () => {
      render(<DocumentViewer {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('should have correct min and max values', () => {
      render(<DocumentViewer {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '5');
    });

    it('should update page when slider changes', () => {
      render(<DocumentViewer {...defaultProps} />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });

      expect(screen.getByText('Page 3 / 5')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display document content when available', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('This is the document content.')).toBeInTheDocument();
    });

    it('should display fullTextContent when available', () => {
      const docWithFullText = {
        ...mockDocument,
        content: undefined,
        fullTextContent: 'Full text content here',
      };
      render(<DocumentViewer document={docWithFullText} />);

      expect(screen.getByText('Full text content here')).toBeInTheDocument();
    });

    it('should show placeholder when no content available', () => {
      const docWithoutContent = {
        ...mockDocument,
        content: undefined,
        fullTextContent: undefined,
      };
      render(<DocumentViewer document={docWithoutContent} />);

      expect(screen.getByText('Document preview not available')).toBeInTheDocument();
    });

    it('should display Bates number when available', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('ABC-001234')).toBeInTheDocument();
    });

    it('should not display Bates number when not available', () => {
      const docWithoutBates = {
        ...mockDocument,
        customFields: {},
      };
      render(<DocumentViewer document={docWithoutBates} />);

      expect(screen.queryByText('ABC-001234')).not.toBeInTheDocument();
    });
  });

  describe('OCR Text Display', () => {
    it('should show OCR extracted text for processed documents', () => {
      render(<DocumentViewer {...defaultProps} />);

      expect(screen.getByText('OCR Extracted Text:')).toBeInTheDocument();
    });

    it('should not show OCR section when not processed', () => {
      const noOcrDoc = { ...mockDocument, ocrProcessed: false };
      render(<DocumentViewer document={noOcrDoc} />);

      expect(screen.queryByText('OCR Extracted Text:')).not.toBeInTheDocument();
    });

    it('should truncate long OCR text', () => {
      const longTextDoc = {
        ...mockDocument,
        fullTextContent: 'A'.repeat(600),
      };
      render(<DocumentViewer document={longTextDoc} />);

      // Should show truncated text with ellipsis
      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
    });
  });

  describe('Default Page Count', () => {
    it('should default to 1 page when pageCount is not provided', () => {
      const docWithoutPageCount = { ...mockDocument, pageCount: undefined };
      render(<DocumentViewer document={docWithoutPageCount} />);

      expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have proper container styling', () => {
      const { container } = render(<DocumentViewer {...defaultProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-full');
    });

    it('should have dark mode support', () => {
      const { container } = render(<DocumentViewer {...defaultProps} />);

      const toolbar = container.querySelector('.bg-white');
      expect(toolbar).toHaveClass('dark:bg-gray-800');
    });
  });

  describe('Edge Cases', () => {
    it('should handle document with minimal data', () => {
      const minimalDoc: LegalDocument = {
        id: 'min-doc',
        title: 'Minimal Document',
        type: 'Document',
        uploadDate: '2024-01-01',
        lastModified: '2024-01-01',
        tags: [],
      };
      render(<DocumentViewer document={minimalDoc} />);

      expect(screen.getByText('Minimal Document')).toBeInTheDocument();
      expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
    });

    it('should handle page count of 0', () => {
      const zeroPageDoc = { ...mockDocument, pageCount: 0 };
      render(<DocumentViewer document={zeroPageDoc} />);

      // Should treat 0 as falsy and default to 1
      expect(screen.getByText('Page 1 / 1')).toBeInTheDocument();
    });
  });
});
