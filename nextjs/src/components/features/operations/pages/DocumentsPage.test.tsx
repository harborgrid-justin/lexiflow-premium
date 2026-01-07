/**
 * @jest-environment jsdom
 * @module DocumentsPage.test
 * @description Enterprise-grade tests for DocumentsPage component
 *
 * Test coverage:
 * - Page rendering
 * - DocumentManager integration
 * - caseId prop handling
 * - PageContainerLayout wrapper
 * - React.memo optimization
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DocumentsPage } from './DocumentsPage';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/features/operations/documents/DocumentManager', () => ({
  DocumentManager: () => (
    <div data-testid="document-manager">
      <h1>Document Repository</h1>
      <div data-testid="document-content">
        <section data-testid="upload-section">
          <h2>Upload</h2>
          <button>Upload Documents</button>
        </section>
        <section data-testid="browse-section">
          <h2>Browse</h2>
          <p>Browse document repository</p>
        </section>
        <section data-testid="search-section">
          <h2>Search</h2>
          <input type="text" placeholder="Search documents..." />
        </section>
      </div>
    </div>
  ),
}));

jest.mock('@/components/ui/layouts/PageContainerLayout/PageContainerLayout', () => ({
  PageContainerLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container-layout">{children}</div>
  ),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('DocumentsPage', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('page-container-layout')).toBeInTheDocument();
    });

    it('renders DocumentManager component', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });

    it('wraps content in PageContainerLayout', () => {
      render(<DocumentsPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout).toContainElement(screen.getByTestId('document-manager'));
    });

    it('displays document repository heading', () => {
      render(<DocumentsPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Document Repository');
    });

    it('renders document content', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('document-content')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts optional caseId prop', () => {
      expect(() => render(<DocumentsPage caseId="case-123" />)).not.toThrow();
    });

    it('works without caseId prop', () => {
      expect(() => render(<DocumentsPage />)).not.toThrow();
    });

    it('handles undefined caseId', () => {
      render(<DocumentsPage caseId={undefined} />);

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });
  });

  describe('DocumentManager Integration', () => {
    it('renders upload section', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('upload-section')).toBeInTheDocument();
      expect(screen.getByText('Upload Documents')).toBeInTheDocument();
    });

    it('renders browse section', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('browse-section')).toBeInTheDocument();
      expect(screen.getByText('Browse document repository')).toBeInTheDocument();
    });

    it('renders search section', () => {
      render(<DocumentsPage />);

      expect(screen.getByTestId('search-section')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
    });

    it('renders all section headings', () => {
      render(<DocumentsPage />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
      expect(screen.getByText('Browse')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
  });

  describe('React.memo Optimization', () => {
    it('is memoized for performance', () => {
      expect(DocumentsPage).toHaveProperty('$$typeof', Symbol.for('react.memo'));
    });

    it('re-renders correctly when caseId changes', () => {
      const { rerender } = render(<DocumentsPage caseId="case-1" />);

      rerender(<DocumentsPage caseId="case-2" />);

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });

    it('handles multiple re-renders', () => {
      const { rerender } = render(<DocumentsPage />);

      for (let i = 0; i < 3; i++) {
        rerender(<DocumentsPage caseId={`case-${i}`} />);
      }

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('maintains correct component hierarchy', () => {
      const { container } = render(<DocumentsPage />);

      expect(container.firstChild).toHaveAttribute('data-testid', 'page-container-layout');
    });

    it('renders single child in layout', () => {
      render(<DocumentsPage />);

      const layout = screen.getByTestId('page-container-layout');
      expect(layout.children).toHaveLength(1);
    });
  });

  describe('Interactive Elements', () => {
    it('renders upload button', () => {
      render(<DocumentsPage />);

      expect(screen.getByRole('button', { name: 'Upload Documents' })).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<DocumentsPage />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders main heading element', () => {
      render(<DocumentsPage />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders section headings', () => {
      render(<DocumentsPage />);

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements).toHaveLength(3);
    });

    it('has proper content structure', () => {
      render(<DocumentsPage />);

      const sections = screen.getAllByRole('region');
      expect(sections).toHaveLength(3);
    });

    it('search input has placeholder for context', () => {
      render(<DocumentsPage />);

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('placeholder', 'Search documents...');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty caseId', () => {
      render(<DocumentsPage caseId="" />);

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });

    it('handles special characters in caseId', () => {
      render(<DocumentsPage caseId="case-123-ABC!@#" />);

      expect(screen.getByTestId('document-manager')).toBeInTheDocument();
    });
  });
});
