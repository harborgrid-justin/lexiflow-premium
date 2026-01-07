/**
 * Provider Test Helpers
 *
 * Utilities for testing React Context Providers, hooks, and state management.
 * Provides wrapper components, mock factories, and assertion utilities.
 */

import { render, renderHook, type RenderOptions, type RenderHookOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

export interface MockAuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "attorney" | "paralegal" | "staff";
  avatarUrl?: string;
  permissions: string[];
}

export interface MockToast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  priority: number;
  timestamp: number;
}

export interface ProviderWrapperOptions {
  withAuth?: boolean | MockAuthUser;
  withTheme?: boolean | "light" | "dark";
  withToast?: boolean;
  withSync?: boolean;
  withWindow?: boolean;
  withDataSource?: boolean;
  withQueryClient?: boolean;
}

// ============================================================================
// Mock Factories
// ============================================================================

/**
 * Create a mock authenticated user
 */
export function createMockUser(overrides: Partial<MockAuthUser> = {}): MockAuthUser {
  return {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    role: "attorney",
    permissions: ["cases:read", "cases:write", "documents:read"],
    ...overrides,
  };
}

/**
 * Create a mock admin user
 */
export function createMockAdmin(overrides: Partial<MockAuthUser> = {}): MockAuthUser {
  return createMockUser({
    id: "admin-123",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    permissions: ["*"],
    ...overrides,
  });
}

/**
 * Create a mock toast
 */
export function createMockToast(overrides: Partial<MockToast> = {}): MockToast {
  return {
    id: `toast-${Date.now()}`,
    message: "Test notification",
    type: "info",
    priority: 0,
    timestamp: Date.now(),
    ...overrides,
  };
}

// ============================================================================
// Mock Context Values
// ============================================================================

/**
 * Create mock auth state value
 */
export function createMockAuthState(user: MockAuthUser | null = null) {
  return {
    user,
    isLoading: false,
    isAuthenticated: user !== null,
    error: null,
  };
}

/**
 * Create mock auth actions value
 */
export function createMockAuthActions(overrides: Record<string, jest.Mock> = {}) {
  return {
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn().mockResolvedValue(undefined),
    refreshToken: jest.fn().mockResolvedValue(true),
    hasPermission: jest.fn().mockReturnValue(true),
    hasRole: jest.fn().mockReturnValue(true),
    ...overrides,
  };
}

/**
 * Create mock theme state value
 */
export function createMockThemeState(mode: "light" | "dark" = "light") {
  return {
    mode,
    theme: {
      background: mode === "dark" ? "#0f172a" : "#ffffff",
      foreground: mode === "dark" ? "#f8fafc" : "#0f172a",
      primary: "#3b82f6",
      colors: {},
    },
    isDark: mode === "dark",
  };
}

/**
 * Create mock theme actions value
 */
