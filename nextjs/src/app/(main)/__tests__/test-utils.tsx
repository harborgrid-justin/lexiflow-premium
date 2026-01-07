/**
 * Enterprise Test Utilities for Next.js 16 App Router Pages
 *
 * Provides comprehensive testing infrastructure including:
 * - Mock factories for API responses
 * - Custom render utilities for Server Components
 * - Type-safe mock data generators
 * - Async component testing helpers
 *
 * @module test-utils
 */

import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement, Suspense } from 'react';

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Factory for generating mock Case data
 */
export const mockCaseFactory = (overrides: Partial<MockCase> = {}): MockCase => ({
  id: `case-${Math.random().toString(36).substr(2, 9)}`,
  caseNumber: `2024-CV-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
  title: 'Mock Case Title',
  description: 'Mock case description for testing purposes',
  status: 'active',
  priority: 'medium',
  clientId: 'client-123',
  clientName: 'Mock Client',
  assignedAttorneyId: 'attorney-123',
  assignedAttorneyName: 'John Doe',
  practiceArea: 'Civil Litigation',
  court: 'Superior Court',
  jurisdiction: 'California',
  filingDate: '2024-01-15',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock Client data
 */
export const mockClientFactory = (overrides: Partial<MockClient> = {}): MockClient => ({
  id: `client-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Mock Client Name',
  email: 'client@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Anytown, CA 90210',
  type: 'individual',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock Document data
 */
export const mockDocumentFactory = (overrides: Partial<MockDocument> = {}): MockDocument => ({
  id: `doc-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Mock Document.pdf',
  type: 'application/pdf',
  size: 1024 * 1024, // 1MB
  caseId: 'case-123',
  uploadedBy: 'user-123',
  version: 1,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock Matter data
 */
export const mockMatterFactory = (overrides: Partial<MockMatter> = {}): MockMatter => ({
  id: `matter-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Mock Matter',
  description: 'Mock matter description',
  clientId: 'client-123',
  status: 'active',
  practiceArea: 'Corporate',
  openDate: '2024-01-01',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock User data
 */
export const mockUserFactory = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'attorney',
  status: 'active',
  department: 'Litigation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock Task data
 */
export const mockTaskFactory = (overrides: Partial<MockTask> = {}): MockTask => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Task',
  description: 'Mock task description',
  status: 'pending',
  priority: 'medium',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  assigneeId: 'user-123',
  caseId: 'case-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for generating mock Invoice data
 */
export const mockInvoiceFactory = (overrides: Partial<MockInvoice> = {}): MockInvoice => ({
  id: `inv-${Math.random().toString(36).substr(2, 9)}`,
  invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
  clientId: 'client-123',
  matterId: 'matter-123',
  amount: 5000.00,
  status: 'pending',
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// ============================================================================
// Mock Types
// ============================================================================

export interface MockCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  clientId: string;
  clientName: string;
  assignedAttorneyId: string;
  assignedAttorneyName: string;
  practiceArea: string;
  court: string;
  jurisdiction: string;
  filingDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  caseId: string;
  uploadedBy: string;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockMatter {
  id: string;
  name: string;
  description: string;
  clientId: string;
  status: string;
  practiceArea: string;
  openDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  caseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  matterId: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Mocking Utilities
// ============================================================================

/**
 * Creates a mock API response with proper structure
 */
export const createMockApiResponse = <T>(data: T, options: MockApiOptions = {}): MockApiResponse<T> => ({
  data,
  status: options.status ?? 200,
  message: options.message ?? 'Success',
  meta: options.meta ?? {
    page: 1,
    pageSize: 20,
    total: Array.isArray(data) ? data.length : 1,
    totalPages: 1,
  },
});

export interface MockApiOptions {
  status?: number;
  message?: string;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface MockApiResponse<T> {
  data: T;
  status: number;
  message: string;
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Mock implementation for apiFetch
 */
export const createMockApiFetch = (mockData: Record<string, unknown>) => {
  return jest.fn().mockImplementation(async (endpoint: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Match endpoint patterns
    for (const [pattern, data] of Object.entries(mockData)) {
      if (endpoint.includes(pattern) || endpoint === pattern) {
        return data;
      }
    }

    throw new Error(`No mock data found for endpoint: ${endpoint}`);
  });
};

/**
 * Mock implementation for fetch with configurable responses
 */
export const createMockFetch = (responses: MockFetchResponses) => {
  return jest.fn().mockImplementation(async (url: string, options?: RequestInit) => {
    await new Promise((resolve) => setTimeout(resolve, 10));

    for (const [pattern, response] of Object.entries(responses)) {
      if (url.includes(pattern)) {
        if (response.error) {
          throw response.error;
        }
        return {
          ok: response.ok ?? true,
          status: response.status ?? 200,
          statusText: response.statusText ?? 'OK',
          json: async () => response.data,
          text: async () => JSON.stringify(response.data),
        };
      }
    }

    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Not found' }),
      text: async () => 'Not found',
    };
  });
};

export interface MockFetchResponses {
  [pattern: string]: {
    data?: unknown;
    ok?: boolean;
    status?: number;
    statusText?: string;
    error?: Error;
  };
}

// ============================================================================
// React Testing Utilities
// ============================================================================

/**
 * Custom render function with providers
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Enhanced render function with common providers
 */
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

/**
 * Render an async Server Component for testing
 * Handles Promise-based components properly
 */
export async function renderAsyncComponent<T>(
  Component: (props: T) => Promise<React.JSX.Element>,
  props: T
): Promise<ReturnType<typeof render>> {
  const element = await Component(props);
  return render(element);
}

/**
 * Helper to test async Server Components with Suspense
 */
export function renderWithSuspense(
  element: ReactElement,
  fallback: ReactElement = <div>Loading...</div>
): ReturnType<typeof render> {
  return render(<Suspense fallback={fallback}>{element}</Suspense>);
}

// ============================================================================
// Test Assertion Helpers
// ============================================================================

/**
 * Assert that a component renders without errors
 */
export const expectNoRenderErrors = (renderFn: () => void) => {
  expect(renderFn).not.toThrow();
};

/**
 * Assert that an element has the correct accessibility role
 */
export const expectAccessibleElement = (
  element: HTMLElement,
  expectedRole: string
) => {
  expect(element).toHaveAttribute('role', expectedRole);
};

/**
 * Assert that an async function throws a specific error
 */
export const expectAsyncToThrow = async (
  asyncFn: () => Promise<unknown>,
  errorMessage?: string
) => {
  await expect(asyncFn()).rejects.toThrow(errorMessage);
};

// ============================================================================
// Page Test Helpers
// ============================================================================

/**
 * Creates mock params for dynamic routes
 */
export const createMockParams = (id: string): Promise<{ id: string }> => {
  return Promise.resolve({ id });
};

/**
 * Creates mock search params for pages
 */
export const createMockSearchParams = (
  params: Record<string, string | string[]>
): Promise<{ [key: string]: string | string[] | undefined }> => {
  return Promise.resolve(params);
};

/**
 * Waits for all pending promises to resolve
 */
export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Waits for a specific condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

// ============================================================================
// Console Mocking
// ============================================================================

/**
 * Captures and suppresses console output during tests
 */
export const createConsoleMock = () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  const logs: string[] = [];
  const warns: string[] = [];
  const errors: string[] = [];

  return {
    mock: () => {
      console.log = (...args) => logs.push(args.join(' '));
      console.warn = (...args) => warns.push(args.join(' '));
      console.error = (...args) => errors.push(args.join(' '));
    },
    restore: () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    },
    getLogs: () => logs,
    getWarns: () => warns,
    getErrors: () => errors,
    clear: () => {
      logs.length = 0;
      warns.length = 0;
      errors.length = 0;
    },
  };
};

// ============================================================================
// Metadata Test Helpers
// ============================================================================

/**
 * Tests that a page exports correct metadata
 */
export const testMetadataExport = (metadata: { title?: string; description?: string }) => {
  expect(metadata).toBeDefined();
  if (metadata.title) {
    expect(typeof metadata.title).toBe('string');
    expect(metadata.title.length).toBeGreaterThan(0);
  }
  if (metadata.description) {
    expect(typeof metadata.description).toBe('string');
    expect(metadata.description.length).toBeGreaterThan(0);
  }
};

/**
 * Tests generateMetadata function for dynamic pages
 */
export const testGenerateMetadata = async (
  generateMetadata: (props: { params: Promise<{ id: string }> }) => Promise<{ title?: string; description?: string }>,
  testId = 'test-123'
) => {
  const metadata = await generateMetadata({
    params: Promise.resolve({ id: testId }),
  });
  expect(metadata).toBeDefined();
  expect(metadata.title).toBeDefined();
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
