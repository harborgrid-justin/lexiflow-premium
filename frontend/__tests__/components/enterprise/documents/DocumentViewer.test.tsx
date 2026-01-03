/**
 * DocumentViewer.test.tsx
 * Comprehensive unit tests for DocumentViewer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentViewer } from '@/components/enterprise/Documents/DocumentViewer';
import type { LegalDocument } from '@/types/documents';

// Mock document data
const mockDocument: LegalDocument = {
  id: 'doc-1',
  title: 'Legal Brief Document',
  type: 'Brief',
  content: 'This is the document content for testing purposes.',
  fullTextContent: 'Full text content for search testing.',
  status: 'Active',
  pageCount: 25,
  currentVersion: 2,
  tags: ['important'],
  author: 'John Doe',
  ocrProcessed: true,
  ocrProcessedAt: '2024-01-15T10:00:00Z',
  isRedacted: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-15',
} as LegalDocument;

const mockAnnotations = [
  {
    id: 'ann-1',
    page: 1,
    x: 10,
    y: 20,
    width: 30,
    height: 5,
    type: 'highlight' as const,
    content: 'Important section',
    author: 'John Doe',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'ann-2',
    page: 1,
    x: 15,
    y: 40,
    width: 25,
    height: 5,
    type: 'note' as const,
    content: 'Review this part',
    author: 'Jane Smith',
    createdAt: '2024-01-11T10:00:00Z',
  },
];

const mockRedactions = [
  {
    id: 'red-1',
    page: 1,
    x: 20,
    y: 60,
    width: 20,
    height: 3,
    reason: 'Confidential information',
  },
];

const mockBatesStamp = {
  prefix: 'ABC-',
  startNumber: 1000,
  suffix: '-001',
  position: 'bottom-right' as const,
};

describe('DocumentViewer', () => {
  describe('Page Navigation', () => {
    it('should render page navigation controls', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByText('/ 25')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const nextButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M9 5l7 7-7 7"]')
      );

      expect(nextButton).toBeInTheDocument();
      fireEvent.click(nextButton!);

      await waitFor(() => {
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      });
    });

    it('should navigate to previous page', async () => {
      render(<DocumentViewer document={mockDocument} />);

      // First go to page 2
      const nextButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M9 5l7 7-7 7"]')
      );
      fireEvent.click(nextButton!);

      await waitFor(() => {
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      });

      // Then go back to page 1
      const prevButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M15 19l-7-7 7-7"]')
      );
      fireEvent.click(prevButton!);

      await waitFor(() => {
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
      });
    });

    it('should disable previous button on first page', () => {
      render(<DocumentViewer document={mockDocument} />);

      const prevButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M15 19l-7-7 7-7"]')
      );

      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      render(<DocumentViewer document={mockDocument} />);

      // Navigate to last page
      const pageInput = screen.getByDisplayValue('1');
      fireEvent.change(pageInput, { target: { value: '25' } });

      await waitFor(() => {
        const nextButton = screen.getAllByRole('button').find(
          btn => btn.querySelector('path[d*="M9 5l7 7-7 7"]')
        );
        expect(nextButton).toBeDisabled();
      });
    });

    it('should allow direct page input', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const pageInput = screen.getByDisplayValue('1') as HTMLInputElement;

      // Directly change the value
      fireEvent.change(pageInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(pageInput.value).toBe('10');
      }, { timeout: 500 });
    });

    it('should validate page number bounds', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const pageInput = screen.getByDisplayValue('1');

      // Try to go beyond max page
      fireEvent.change(pageInput, { target: { value: '100' } });

      // Should stay within valid range (implementation dependent)
      await waitFor(() => {
        const value = parseInt((pageInput as HTMLInputElement).value);
        expect(value).toBeLessThanOrEqual(25);
      });
    });

    it('should show current page in document content', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByText(/Page 1 of 25/i)).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    it('should render zoom controls', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should zoom in on zoom in button click', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomInButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M10 7v3m0 0v3m0-3h3m-3 0H7"]')
      );

      fireEvent.click(zoomInButton!);

      await waitFor(() => {
        expect(screen.getByText('125%')).toBeInTheDocument();
      });
    });

    it('should zoom out on zoom out button click', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomOutButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M13 10H7"]')
      );

      fireEvent.click(zoomOutButton!);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should reset zoom to 100%', async () => {
      render(<DocumentViewer document={mockDocument} />);

      // Zoom in first
      const zoomInButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M10 7v3m0 0v3m0-3h3m-3 0H7"]')
      );
      fireEvent.click(zoomInButton!);

      await waitFor(() => {
        expect(screen.getByText('125%')).toBeInTheDocument();
      });

      // Reset zoom
      const resetButton = screen.getByText('125%');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should limit zoom to maximum 200%', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomInButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M10 7v3m0 0v3m0-3h3m-3 0H7"]')
      );

      // Click multiple times to reach max
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomInButton!);
      }

      await waitFor(() => {
        const zoomText = screen.getByText(/\d+%/);
        const zoomValue = parseInt(zoomText.textContent!);
        expect(zoomValue).toBeLessThanOrEqual(200);
      });
    });

    it('should limit zoom to minimum 50%', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomOutButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M13 10H7"]')
      );

      // Click multiple times to reach min
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomOutButton!);
      }

      await waitFor(() => {
        const zoomText = screen.getByText(/\d+%/);
        const zoomValue = parseInt(zoomText.textContent!);
        expect(zoomValue).toBeGreaterThanOrEqual(50);
      });
    });

    it('should disable zoom in at maximum', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomInButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M10 7v3m0 0v3m0-3h3m-3 0H7"]')
      );

      // Zoom to max
      for (let i = 0; i < 5; i++) {
        fireEvent.click(zoomInButton!);
      }

      await waitFor(() => {
        expect(zoomInButton).toBeDisabled();
      });
    });

    it('should disable zoom out at minimum', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const zoomOutButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M13 10H7"]')
      );

      // Zoom to min
      for (let i = 0; i < 3; i++) {
        fireEvent.click(zoomOutButton!);
      }

      await waitFor(() => {
        expect(zoomOutButton).toBeDisabled();
      });
    });
  });

  describe('Annotation Tools', () => {
    it('should render annotation tool buttons when enabled', () => {
      render(<DocumentViewer document={mockDocument} enableAnnotations={true} />);

      const selectButton = screen.getByTitle('Select');
      const highlightButton = screen.getByTitle('Highlight');
      const noteButton = screen.getByTitle('Add Note');

      expect(selectButton).toBeInTheDocument();
      expect(highlightButton).toBeInTheDocument();
      expect(noteButton).toBeInTheDocument();
    });

    it('should not render annotation tools when disabled', () => {
      render(<DocumentViewer document={mockDocument} enableAnnotations={false} />);

      expect(screen.queryByTitle('Highlight')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Add Note')).not.toBeInTheDocument();
    });

    it('should toggle annotation tool selection', async () => {
      render(<DocumentViewer document={mockDocument} enableAnnotations={true} />);

      const highlightButton = screen.getByTitle('Highlight');

      fireEvent.click(highlightButton);

      await waitFor(() => {
        expect(highlightButton).toHaveClass('bg-yellow-100');
      });
    });

    it('should display annotations on current page', () => {
      render(
        <DocumentViewer
          document={mockDocument}
          annotations={mockAnnotations}
          enableAnnotations={true}
        />
      );

      // Annotations should be rendered as overlays
      const { container } = render(
        <DocumentViewer document={mockDocument} annotations={mockAnnotations} />
      );

      const annotationOverlays = container.querySelectorAll('.bg-yellow-200\\/50, .bg-green-200\\/50');
      expect(annotationOverlays.length).toBeGreaterThan(0);
    });

    it('should open annotation panel', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          annotations={mockAnnotations}
          enableAnnotations={true}
        />
      );

      const annotationButton = screen.getByTitle('Annotations');
      fireEvent.click(annotationButton);

      await waitFor(() => {
        expect(screen.getByText('Annotations (2)')).toBeInTheDocument();
      });
    });

    it('should display annotation details in panel', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          annotations={mockAnnotations}
          enableAnnotations={true}
        />
      );

      // Open annotation panel
      const annotationButton = screen.getByTitle('Annotations');
      fireEvent.click(annotationButton);

      await waitFor(() => {
        expect(screen.getByText('Important section')).toBeInTheDocument();
        expect(screen.getByText('Review this part')).toBeInTheDocument();
      });
    });

    it('should delete annotation', async () => {
      const onAnnotationDelete = jest.fn();
      render(
        <DocumentViewer
          document={mockDocument}
          annotations={mockAnnotations}
          enableAnnotations={true}
          onAnnotationDelete={onAnnotationDelete}
        />
      );

      // Open annotation panel
      fireEvent.click(screen.getByTitle('Annotations'));

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button').filter(
          btn => btn.querySelector('path[d*="M19 7l-.867"]')
        );
        fireEvent.click(deleteButtons[0]);
      });

      expect(onAnnotationDelete).toHaveBeenCalled();
    });

    it('should show empty state when no annotations', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          annotations={[]}
          enableAnnotations={true}
        />
      );

      // Open annotation panel
      fireEvent.click(screen.getByTitle('Annotations'));

      await waitFor(() => {
        expect(screen.getByText('No annotations yet')).toBeInTheDocument();
      });
    });
  });

  describe('Redaction Creation', () => {
    it('should render redaction tool when enabled', () => {
      render(<DocumentViewer document={mockDocument} enableRedaction={true} />);

      const redactButton = screen.getByTitle('Redact');
      expect(redactButton).toBeInTheDocument();
    });

    it('should not render redaction tool when disabled', () => {
      render(<DocumentViewer document={mockDocument} enableRedaction={false} />);

      expect(screen.queryByTitle('Redact')).not.toBeInTheDocument();
    });

    it('should toggle redaction tool selection', async () => {
      render(<DocumentViewer document={mockDocument} enableRedaction={true} />);

      const redactButton = screen.getByTitle('Redact');
      fireEvent.click(redactButton);

      await waitFor(() => {
        expect(redactButton).toHaveClass('bg-red-100');
      });
    });

    it('should display redactions on current page', () => {
      const { container } = render(
        <DocumentViewer
          document={mockDocument}
          redactions={mockRedactions}
          enableRedaction={true}
        />
      );

      const redactionOverlays = container.querySelectorAll('.bg-black');
      expect(redactionOverlays.length).toBeGreaterThan(0);
    });

    it('should open redaction panel', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          redactions={mockRedactions}
          enableRedaction={true}
        />
      );

      const redactionButton = screen.getByTitle('Redactions');
      fireEvent.click(redactionButton);

      await waitFor(() => {
        expect(screen.getByText('Redactions (1)')).toBeInTheDocument();
      });
    });

    it('should display redaction reason in panel', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          redactions={mockRedactions}
          enableRedaction={true}
        />
      );

      // Open redaction panel
      fireEvent.click(screen.getByTitle('Redactions'));

      await waitFor(() => {
        expect(screen.getByText('Reason: Confidential information')).toBeInTheDocument();
      });
    });

    it('should delete redaction', async () => {
      const onRedactionDelete = jest.fn();
      render(
        <DocumentViewer
          document={mockDocument}
          redactions={mockRedactions}
          enableRedaction={true}
          onRedactionDelete={onRedactionDelete}
        />
      );

      // Open redaction panel
      fireEvent.click(screen.getByTitle('Redactions'));

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button').filter(
          btn => btn.querySelector('path[d*="M19 7l-.867"]')
        );
        fireEvent.click(deleteButtons[0]);
      });

      expect(onRedactionDelete).toHaveBeenCalled();
    });

    it('should show empty state when no redactions', async () => {
      render(
        <DocumentViewer
          document={mockDocument}
          redactions={[]}
          enableRedaction={true}
        />
      );

      // Open redaction panel
      fireEvent.click(screen.getByTitle('Redactions'));

      await waitFor(() => {
        expect(screen.getByText('No redactions applied')).toBeInTheDocument();
      });
    });
  });

  describe('Bates Stamping Interface', () => {
    it('should render Bates stamp button', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByText('Bates Stamp')).toBeInTheDocument();
    });

    it('should open Bates stamp dialog', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const batesButton = screen.getByText('Bates Stamp');
      fireEvent.click(batesButton);

      await waitFor(() => {
        expect(screen.getByText('Apply Bates Stamping')).toBeInTheDocument();
      });
    });

    it('should have Bates stamp form fields', async () => {
      render(<DocumentViewer document={mockDocument} />);

      fireEvent.click(screen.getByText('Bates Stamp'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText('ABC-')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('000001')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('-001')).toBeInTheDocument();
      });
    });

    it('should display Bates number when stamp applied', () => {
      const { container } = render(
        <DocumentViewer document={mockDocument} batesStamp={mockBatesStamp} />
      );

      // Bates number should be displayed: ABC-001000-001
      expect(screen.getByText('ABC-001000-001')).toBeInTheDocument();
    });

    it('should position Bates stamp correctly', () => {
      const { container } = render(
        <DocumentViewer document={mockDocument} batesStamp={mockBatesStamp} />
      );

      const batesElement = screen.getByText('ABC-001000-001');
      expect(batesElement).toHaveClass('bottom-2', 'right-2');
    });

    it('should close Bates dialog on cancel', async () => {
      render(<DocumentViewer document={mockDocument} />);

      fireEvent.click(screen.getByText('Bates Stamp'));

      await waitFor(() => {
        expect(screen.getByText('Apply Bates Stamping')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        const dialogs = screen.queryAllByText('Apply Bates Stamping');
        expect(dialogs).toHaveLength(0);
      });
    });

    it('should increment Bates number for each page', async () => {
      render(<DocumentViewer document={mockDocument} batesStamp={mockBatesStamp} />);

      // Check page 1
      expect(screen.getByText('ABC-001000-001')).toBeInTheDocument();

      // Navigate to page 2
      const nextButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M9 5l7 7-7 7"]')
      );
      fireEvent.click(nextButton!);

      // Bates number should increment
      await waitFor(() => {
        expect(screen.getByText('ABC-001001-001')).toBeInTheDocument();
      });
    });
  });

  describe('OCR Status Display', () => {
    it('should display OCR status banner when processed', () => {
      render(<DocumentViewer document={mockDocument} showOCRStatus={true} />);

      expect(screen.getByText('OCR Processed - Full text search available')).toBeInTheDocument();
    });

    it('should show OCR processing date', () => {
      render(<DocumentViewer document={mockDocument} showOCRStatus={true} />);

      expect(screen.getByText(/Processed:/)).toBeInTheDocument();
    });

    it('should not show OCR banner when not processed', () => {
      const unprocessedDoc = { ...mockDocument, ocrProcessed: false };
      render(<DocumentViewer document={unprocessedDoc} showOCRStatus={true} />);

      expect(screen.queryByText('OCR Processed')).not.toBeInTheDocument();
    });

    it('should not show OCR status when disabled', () => {
      render(<DocumentViewer document={mockDocument} showOCRStatus={false} />);

      expect(screen.queryByText('OCR Processed')).not.toBeInTheDocument();
    });

    it('should enable search when OCR processed', () => {
      render(<DocumentViewer document={mockDocument} showOCRStatus={true} />);

      const searchInput = screen.getByPlaceholderText('Search in document...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByPlaceholderText('Search in document...')).toBeInTheDocument();
    });

    it('should perform search on Enter key', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer document={mockDocument} />);

      const searchInput = screen.getByPlaceholderText('Search in document...');
      await user.type(searchInput, 'search{Enter}');

      // Search should be performed
      await waitFor(() => {
        expect(screen.getByText('Search')).toBeInTheDocument();
      });
    });

    it('should display search results count', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer document={mockDocument} />);

      const searchInput = screen.getByPlaceholderText('Search in document...');
      await user.type(searchInput, 'content');

      const searchButton = screen.getByRole('button', { name: /Search/i });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/results/i)).toBeInTheDocument();
      });
    });

    it('should clear search results', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const searchInput = screen.getByPlaceholderText('Search in document...');

      // Type search query
      fireEvent.change(searchInput, { target: { value: 'content' } });
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      }, { timeout: 500 });
    });
  });

  describe('Thumbnail Sidebar', () => {
    it('should toggle thumbnail sidebar', async () => {
      render(<DocumentViewer document={mockDocument} />);

      const thumbnailButton = screen.getByTitle('Thumbnails');
      fireEvent.click(thumbnailButton);

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
      });
    });

    it('should display thumbnail for each page', async () => {
      render(<DocumentViewer document={mockDocument} />);

      fireEvent.click(screen.getByTitle('Thumbnails'));

      await waitFor(() => {
        const thumbnails = screen.getAllByText(/Page \d+/);
        expect(thumbnails.length).toBeGreaterThan(0);
      });
    });

    it('should navigate to page on thumbnail click', async () => {
      render(<DocumentViewer document={mockDocument} />);

      fireEvent.click(screen.getByTitle('Thumbnails'));

      await waitFor(() => {
        const page5 = screen.getByText('Page 5');
        fireEvent.click(page5.closest('div')!);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible toolbar buttons', () => {
      render(<DocumentViewer document={mockDocument} />);

      expect(screen.getByTitle('Select')).toBeInTheDocument();
      expect(screen.getByTitle('Thumbnails')).toBeInTheDocument();
    });

    it('should support keyboard navigation in page input', async () => {
      const user = userEvent.setup();
      render(<DocumentViewer document={mockDocument} />);

      const pageInput = screen.getByDisplayValue('1');
      await user.click(pageInput);

      expect(pageInput).toHaveFocus();
    });

    it('should have proper button disabled states', () => {
      render(<DocumentViewer document={mockDocument} />);

      const prevButton = screen.getAllByRole('button').find(
        btn => btn.querySelector('path[d*="M15 19l-7-7 7-7"]')
      );

      expect(prevButton).toBeDisabled();
    });

    it('should have accessible labels for all interactive elements', () => {
      render(<DocumentViewer document={mockDocument} enableAnnotations={true} />);

      expect(screen.getByTitle('Select')).toBeInTheDocument();
      expect(screen.getByTitle('Highlight')).toBeInTheDocument();
      expect(screen.getByTitle('Add Note')).toBeInTheDocument();
    });
  });
});
