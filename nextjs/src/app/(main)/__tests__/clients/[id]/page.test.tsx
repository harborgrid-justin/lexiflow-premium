/**
 * Enterprise Test Suite: Client Detail Page
 *
 * Comprehensive tests for the dynamic client detail page including:
 * - Server-side rendering with ISR configuration
 * - generateStaticParams for static generation
 * - Dynamic metadata generation
 * - Data fetching and error handling
 * - Layout and content verification
 *
 * @module clients/[id]/page.test
 */

import { render, screen } from '@testing-library/react';
import { mockClients, mockApiFetch } from '../../mocks/api-mocks';
import { createMockParams } from '../../test-utils';

// Mock Next.js navigation
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/clients/client-1',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => mockNotFound(),
}));

// Mock API config
jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    CLIENTS: {
      LIST: '/clients',
      DETAIL: (id: string) => `/clients/${id}`,
    },
  },
  apiFetch: jest.fn(),
  API_BASE_URL: 'http://localhost:3001/api',
}));

describe('ClientDetailPage', () => {
  let ClientDetailPage: (props: { params: Promise<{ id: string }> }) => Promise<React.JSX.Element>;
  let generateMetadata: (props: { params: Promise<{ id: string }> }) => Promise<{ title: string; description?: string }>;
  let generateStaticParams: () => Promise<{ id: string }[]>;
  let apiFetch: jest.Mock;

  const mockClientData = mockClients[0];

  beforeAll(async () => {
    const pageModule = await import('../../../clients/[id]/page');
    ClientDetailPage = pageModule.default;
    generateMetadata = pageModule.generateMetadata;
    generateStaticParams = pageModule.generateStaticParams;

    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotFound.mockClear();
    apiFetch.mockResolvedValue(mockClientData);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Static Export Configuration', () => {
    it('should export force-dynamic for authenticated routes', async () => {
      const pageModule = await import('../../../clients/[id]/page');
      expect(pageModule.dynamic).toBe('force-dynamic');
    });

    it('should export revalidate for ISR', async () => {
      const pageModule = await import('../../../clients/[id]/page');
      expect(pageModule.revalidate).toBe(1800); // 30 minutes
    });
  });

  describe('generateStaticParams', () => {
    it('should return array of client IDs for static generation', async () => {
      const mockClientList = mockClients.map((c) => ({ id: c.id }));
      apiFetch.mockResolvedValue(mockClientList);

      const params = await generateStaticParams();

      expect(Array.isArray(params)).toBe(true);
      expect(params.length).toBeGreaterThan(0);
      params.forEach((param) => {
        expect(param).toHaveProperty('id');
        expect(typeof param.id).toBe('string');
      });
    });

    it('should return empty array on API error', async () => {
      apiFetch.mockRejectedValue(new Error('API Error'));

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });

    it('should handle null response gracefully', async () => {
      apiFetch.mockResolvedValue(null);

      const params = await generateStaticParams();

      expect(params).toEqual([]);
    });

    it('should convert numeric IDs to strings', async () => {
      apiFetch.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

      const params = await generateStaticParams();

      params.forEach((param) => {
        expect(typeof param.id).toBe('string');
      });
    });

    it('should call API with correct endpoint', async () => {
      apiFetch.mockResolvedValue(mockClients);

      await generateStaticParams();

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients')
      );
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=100')
      );
    });
  });

  describe('generateMetadata', () => {
    it('should generate correct metadata for valid client', async () => {
      apiFetch.mockResolvedValue(mockClientData);

      const metadata = await generateMetadata({
        params: createMockParams('client-1'),
      });

      expect(metadata.title).toContain(mockClientData.name);
      expect(metadata.title).toContain('LexiFlow');
    });

    it('should return "Client Not Found" on error', async () => {
      apiFetch.mockRejectedValue(new Error('Not Found'));

      const metadata = await generateMetadata({
        params: createMockParams('invalid-id'),
      });

      expect(metadata.title).toBe('Client Not Found');
    });

    it('should handle client without name', async () => {
      apiFetch.mockResolvedValue({ ...mockClientData, name: null });

      const metadata = await generateMetadata({
        params: createMockParams('client-1'),
      });

      expect(metadata.title).toContain('Client');
      expect(metadata.title).toContain('LexiFlow');
    });

    it('should include client name in description', async () => {
      apiFetch.mockResolvedValue(mockClientData);

      const metadata = await generateMetadata({
        params: createMockParams('client-1'),
      });

      expect(metadata.description).toContain(mockClientData.name);
    });
  });

  describe('Page Rendering', () => {
    it('should render the page without errors', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    it('should display client name', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockClientData.name);
    });

    it('should display contact information section', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('should display client email', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText(mockClientData.email)).toBeInTheDocument();
    });

    it('should display client phone', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText(mockClientData.phone)).toBeInTheDocument();
    });

    it('should display client address', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText(mockClientData.address)).toBeInTheDocument();
    });

    it('should display client status section', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Client Status')).toBeInTheDocument();
    });

    it('should display client status value', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText(mockClientData.status)).toBeInTheDocument();
    });

    it('should display client creation date', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText(mockClientData.createdAt)).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have container with proper spacing', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);

      expect(container.querySelector('.container')).toBeInTheDocument();
    });

    it('should have card layout for client info', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);

      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      expect(container.querySelector('.shadow')).toBeInTheDocument();
    });

    it('should have two-column grid for info sections', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);

      expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should call notFound when client is not found', async () => {
      apiFetch.mockRejectedValue(new Error('Not Found'));

      try {
        await ClientDetailPage({
          params: createMockParams('invalid-id'),
        });
      } catch {
        // Expected to throw
      }

      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      apiFetch.mockRejectedValue(new Error('Network Error'));

      try {
        await ClientDetailPage({
          params: createMockParams('client-1'),
        });
      } catch {
        // Expected to throw
      }

      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('Dark Mode Support', () => {
    it('should include dark mode classes on card', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);

      const card = container.querySelector('.bg-white');
      expect(card?.className).toContain('dark:');
    });

    it('should include dark mode classes on labels', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      const { container } = render(PageComponent);

      const labels = container.querySelectorAll('.text-slate-600');
      labels.forEach((label) => {
        expect(label.className).toContain('dark:');
      });
    });
  });

  describe('Suspense Boundaries', () => {
    it('should wrap content in Suspense', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      // Content should be rendered (Suspense resolved)
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    });

    it('should have labeled sections', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Client Status')).toBeInTheDocument();
    });

    it('should have readable label-value pairs', async () => {
      const PageComponent = await ClientDetailPage({
        params: createMockParams('client-1'),
      });
      render(PageComponent);

      expect(screen.getByText('Email:')).toBeInTheDocument();
      expect(screen.getByText('Phone:')).toBeInTheDocument();
      expect(screen.getByText('Address:')).toBeInTheDocument();
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('Since:')).toBeInTheDocument();
    });
  });

  describe('Props and Data Flow', () => {
    it('should await params promise', async () => {
      const delayedParams = new Promise<{ id: string }>((resolve) =>
        setTimeout(() => resolve({ id: 'delayed-client' }), 10)
      );

      await ClientDetailPage({ params: delayedParams });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/delayed-client')
      );
    });

    it('should pass correct ID to API', async () => {
      await ClientDetailPage({
        params: createMockParams('specific-client-id'),
      });

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/clients/specific-client-id')
      );
    });
  });
});

