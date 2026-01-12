/**
 * Enterprise Page Test Generator
 *
 * Generates comprehensive Jest tests for Next.js 16 App Router pages.
 * This utility provides consistent test coverage across all page types.
 *
 * @module page-test-generator
 */

/**
 * Page configuration for test generation
 */
export interface PageTestConfig {
  /** Page name (e.g., 'Cases', 'Documents') */
  name: string;
  /** Route path (e.g., '/cases', '/documents') */
  path: string;
  /** API endpoint key in API_ENDPOINTS */
  apiEndpoint: string;
  /** Whether this is a detail page with [id] */
  isDynamic?: boolean;
  /** Whether the page has generateStaticParams */
  hasStaticParams?: boolean;
  /** Whether the page has generateMetadata */
  hasMetadata?: boolean;
  /** Expected heading text */
  expectedHeading?: string;
  /** Child components to mock */
  childComponents?: string[];
  /** Additional metadata fields */
  metadata?: {
    title: string;
    description: string;
  };
}

/**
 * Generates a test file content for a list page
 */
export function generateListPageTest(config: PageTestConfig): string {
  const {
    name,
    path,
    apiEndpoint,
    expectedHeading,
    metadata,
    childComponents = [],
  } = config;

  const componentMocks = childComponents
    .map(
      (comp) => `
jest.mock('@/components/${path.slice(1)}/${comp}', () => ({
  ${comp}: () => <div data-testid="${comp.toLowerCase()}">${comp} Component</div>,
}));`
    )
    .join("\n");

  return `/**
 * Enterprise Test Suite: ${name} List Page
 *
 * Comprehensive tests for the ${name.toLowerCase()} listing page including:
 * - Server component rendering
 * - API integration and error handling
 * - Metadata generation
 * - Accessibility compliance
 *
 * @module ${path.slice(1)}/page.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import { mockGlobalFetch } from '../mocks/api-mocks';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '${path}',
  useSearchParams: () => new URLSearchParams(),
  notFound: jest.fn(),
}));

jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    ${apiEndpoint.toUpperCase()}: {
      LIST: '${path}',
      DETAIL: (id: string) => \`${path}/\${id}\`,
    },
  },
  apiFetch: jest.fn().mockResolvedValue([]),
  API_BASE_URL: 'http://localhost:3000/api',
}));
${componentMocks}

describe('${name}Page', () => {
  let ${name}Page: () => Promise<React.JSX.Element>;
  let pageMetadata: { title: string; description: string };

  beforeAll(async () => {
    const pageModule = await import('../../${path.slice(1)}/page');
    ${name}Page = pageModule.default;
    pageMetadata = pageModule.metadata as { title: string; description: string };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockGlobalFetch;
  });

  describe('Metadata', () => {
    it('should export correct page metadata', () => {
      expect(pageMetadata).toBeDefined();
      ${metadata ? `expect(pageMetadata.title).toBe('${metadata.title}');` : ""}
      ${metadata ? `expect(pageMetadata.description).toContain('${metadata.description.split(" ")[0]}');` : ""}
    });
  });

  describe('Page Rendering', () => {
    it('should render the page without errors', async () => {
      const PageComponent = await ${name}Page();
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    ${
      expectedHeading
        ? `
    it('should render the page heading', async () => {
      const PageComponent = await ${name}Page();
      render(PageComponent);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('${expectedHeading}');
    });`
        : ""
    }
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
      const PageComponent = await ${name}Page();
      expect(() => render(PageComponent)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const PageComponent = await ${name}Page();
      render(PageComponent);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', async () => {
      const startTime = performance.now();
      const PageComponent = await ${name}Page();
      render(PageComponent);
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
`;
}

/**
 * Generates a test file content for a detail page
 */
