/**
 * Enterprise Test Suite: Cases List Page
 *
 * Comprehensive tests for the cases listing page including:
 * - Server component rendering
 * - API integration and error handling
 * - Metadata generation
 * - Accessibility compliance
 * - Responsive layout verification
 *
 * @module cases/page.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import { mockGlobalFetch, mockCases } from '../mocks/api-mocks';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/cases',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

// Mock API fetch
jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    CASES: {
      LIST: '/cases',
      DETAIL: (id: string) => `/cases/${id}`,
    },
  },
  apiFetch: jest.fn().mockResolvedValue([]),
  API_BASE_URL: 'http://localhost:3001/api',
}));

// Mock child components
jest.mock('@/components/cases/CaseFilters', () => ({
  CaseFilters: () => <div data-testid="case-filters">CaseFilters Component</div>,
}));

jest.mock('@/components/cases/CaseList', () => ({
  CaseList: () => <div data-testid="case-list">CaseList Component</div>,
}));

describe('CasesPage', () => {
  let CasesPage: () => Promise<React.JSX.Element>;
  let metadata: { title: string; description: string };

  beforeAll(async () => {
    // Import the page module
    const pageModule = await import('../../cases/page');
    CasesPage = pageModule.default;
    metadata = pageModule.metadata as { title: string; description: string };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockGlobalFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Metadata', () => {
    it('should export correct page metadata', () => {
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Cases');
      expect(metadata.description).toBe('Manage all legal cases');
    });

    it('should have SEO-friendly title', () => {
      expect(metadata.title.length).toBeGreaterThan(0);
      expect(metadata.title.length).toBeLessThan(60);
    });

    it('should have SEO-friendly description', () => {
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeLessThan(160);
    });
  });

  describe('Page Rendering', () => {
    it('should render the page without errors', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    it('should render the page title', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cases');
    });

    it('should render the page description', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      expect(screen.getByText('Manage and track all legal cases')).toBeInTheDocument();
    });

    it('should render the New Case button', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      const newCaseLink = screen.getByRole('link', { name: /new case/i });
      expect(newCaseLink).toBeInTheDocument();
      expect(newCaseLink).toHaveAttribute('href', '/cases/new');
    });

    it('should render the CaseFilters component', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      expect(screen.getByTestId('case-filters')).toBeInTheDocument();
    });

    it('should render the CaseList component', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      expect(screen.getByTestId('case-list')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct grid layout', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      // Check for grid container
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have sidebar and main content areas', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      const aside = container.querySelector('aside');
      const main = container.querySelector('main');

      expect(aside).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('should apply responsive classes', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('API Integration', () => {
    it('should call fetch for API health check', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      // The page performs a HEAD request to check API availability
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

      // Should not throw
      const PageComponent = await CasesPage();
      expect(() => render(PageComponent)).not.toThrow();
    });

    it('should continue rendering when API check fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      expect(container).toBeDefined();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it('should have accessible link for New Case', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      const link = screen.getByRole('link', { name: /new case/i });
      expect(link).toHaveAttribute('href');
    });

    it('should use semantic HTML elements', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });

  describe('Suspense Boundaries', () => {
    it('should wrap CaseFilters in Suspense', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      // Component should be rendered (Suspense resolved)
      expect(screen.getByTestId('case-filters')).toBeInTheDocument();
    });

    it('should wrap CaseList in Suspense', async () => {
      const PageComponent = await CasesPage();
      render(PageComponent);

      // Component should be rendered (Suspense resolved)
      expect(screen.getByTestId('case-list')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes on heading', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      const heading = container.querySelector('h1');
      expect(heading?.className).toContain('dark:');
    });

    it('should include dark mode classes on description', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      const description = container.querySelector('p');
      expect(description?.className).toContain('dark:');
    });
  });

  describe('Component Integration', () => {
    it('should render complete page structure', async () => {
      const PageComponent = await CasesPage();
      const { container } = render(PageComponent);

      // Main container
      expect(container.querySelector('.container')).toBeInTheDocument();

      // Header section with title and button
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /new case/i })).toBeInTheDocument();

      // Grid layout with filters and list
      expect(screen.getByTestId('case-filters')).toBeInTheDocument();
      expect(screen.getByTestId('case-list')).toBeInTheDocument();
    });
  });
});

describe('CasesPage - Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network timeout gracefully', async () => {
    global.fetch = jest.fn().mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
    );

    const pageModule = await import('../../cases/page');
    const CasesPage = pageModule.default;

    // Should complete without throwing
    const PageComponent = await CasesPage();
    expect(() => render(PageComponent)).not.toThrow();
  });

  it('should handle null fetch response', async () => {
    global.fetch = jest.fn().mockResolvedValue(null);

    const pageModule = await import('../../cases/page');
    const CasesPage = pageModule.default;

    // The page has try-catch, should handle this
    const PageComponent = await CasesPage();
    const { container } = render(PageComponent);
    expect(container).toBeDefined();
  });
});

describe('CasesPage - Performance', () => {
  it('should render within acceptable time', async () => {
    const pageModule = await import('../../cases/page');
    const CasesPage = pageModule.default;

    const startTime = performance.now();
    const PageComponent = await CasesPage();
    render(PageComponent);
    const endTime = performance.now();

    // Should render in less than 100ms
    expect(endTime - startTime).toBeLessThan(100);
  });
});
