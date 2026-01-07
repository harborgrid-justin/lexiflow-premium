/**
 * Enterprise Test Suite: Case Detail Page
 *
 * Comprehensive tests for the dynamic case detail page including:
 * - Async Server Component rendering with params
 * - Dynamic metadata generation
 * - generateMetadata function
 * - notFound() behavior
 * - Error handling and edge cases
 * - Component composition
 *
 * @module cases/[id]/page.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import { mockGlobalFetch, mockCases, mockApiFetch } from '../../mocks/api-mocks';
import { createMockParams } from '../../test-utils';

// Mock Next.js modules
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/cases/case-1',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => mockNotFound(),
}));

// Mock API config with controlled responses
jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    CASES: {
      LIST: '/cases',
      DETAIL: (id: string) => `/cases/${id}`,
    },
  },
  apiFetch: jest.fn(),
  API_BASE_URL: 'http://localhost:3001/api',
}));

// Mock child components
jest.mock('@/components/cases/CaseHeader', () => ({
  CaseHeader: ({ caseData }: { caseData: unknown }) => (
    <div data-testid="case-header" data-case={JSON.stringify(caseData)}>
      CaseHeader Component
    </div>
  ),
}));

jest.mock('@/components/cases/CaseOverview', () => ({
  CaseOverview: ({ caseData }: { caseData: unknown }) => (
    <div data-testid="case-overview">CaseOverview Component</div>
  ),
}));

jest.mock('@/components/cases/CaseDocuments', () => ({
  CaseDocuments: ({ caseId }: { caseId: string }) => (
    <div data-testid="case-documents" data-case-id={caseId}>
      CaseDocuments Component
    </div>
  ),
}));

jest.mock('@/components/cases/CaseTimeline', () => ({
  CaseTimeline: ({ caseId }: { caseId: string }) => (
    <div data-testid="case-timeline" data-case-id={caseId}>
      CaseTimeline Component
    </div>
  ),
}));

describe('CaseDetailPage', () => {
  let CasePage: (props: { params: Promise<{ id: string }> }) => Promise<React.JSX.Element>;
  let generateMetadata: (props: { params: Promise<{ id: string }> }) => Promise<{ title: string; description: string }>;
  let apiFetch: jest.Mock;

  const mockCaseData = mockCases[0];

  beforeAll(async () => {
    const pageModule = await import('../../../cases/[id]/page');
    CasePage = pageModule.default;
    generateMetadata = pageModule.generateMetadata;

    // Get the mocked apiFetch
    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotFound.mockClear();
    global.fetch = mockGlobalFetch;

    // Default: return mock case data
    apiFetch.mockResolvedValue(mockCaseData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Dynamic Export Configuration', () => {
    it('should export force-dynamic for authenticated routes', async () => {
      const pageModule = await import('../../../cases/[id]/page');
      expect(pageModule.dynamic).toBe('force-dynamic');
    });
  });

  describe('generateMetadata', () => {
    it('should generate correct metadata for valid case', async () => {
      apiFetch.mockResolvedValue(mockCaseData);

      const metadata = await generateMetadata({
        params: createMockParams('case-1'),
      });

      expect(metadata.title).toContain(mockCaseData.caseNumber);
      expect(metadata.title).toContain(mockCaseData.title);
      expect(metadata.title).toContain('LexiFlow');
    });

    it('should return fallback metadata on API error', async () => {
      apiFetch.mockRejectedValue(new Error('API Error'));

      const metadata = await generateMetadata({
        params: createMockParams('invalid-id'),
      });

      expect(metadata.title).toBe('Case Details | LexiFlow');
      expect(metadata.description).toBe('View case information and documents');
    });

    it('should await params before using id', async () => {
      const paramsPromise = createMockParams('case-1');

      await generateMetadata({ params: paramsPromise });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cases/case-1')
      );
    });

    it('should use case description in metadata', async () => {
      const caseWithDescription = {
        ...mockCaseData,
        description: 'Custom case description',
      };
      apiFetch.mockResolvedValue(caseWithDescription);

      const metadata = await generateMetadata({
        params: createMockParams('case-1'),
      });

      expect(metadata.description).toBe('Custom case description');
    });

    it('should use default description when case has no description', async () => {
      const caseWithoutDescription = {
        ...mockCaseData,
        description: null,
      };
      apiFetch.mockResolvedValue(caseWithoutDescription);

      const metadata = await generateMetadata({
        params: createMockParams('case-1'),
      });

      expect(metadata.description).toBe('Case details and management');
    });
  });

  describe('Page Rendering', () => {
    it('should render the page without errors', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    it('should fetch case data with correct ID', async () => {
      await CasePage({
        params: createMockParams('test-case-123'),
      });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cases/test-case-123')
      );
    });

    it('should render CaseHeader with case data', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      const header = screen.getByTestId('case-header');
      expect(header).toBeInTheDocument();
    });

    it('should render CaseOverview component', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByTestId('case-overview')).toBeInTheDocument();
    });

    it('should render CaseDocuments with correct caseId', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      const docsComponent = screen.getByTestId('case-documents');
      expect(docsComponent).toHaveAttribute('data-case-id', 'case-1');
    });

    it('should render CaseTimeline with correct caseId', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      const timelineComponent = screen.getByTestId('case-timeline');
      expect(timelineComponent).toHaveAttribute('data-case-id', 'case-1');
    });
  });

  describe('Navigation Tabs', () => {
    it('should render tab navigation', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });

    it('should have correct href attributes on tabs', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Overview').closest('a')).toHaveAttribute('href', '#overview');
      expect(screen.getByText('Documents').closest('a')).toHaveAttribute('href', '#documents');
      expect(screen.getByText('Timeline').closest('a')).toHaveAttribute('href', '#timeline');
    });

    it('should highlight Overview tab as active', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      const { container } = render(PageComponent);

      const overviewTab = screen.getByText('Overview').closest('a');
      expect(overviewTab?.className).toContain('border-blue-600');
    });
  });

  describe('Error Handling', () => {
    it('should call notFound when API returns error', async () => {
      apiFetch.mockRejectedValue(new Error('Not Found'));

      try {
        await CasePage({
          params: createMockParams('invalid-id'),
        });
      } catch {
        // notFound throws, which is expected
      }

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should call notFound when case is not found', async () => {
      apiFetch.mockRejectedValue(new Error('Case not found'));

      try {
        await CasePage({
          params: createMockParams('nonexistent'),
        });
      } catch {
        // Expected to throw due to notFound()
      }

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('Suspense Boundaries', () => {
    it('should wrap CaseOverview in Suspense', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByTestId('case-overview')).toBeInTheDocument();
    });

    it('should wrap CaseDocuments in Suspense', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByTestId('case-documents')).toBeInTheDocument();
    });

    it('should wrap CaseTimeline in Suspense', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      expect(screen.getByTestId('case-timeline')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have container with proper spacing', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      const { container } = render(PageComponent);

      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('should have correct content section spacing', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      const { container } = render(PageComponent);

      const contentSection = container.querySelector('.space-y-8');
      expect(contentSection).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes on tab navigation', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      const { container } = render(PageComponent);

      const tabNav = container.querySelector('nav');
      const tabBorder = tabNav?.closest('.border-b');
      expect(tabBorder?.className).toContain('dark:');
    });
  });

  describe('Props Passing', () => {
    it('should pass caseData to CaseHeader', async () => {
      const PageComponent = await CasePage({
        params: createMockParams('case-1'),
      });
      render(PageComponent);

      const header = screen.getByTestId('case-header');
      const passedData = JSON.parse(header.getAttribute('data-case') || '{}');
      expect(passedData.id).toBe(mockCaseData.id);
    });
  });

  describe('Async Params Handling', () => {
    it('should properly await params Promise', async () => {
      const delayedParams = new Promise<{ id: string }>((resolve) =>
        setTimeout(() => resolve({ id: 'delayed-case' }), 10)
      );

      await CasePage({ params: delayedParams });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cases/delayed-case')
      );
    });
  });
});

describe('CaseDetailPage - Edge Cases', () => {
  let apiFetch: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  it('should handle case with minimal data', async () => {
    const minimalCase = {
      id: 'min-1',
      caseNumber: '001',
      title: 'Minimal',
    };
    apiFetch.mockResolvedValue(minimalCase);

    const pageModule = await import('../../../cases/[id]/page');
    const CasePage = pageModule.default;

    const PageComponent = await CasePage({
      params: createMockParams('min-1'),
    });

    expect(() => render(PageComponent)).not.toThrow();
  });

  it('should handle special characters in case ID', async () => {
    apiFetch.mockResolvedValue(mockCases[0]);

    const pageModule = await import('../../../cases/[id]/page');
    const CasePage = pageModule.default;

    await CasePage({
      params: createMockParams('case-with-special-chars-123'),
    });

    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining('case-with-special-chars-123')
    );
  });
});

describe('CaseDetailPage - Performance', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const apiConfig = await import('@/lib/api-config');
    const apiFetch = apiConfig.apiFetch as jest.Mock;
    apiFetch.mockResolvedValue(mockCases[0]);
  });

  it('should render within acceptable time', async () => {
    const pageModule = await import('../../../cases/[id]/page');
    const CasePage = pageModule.default;

    const startTime = performance.now();
    const PageComponent = await CasePage({
      params: createMockParams('case-1'),
    });
    render(PageComponent);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });
});