export function createMockThemeActions(overrides: Record<string, jest.Mock> = {}) {
  return {
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock toast state value
 */
export function createMockToastState(toasts: MockToast[] = []) {
  return {
    toasts,
  };
}

/**
 * Create mock toast actions value
 */
export function createMockToastActions(overrides: Record<string, jest.Mock> = {}) {
  return {
    addToast: jest.fn(),
    removeToast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    notifySuccess: jest.fn(),
    notifyError: jest.fn(),
    ...overrides,
  };
}

/**
 * Create mock sync state value
 */
export function createMockSyncState(overrides: Record<string, unknown> = {}) {
  return {
    isOnline: true,
    syncStatus: "idle" as const,
    pendingCount: 0,
    failedCount: 0,
    ...overrides,
  };
}

/**
 * Create mock sync actions value
 */
export function createMockSyncActions(overrides: Record<string, jest.Mock> = {}) {
  return {
    performMutation: jest.fn().mockResolvedValue(undefined),
    retryFailed: jest.fn(),
    ...overrides,
  };
}

// ============================================================================
// Test Wrapper Components
// ============================================================================

/**
 * Create a minimal wrapper for testing isolated hooks
 */
export function createMinimalWrapper(): React.FC<{ children: ReactNode }> {
  return function MinimalWrapper({ children }: { children: ReactNode }) {
    return <>{children}</>;
  };
}

/**
 * Create a wrapper that provides mock contexts
 *
 * Note: For actual provider testing, import and use real providers.
 * These mock wrappers are for testing components that consume providers.
 */
export function createMockProviderWrapper(
  options: ProviderWrapperOptions = {}
): React.FC<{ children: ReactNode }> {
  // Dynamic import of actual contexts would go here
  // For now, return a simple wrapper
  return function MockProviderWrapper({ children }: { children: ReactNode }) {
    return <>{children}</>;
  };
}

// ============================================================================
// Render Utilities
// ============================================================================

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & { providerOptions?: ProviderWrapperOptions } = {}
) {
  const { providerOptions, ...renderOptions } = options;
  const Wrapper = createMockProviderWrapper(providerOptions);

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    // Return additional utilities
    rerender: (newUi: ReactElement) =>
      render(newUi, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Custom renderHook function that wraps hooks with providers
 */
export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> & { providerOptions?: ProviderWrapperOptions } = {}
) {
  const { providerOptions, ...renderOptions } = options;
  const Wrapper = createMockProviderWrapper(providerOptions);

  return renderHook(hook, { wrapper: Wrapper, ...renderOptions });
}

// ============================================================================
// Hook Testing Utilities
// ============================================================================

/**
 * Test that a hook throws when used outside its provider
 */
export async function expectHookToThrowOutsideProvider<T>(
  hook: () => T,
  expectedErrorMessage: string
): Promise<void> {
  // Suppress console.error for expected error
  const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    expect(() => {
      renderHook(hook);
    }).toThrow(expectedErrorMessage);
  } finally {
    consoleSpy.mockRestore();
  }
}

/**
 * Test that a hook returns expected initial values
 */
export function expectHookInitialValues<T extends Record<string, unknown>>(
  result: { current: T },
  expectedValues: Partial<T>
): void {
  Object.entries(expectedValues).forEach(([key, value]) => {
    expect(result.current[key]).toEqual(value);
  });
}

// ============================================================================
// Async Testing Utilities
// ============================================================================

/**
 * Wait for a hook result to satisfy a condition
 */
export async function waitForHookResult<T>(
  result: { current: T },
  condition: (current: T) => boolean,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();
  while (!condition(result.current)) {
    if (Date.now() - startTime > timeout) {
      throw new Error(
        `Hook result did not satisfy condition within ${timeout}ms. Current value: ${JSON.stringify(result.current)}`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete<T extends { isLoading: boolean }>(
  result: { current: T },
  timeout: number = 5000
): Promise<void> {
  await waitForHookResult(result, (current) => !current.isLoading, timeout);
}

// ============================================================================
// Mock API Utilities
// ============================================================================

/**
 * Create a mock API response
 */
export function createMockApiResponse<T>(data: T, status: number = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

/**
 * Setup mock fetch for auth API
 */
export function setupMockAuthApi(options: {
  loginSuccess?: boolean;
  user?: MockAuthUser;
  token?: string;
} = {}) {
  const {
    loginSuccess = true,
    user = createMockUser(),
    token = "mock-jwt-token",
  } = options;

  const mockFetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes("/auth/login")) {
      if (loginSuccess) {
        return Promise.resolve(
          createMockApiResponse({
            accessToken: token,
            refreshToken: "mock-refresh-token",
            user: {
              id: user.id,
              email: user.email,
              firstName: user.name.split(" ")[0],
              lastName: user.name.split(" ")[1] || "",
              role: user.role,
              permissions: user.permissions,
            },
          })
        );
      }
      return Promise.resolve(
        createMockApiResponse({ error: "Invalid credentials" }, 401)
      );
    }

    if (url.includes("/auth/logout")) {
      return Promise.resolve(createMockApiResponse({ success: true }));
    }

    if (url.includes("/auth/refresh")) {
      return Promise.resolve(
        createMockApiResponse({
          accessToken: "new-mock-token",
          refreshToken: "new-refresh-token",
        })
      );
    }

    return Promise.resolve(createMockApiResponse({ error: "Not found" }, 404));
  });

  global.fetch = mockFetch;
  return mockFetch;
}

// ============================================================================
// Timer Utilities
// ============================================================================

/**
 * Advance timers and flush promises
 */
export async function advanceTimersAndFlush(ms: number): Promise<void> {
  jest.advanceTimersByTime(ms);
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Run all timers and flush promises
 */
export async function runAllTimersAndFlush(): Promise<void> {
  jest.runAllTimers();
  await new Promise((resolve) => setImmediate(resolve));
}

// ============================================================================
// Assertion Utilities
// ============================================================================

/**
 * Assert that a function was called with specific arguments
 */
export function expectCalledWith(
  mockFn: jest.Mock,
  ...expectedArgs: unknown[]
): void {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
}

/**
 * Assert that a function was called a specific number of times
 */
export function expectCallCount(mockFn: jest.Mock, count: number): void {
  expect(mockFn).toHaveBeenCalledTimes(count);
}

/**
 * Assert that localStorage contains expected auth data
 */
export function expectAuthStorageSet(
  expectedUser: MockAuthUser,
  expectedToken: string = "mock-jwt-token"
): void {
  expect(localStorage.getItem("lexiflow_auth_token")).toBe(expectedToken);
  const storedUser = JSON.parse(localStorage.getItem("lexiflow_auth_user") || "null");
  expect(storedUser).toMatchObject({
    id: expectedUser.id,
    email: expectedUser.email,
  });
}

/**
 * Assert that auth storage is cleared
 */
export function expectAuthStorageCleared(): void {
  expect(localStorage.getItem("lexiflow_auth_token")).toBeNull();
  expect(localStorage.getItem("lexiflow_auth_user")).toBeNull();
}

// ============================================================================
// Re-exports from testing-library
// ============================================================================

export {
  render,
  renderHook,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
  cleanup,
} from "@testing-library/react";

export { userEvent } from "@testing-library/user-event";