export function generateDetailPageTest(config: PageTestConfig): string {
  const { name, path, apiEndpoint, hasStaticParams, hasMetadata } = config;

  return `/**
 * Enterprise Test Suite: ${name} Detail Page
 *
 * Comprehensive tests for the dynamic ${name.toLowerCase()} detail page.
 *
 * @module ${path.slice(1)}/[id]/page.test
 */

import { render, screen } from '@testing-library/react';
import { createMockParams } from '../../test-utils';

const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '${path}/test-id',
  useSearchParams: () => new URLSearchParams(),
  notFound: () => mockNotFound(),
}));

jest.mock('@/lib/api-config', () => ({
  API_ENDPOINTS: {
    ${apiEndpoint.toUpperCase()}: {
      LIST: '${path}',
      DETAIL: (id: string) => \`${path}/\${id}\`,
    },
  },
  apiFetch: jest.fn(),
  API_BASE_URL: 'http://localhost:3001/api',
}));

describe('${name}DetailPage', () => {
  let ${name}DetailPage: (props: { params: Promise<{ id: string }> }) => Promise<React.JSX.Element>;
  ${hasMetadata ? `let generateMetadata: (props: { params: Promise<{ id: string }> }) => Promise<{ title: string }>;` : ""}
  ${hasStaticParams ? `let generateStaticParams: () => Promise<{ id: string }[]>;` : ""}
  let apiFetch: jest.Mock;

  const mockData = { id: 'test-1', name: 'Test ${name}' };

  beforeAll(async () => {
    const pageModule = await import('../../../${path.slice(1)}/[id]/page');
    ${name}DetailPage = pageModule.default;
    ${hasMetadata ? `generateMetadata = pageModule.generateMetadata;` : ""}
    ${hasStaticParams ? `generateStaticParams = pageModule.generateStaticParams;` : ""}
    const apiConfig = await import('@/lib/api-config');
    apiFetch = apiConfig.apiFetch as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotFound.mockClear();
    apiFetch.mockResolvedValue(mockData);
  });

  describe('Dynamic Configuration', () => {
    it('should export force-dynamic', async () => {
      const pageModule = await import('../../../${path.slice(1)}/[id]/page');
      expect(pageModule.dynamic).toBe('force-dynamic');
    });
  });

  ${
    hasStaticParams
      ? `
  describe('generateStaticParams', () => {
    it('should return array of IDs', async () => {
      apiFetch.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      const params = await generateStaticParams();
      expect(Array.isArray(params)).toBe(true);
    });

    it('should return empty array on error', async () => {
      apiFetch.mockRejectedValue(new Error('API Error'));
      const params = await generateStaticParams();
      expect(params).toEqual([]);
    });
  });`
      : ""
  }

  ${
    hasMetadata
      ? `
  describe('generateMetadata', () => {
    it('should generate metadata for valid item', async () => {
      const metadata = await generateMetadata({
        params: createMockParams('test-1'),
      });
      expect(metadata.title).toBeDefined();
    });

    it('should return fallback on error', async () => {
      apiFetch.mockRejectedValue(new Error('Not Found'));
      const metadata = await generateMetadata({
        params: createMockParams('invalid'),
      });
      expect(metadata.title).toBeDefined();
    });
  });`
      : ""
  }

  describe('Page Rendering', () => {
    it('should render without errors', async () => {
      const PageComponent = await ${name}DetailPage({
        params: createMockParams('test-1'),
      });
      const { container } = render(PageComponent);
      expect(container).toBeDefined();
    });

    it('should fetch data with correct ID', async () => {
      await ${name}DetailPage({
        params: createMockParams('test-123'),
      });
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-123')
      );
    });
  });

  describe('Error Handling', () => {
    it('should call notFound on API error', async () => {
      apiFetch.mockRejectedValue(new Error('Not Found'));
      try {
        await ${name}DetailPage({
          params: createMockParams('invalid'),
        });
      } catch {}
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should render within acceptable time', async () => {
      const startTime = performance.now();
      const PageComponent = await ${name}DetailPage({
        params: createMockParams('test-1'),
      });
      render(PageComponent);
      expect(performance.now() - startTime).toBeLessThan(100);
    });
  });
});
`;
}

/**
 * Page configurations for common pages
 */
export const PAGE_CONFIGS: Record<string, PageTestConfig> = {
  documents: {
    name: "Documents",
    path: "/documents",
    apiEndpoint: "DOCUMENTS",
    expectedHeading: "Documents",
    metadata: { title: "Documents", description: "Document management" },
  },
  tasks: {
    name: "Tasks",
    path: "/tasks",
    apiEndpoint: "TASKS",
    expectedHeading: "Tasks",
    metadata: { title: "Tasks", description: "Task management" },
  },
  invoices: {
    name: "Invoices",
    path: "/invoices",
    apiEndpoint: "INVOICES",
    expectedHeading: "Invoices",
    metadata: { title: "Invoices", description: "Invoice management" },
  },
  matters: {
    name: "Matters",
    path: "/matters",
    apiEndpoint: "MATTERS",
    expectedHeading: "Matters",
    metadata: { title: "Matters", description: "Matter management" },
  },
  depositions: {
    name: "Depositions",
    path: "/depositions",
    apiEndpoint: "DEPOSITIONS",
    expectedHeading: "Depositions",
    metadata: { title: "Depositions", description: "Deposition management" },
  },
  motions: {
    name: "Motions",
    path: "/motions",
    apiEndpoint: "MOTIONS",
    expectedHeading: "Motions",
    metadata: { title: "Motions", description: "Motion management" },
  },
  evidence: {
    name: "Evidence",
    path: "/evidence",
    apiEndpoint: "EVIDENCE",
    expectedHeading: "Evidence",
    metadata: { title: "Evidence", description: "Evidence management" },
  },
  discovery: {
    name: "Discovery",
    path: "/discovery",
    apiEndpoint: "DISCOVERY",
    expectedHeading: "Discovery",
    metadata: { title: "Discovery", description: "Discovery management" },
  },
  expenses: {
    name: "Expenses",
    path: "/expenses",
    apiEndpoint: "EXPENSES",
    expectedHeading: "Expenses",
    metadata: { title: "Expenses", description: "Expense management" },
  },
  witnesses: {
    name: "Witnesses",
    path: "/witnesses",
    apiEndpoint: "WITNESSES",
    expectedHeading: "Witnesses",
    metadata: { title: "Witnesses", description: "Witness management" },
  },
};

/**
 * Detail page configurations
 */
export const DETAIL_PAGE_CONFIGS: Record<string, PageTestConfig> = {
  documents: {
    name: "Document",
    path: "/documents",
    apiEndpoint: "DOCUMENTS",
    isDynamic: true,
    hasStaticParams: true,
    hasMetadata: true,
  },
  matters: {
    name: "Matter",
    path: "/matters",
    apiEndpoint: "MATTERS",
    isDynamic: true,
    hasStaticParams: true,
    hasMetadata: true,
  },
  tasks: {
    name: "Task",
    path: "/tasks",
    apiEndpoint: "TASKS",
    isDynamic: true,
    hasStaticParams: true,
    hasMetadata: true,
  },
  invoices: {
    name: "Invoice",
    path: "/invoices",
    apiEndpoint: "INVOICES",
    isDynamic: true,
    hasStaticParams: true,
    hasMetadata: true,
  },
};
