/**
 * @fileoverview Enterprise-grade test utilities for feature components
 * @module features/__tests__/test-utils
 *
 * Provides centralized testing utilities including:
 * - Custom render function with all required providers
 * - Mock factories for common data types
 * - Helper functions for async testing
 * - Type-safe test utilities
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// TYPES
// ============================================================================

export interface MockCase {
  id: string;
  title: string;
  caseNumber: string;
  description: string | null;
  status: 'Active' | 'Closed' | 'Pending' | 'On Hold';
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  assignedTo?: string[];
}

export interface MockQuickStat {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface MockDraftingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPublic: boolean;
  variables: string[];
}

export interface MockGeneratedDocument {
  id: string;
  title: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  content?: string;
}

export interface MockDraftingStats {
  drafts: number;
  templates: number;
  pendingReviews: number;
  myTemplates: number;
}

// ============================================================================
// MOCK PROVIDERS
// ============================================================================

/**
 * Mock Theme Context Provider
 */
const mockTheme = {
  background: 'bg-white dark:bg-slate-900',
  surface: {
    default: 'bg-white dark:bg-slate-900',
    raised: 'bg-white dark:bg-slate-800',
    input: 'bg-white dark:bg-slate-800',
  },
  text: {
    primary: 'text-slate-900 dark:text-white',
    secondary: 'text-slate-600 dark:text-slate-400',
    tertiary: 'text-slate-500 dark:text-slate-500',
    link: 'text-blue-600 dark:text-blue-400',
  },
  border: {
    default: 'border-slate-200 dark:border-slate-700',
  },
  primary: {
    text: 'text-blue-600 dark:text-blue-400',
  },
  action: {
    primary: {
      bg: 'bg-blue-600',
      text: 'text-white',
      hover: 'hover:bg-blue-700',
    },
    secondary: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-900 dark:text-white',
      border: 'border-slate-200 dark:border-slate-700',
      hover: 'hover:bg-slate-200 dark:hover:bg-slate-700',
    },
  },
  status: {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
  },
};

const ThemeContext = React.createContext<{ theme: typeof mockTheme }>({ theme: mockTheme });

/**
 * Mock Toast Context Provider
 */
const ToastContext = React.createContext<{
  addToast: jest.Mock;
}>({
  addToast: jest.fn(),
});

/**
 * All Providers wrapper for testing
 */
interface AllProvidersProps {
  children: ReactNode;
}

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const addToast = jest.fn();

  return (
    <ThemeContext.Provider value={{ theme: mockTheme }}>
      <ToastContext.Provider value={{ addToast }}>
        {children}
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
};

// ============================================================================
// CUSTOM RENDER FUNCTION
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

/**
 * Custom render function that wraps components with all required providers
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const user = userEvent.setup();

  const renderResult = render(ui, {
    wrapper: AllProviders,
    ...options,
  });

  return {
    ...renderResult,
    user,
  };
}

// ============================================================================
// MOCK FACTORIES
// ============================================================================

/**
 * Factory for creating mock cases
 */
