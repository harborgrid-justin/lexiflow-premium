/**
 * CaseDocuments Component Tests
 * Enterprise-grade test suite for document fetching and display
 *
 * @module components/cases/CaseDocuments.test
 */

import { render, screen, waitFor } from '@testing-library/react';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import component after mocking
import { CaseDocuments } from './CaseDocuments';

describe('CaseDocuments', () => {
  const mockCaseId = 'case-123';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CaseDocuments caseId={mockCaseId} />);

      expect(screen.getByText('Loading documents...')).toBeInTheDocument();
    });
  });

  describe('Document Fetching', () => {
    it('should fetch documents for the given case ID', async () => {
      const mockDocuments = [
        { id: 'doc-1', title: 'Contract.pdf', fileSize: 1024000 },
        { id: 'doc-2', title: 'Brief.docx', fileSize: 512000 },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockDocuments }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`/api/cases/${mockCaseId}/documents`);
      });
    });

    it('should display documents after successful fetch', async () => {
      const mockDocuments = [
        { id: 'doc-1', title: 'Contract Agreement.pdf', fileSize: 1024000 },
        { id: 'doc-2', title: 'Legal Brief.docx', fileSize: 512000 },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockDocuments }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByText('Contract Agreement.pdf')).toBeInTheDocument();
        expect(screen.getByText('Legal Brief.docx')).toBeInTheDocument();
      });
    });

    it('should display file sizes correctly formatted', async () => {
      const mockDocuments = [
        { id: 'doc-1', title: 'Large File.pdf', fileSize: 2048000 }, // 2000 KB
        { id: 'doc-2', title: 'Small File.txt', fileSize: 512 }, // 0.5 KB
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockDocuments }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByText('2000.00 KB')).toBeInTheDocument();
        expect(screen.getByText('0.50 KB')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no documents exist', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
      });
    });

    it('should display empty state when data is undefined', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({}),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to fetch documents:',
          expect.any(Error)
        );
      });

      // Should show empty state on error
      expect(screen.getByText('No documents yet')).toBeInTheDocument();
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('Component Structure', () => {
    it('should render the Documents heading', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Documents' })).toBeInTheDocument();
      });
    });

    it('should render document items with proper structure', async () => {
      const mockDocuments = [
        { id: 'doc-1', title: 'Test Document.pdf', fileSize: 1024 },
      ];

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: mockDocuments }),
      });

      render(<CaseDocuments caseId={mockCaseId} />);

      await waitFor(() => {
        expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Re-fetching on Case Change', () => {
    it('should refetch documents when caseId changes', async () => {
      const mockDocuments1 = [{ id: 'doc-1', title: 'Case1 Doc.pdf', fileSize: 1024 }];
      const mockDocuments2 = [{ id: 'doc-2', title: 'Case2 Doc.pdf', fileSize: 2048 }];

      mockFetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ data: mockDocuments1 }),
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ data: mockDocuments2 }),
        });

      const { rerender } = render(<CaseDocuments caseId="case-1" />);

      await waitFor(() => {
        expect(screen.getByText('Case1 Doc.pdf')).toBeInTheDocument();
      });

      rerender(<CaseDocuments caseId="case-2" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/cases/case-2/documents');
      });
    });
  });
});