describe('ClientDetailPage - Edge Cases', () => {
  let apiFetch: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  it('should handle client with empty fields', async () => {
    const emptyClient = {
      id: 'empty-1',
      name: '',
      email: '',
      phone: '',
      address: '',
      status: '',
      createdAt: '',
    };
    apiFetch.mockResolvedValue(emptyClient);

    const pageModule = await import('../../../clients/[id]/page');
    const ClientDetailPage = pageModule.default;

    const PageComponent = await ClientDetailPage({
      params: createMockParams('empty-1'),
    });

    expect(() => render(PageComponent)).not.toThrow();
  });

  it('should handle client with null values', async () => {
    const nullClient = {
      id: 'null-1',
      name: null,
      email: null,
      phone: null,
      address: null,
      status: null,
      createdAt: null,
    };
    apiFetch.mockResolvedValue(nullClient);

    const pageModule = await import('../../../clients/[id]/page');
    const ClientDetailPage = pageModule.default;

    const PageComponent = await ClientDetailPage({
      params: createMockParams('null-1'),
    });

    expect(() => render(PageComponent)).not.toThrow();
  });

  it('should handle client with extra fields', async () => {
    const extendedClient = {
      ...mockClients[0],
      extraField: 'extra value',
      anotherExtra: { nested: true },
    };
    apiFetch.mockResolvedValue(extendedClient);

    const pageModule = await import('../../../clients/[id]/page');
    const ClientDetailPage = pageModule.default;

    const PageComponent = await ClientDetailPage({
      params: createMockParams('extended-1'),
    });

    expect(() => render(PageComponent)).not.toThrow();
  });
});

describe('ClientDetailPage - Performance', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const apiConfig = await import('@/lib/api-config');
    const apiFetch = apiConfig.apiFetch as jest.Mock;
    apiFetch.mockResolvedValue(mockClients[0]);
  });

  it('should render within acceptable time', async () => {
    const pageModule = await import('../../../clients/[id]/page');
    const ClientDetailPage = pageModule.default;

    const startTime = performance.now();
    const PageComponent = await ClientDetailPage({
      params: createMockParams('client-1'),
    });
    render(PageComponent);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
  });
});