export const createMockCase = (overrides: Partial<MockCase> = {}): MockCase => ({
  id: `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Smith v. Jones',
  caseNumber: '2024-CV-12345',
  description: 'Commercial litigation matter involving breach of contract',
  status: 'Active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory for creating multiple mock cases
 */
export const createMockCases = (count: number, overrides?: Partial<MockCase>[]): MockCase[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockCase({
      id: `case-${index + 1}`,
      title: `Case ${index + 1} - ${['Smith', 'Johnson', 'Williams', 'Brown', 'Davis'][index % 5]} v. ${['Acme', 'Global', 'Tech', 'Corp', 'Inc'][index % 5]}`,
      caseNumber: `2024-CV-${10000 + index}`,
      status: (['Active', 'Closed', 'Pending', 'On Hold'] as const)[index % 4],
      ...(overrides?.[index] || {}),
    })
  );
};

/**
 * Factory for creating mock quick stats
 */
export const createMockQuickStat = (overrides: Partial<MockQuickStat> = {}): MockQuickStat => ({
  label: 'Active Cases',
  value: 42,
  change: 12,
  trend: 'up',
  ...overrides,
});

/**
 * Factory for creating dashboard stats
 */
export const createMockDashboardStats = (): MockQuickStat[] => [
  { label: 'Active Cases', value: 42, change: 12, trend: 'up' },
  { label: 'Pending Motions', value: 8, change: -3, trend: 'down' },
  { label: 'Billable Hours', value: '156.5', change: 8, trend: 'up' },
  { label: 'High Risk Items', value: 3, change: 2, trend: 'up' },
];

/**
 * Factory for creating mock drafting templates
 */
export const createMockDraftingTemplate = (overrides: Partial<MockDraftingTemplate> = {}): MockDraftingTemplate => ({
  id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Motion to Dismiss',
  description: 'Standard motion to dismiss with legal grounds and supporting arguments',
  category: 'Motions',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
  isPublic: true,
  variables: ['case_title', 'court_name', 'filing_date'],
  ...overrides,
});

/**
 * Factory for creating mock generated documents
 */
export const createMockGeneratedDocument = (overrides: Partial<MockGeneratedDocument> = {}): MockGeneratedDocument => ({
  id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Motion to Dismiss - Smith v. Jones',
  templateId: 'template-1',
  templateName: 'Motion to Dismiss',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
  ...overrides,
});

/**
 * Factory for creating mock drafting stats
 */
export const createMockDraftingStats = (overrides: Partial<MockDraftingStats> = {}): MockDraftingStats => ({
  drafts: 24,
  templates: 12,
  pendingReviews: 5,
  myTemplates: 8,
  ...overrides,
});

// ============================================================================
// ASYNC TESTING HELPERS
// ============================================================================

/**
 * Wait for a specified amount of time (use sparingly)
 */
export const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Flush all pending promises
 */
export const flushPromises = (): Promise<void> =>
  new Promise(resolve => setImmediate(resolve));

/**
 * Wait for loading state to complete
 */
export const waitForLoadingToComplete = async (
  queryFn: () => HTMLElement | null,
  timeout = 5000
): Promise<void> => {
  const startTime = Date.now();

  while (queryFn() && Date.now() - startTime < timeout) {
    await wait(50);
  }

  if (queryFn()) {
    throw new Error(`Loading state did not complete within ${timeout}ms`);
  }
};

// ============================================================================
// FORM TESTING HELPERS
// ============================================================================

/**
 * Fill in a form field by label
 */
export const fillFormField = async (
  user: ReturnType<typeof userEvent.setup>,
  label: string | RegExp,
  value: string,
  container: HTMLElement = document.body
): Promise<void> => {
  const input = container.querySelector(`[aria-label="${label}"]`) ||
    container.querySelector(`input[name="${label}"]`) ||
    container.querySelector(`textarea[name="${label}"]`);

  if (input) {
    await user.clear(input as HTMLElement);
    await user.type(input as HTMLElement, value);
  }
};

/**
 * Submit a form
 */
export const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  submitButtonText: string | RegExp = /submit/i
): Promise<void> => {
  const submitButton = document.querySelector(`button[type="submit"]`) ||
    Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent?.match(submitButtonText)
    );

  if (submitButton) {
    await user.click(submitButton);
  }
};

// ============================================================================
// ACCESSIBILITY TESTING HELPERS
// ============================================================================

/**
 * Check if an element has proper ARIA attributes
 */
export const hasValidAriaAttributes = (element: HTMLElement): boolean => {
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const ariaDescribedBy = element.getAttribute('aria-describedby');

  // Interactive elements should have accessible names
  const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'tab'];

  if (role && interactiveRoles.includes(role)) {
    return !!(ariaLabel || ariaLabelledBy || element.textContent?.trim());
  }

  return true;
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
};

// ============================================================================
// MOCK API HELPERS
// ============================================================================

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T>(data: T, delay = 0): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Create a mock API error
 */
export const createMockApiError = (message: string, status = 500): Promise<never> => {
  return Promise.reject({
    message,
    status,
    response: { data: { error: message } },
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export * from '@testing-library/react';
export { userEvent };
export { customRender as render };

// Re-export Jest globals for convenience
export { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';

// Export mock theme for direct access in tests
export { mockTheme };
