/**
 * React Testing Library Render Helpers
 * Custom render functions with common providers
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock ThemeProvider (adjust import based on your actual theme provider)
const MockThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Custom render with Router
 */
export const renderWithRouter = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  }: RenderOptions & { initialEntries?: string[] } = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Custom render with Theme
 */
export const renderWithTheme = (
  ui: ReactElement,
  renderOptions?: RenderOptions
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockThemeProvider>{children}</MockThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Custom render with Router and Theme
 */
export const renderWithProviders = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    ...renderOptions
  }: RenderOptions & { initialEntries?: string[] } = {}
): RenderResult => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <MockThemeProvider>{children}</MockThemeProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Custom render with Query Client mock
 */
export const renderWithQueryClient = (
  ui: ReactElement,
  renderOptions?: RenderOptions
): RenderResult => {
  // Mock query client context if needed
  return render(ui, renderOptions);
};

/**
 * Mock DataService for component tests
 */
export const createMockDataService = () => ({
  cases: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    add: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true),
  },
  docket: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    add: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true),
    getByCaseId: jest.fn().mockResolvedValue([]),
  },
  evidence: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    add: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true),
    getByCaseId: jest.fn().mockResolvedValue([]),
  },
  documents: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    add: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true),
  },
  users: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    getCurrentUser: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'associate',
    }),
  },
});

/**
 * Setup DataService mock in beforeEach
 */
export const setupDataServiceMock = () => {
  const mockDataService = createMockDataService();

  beforeEach(() => {
    // Mock the DataService module
    jest.mock('../../src/services/dataService', () => ({
      DataService: mockDataService,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  return mockDataService;
};

/**
 * Wait for element to be removed (useful for loading states)
 */
export { waitForElementToBeRemoved } from '@testing-library/react';

/**
 * Re-export common testing utilities
 */
export { screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
