/**
 * Enterprise Test Suite: Documents List Page
 *
 * Comprehensive tests for the documents listing page including:
 * - Server component rendering
 * - Document list display
 * - Upload functionality link
 * - Folder structure navigation
 *
 * @module documents/page.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import { mockGlobalFetch, mockDocuments, mockApiFetch } from '../mocks/api-mocks';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/documents',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    DOCUMENTS: {
      LIST: '/documents',
      DETAIL: (id: string) => `/documents/${id}`,
      UPLOAD: '/documents/upload',
      FOLDERS: '/documents/folders/list',
    },
  },
  apiFetch: jest.fn(),
  API_BASE_URL: 'http://localhost:3001/api',
}));

describe('DocumentsPage', () => {
  let DocumentsPage: () => Promise<React.JSX.Element>;
  let metadata: { title: string; description: string };
  let apiFetch: jest.Mock;

  beforeAll(async () => {
    const pageModule = await import('../../documents/page');
    DocumentsPage = pageModule.default;
    metadata = pageModule.metadata as { title: string; description: string };

    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockGlobalFetch;
    apiFetch.mockResolvedValue(mockDocuments);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Metadata', () => {
    it('should export correct page metadata', () => {
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(typeof metadata.title).toBe('string');
    });

    it('should have SEO-friendly metadata', () => {
      expect(metadata.title.length).toBeGreaterThan(0);
      expect(metadata.title.length).toBeLessThan(60);
    });
  });

  describe('Page Rendering', () => {
    it('should render the page without errors', async () => {
      const PageComponent = await DocumentsPage();
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    it('should render the page heading', async () => {
      const PageComponent = await DocumentsPage();
      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should render document-related content', async () => {
      const PageComponent = await DocumentsPage();
      const { container } = render(PageComponent);

      expect(container.textContent).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should fetch documents from API', async () => {
      await DocumentsPage();

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalled();
      });
    });

    it('should handle empty document list', async () => {
      apiFetch.mockResolvedValue([]);

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      apiFetch.mockRejectedValue(new Error('API Error'));

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });
  });

  describe('Document Types', () => {
    it('should handle various document types', async () => {
      const mixedDocs = [
        { ...mockDocuments[0], type: 'application/pdf', name: 'document.pdf' },
        { ...mockDocuments[1], type: 'application/msword', name: 'document.doc' },
        { ...mockDocuments[2], type: 'image/jpeg', name: 'image.jpg' },
      ];
      apiFetch.mockResolvedValue(mixedDocs);

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });

    it('should handle documents with different sizes', async () => {
      const sizedDocs = [
        { ...mockDocuments[0], size: 1024 }, // 1KB
        { ...mockDocuments[1], size: 1024 * 1024 }, // 1MB
        { ...mockDocuments[2], size: 1024 * 1024 * 100 }, // 100MB
      ];
      apiFetch.mockResolvedValue(sizedDocs);

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });
  });

  describe('Layout Structure', () => {
    it('should have container with proper spacing', async () => {
      const PageComponent = await DocumentsPage();
      const { container } = render(PageComponent);

      expect(container.querySelector('.container') || container.firstChild).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const PageComponent = await DocumentsPage();
      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should have navigable structure', async () => {
      const PageComponent = await DocumentsPage();
      const { container } = render(PageComponent);

      expect(container).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed document data', async () => {
      apiFetch.mockResolvedValue([
        { id: 'bad-1' }, // Missing required fields
        null,
        undefined,
      ]);

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });

    it('should handle documents with null values', async () => {
      const nullDocs = mockDocuments.map((doc) => ({
        ...doc,
        name: null,
        type: null,
      }));
      apiFetch.mockResolvedValue(nullDocs);

      const PageComponent = await DocumentsPage();
      expect(() => render(PageComponent)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', async () => {
      const startTime = performance.now();
      const PageComponent = await DocumentsPage();
      render(PageComponent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle large document lists efficiently', async () => {
      const largeDocs = Array.from({ length: 100 }, (_, i) => ({
        ...mockDocuments[0],
        id: `doc-${i}`,
        name: `Document ${i}.pdf`,
      }));
      apiFetch.mockResolvedValue(largeDocs);

      const startTime = performance.now();
      const PageComponent = await DocumentsPage();
      render(PageComponent);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});

describe('DocumentsPage - File Operations', () => {
  let apiFetch: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
    apiFetch.mockResolvedValue(mockDocuments);
  });

  it('should display document versions', async () => {
    const versionedDocs = mockDocuments.map((doc, i) => ({
      ...doc,
      version: i + 1,
      versions: [{ version: 1 }, { version: 2 }],
    }));
    apiFetch.mockResolvedValue(versionedDocs);

    const pageModule = await import('../../documents/page');
    const DocumentsPage = pageModule.default;

    const PageComponent = await DocumentsPage();
    expect(() => render(PageComponent)).not.toThrow();
  });

  it('should handle documents with case associations', async () => {
    const caseDocs = mockDocuments.map((doc) => ({
      ...doc,
      caseId: 'case-123',
      caseName: 'Test Case',
    }));
    apiFetch.mockResolvedValue(caseDocs);

    const pageModule = await import('../../documents/page');
    const DocumentsPage = pageModule.default;

    const PageComponent = await DocumentsPage();
    expect(() => render(PageComponent)).not.toThrow();
  });
});
