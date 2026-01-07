/**
 * Jest Setup File for Provider Testing
 *
 * This file runs before each provider test suite and sets up:
 * - localStorage/sessionStorage mocks
 * - Window event mocks (online/offline, matchMedia)
 * - React context testing utilities
 * - Mock implementations for external services
 * - Custom matchers for provider assertions
 * - Timer utilities for async provider tests
 */

import "@testing-library/jest-dom";

// ============================================================================
// Environment Variables for Testing
// ============================================================================
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";

// ============================================================================
// Storage Mock Implementation
// ============================================================================

class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  // Test helper methods
  __getStore(): Map<string, string> {
    return new Map(this.store);
  }

  __setStore(data: Record<string, string>): void {
    this.store = new Map(Object.entries(data));
  }
}

// Create mock storage instances
const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

// Override global storage
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Export for test access
export { mockLocalStorage, mockSessionStorage };

// ============================================================================
// Online/Offline Event Simulation
// ============================================================================

interface NetworkState {
  isOnline: boolean;
  listeners: {
    online: Set<EventListener>;
    offline: Set<EventListener>;
  };
}

const networkState: NetworkState = {
  isOnline: true,
  listeners: {
    online: new Set(),
    offline: new Set(),
  },
};

// Mock navigator.onLine
Object.defineProperty(navigator, "onLine", {
  get: () => networkState.isOnline,
  configurable: true,
});

// Track event listeners for online/offline
const originalAddEventListener = window.addEventListener.bind(window);
const originalRemoveEventListener = window.removeEventListener.bind(window);

window.addEventListener = jest.fn((type: string, listener: EventListener) => {
  if (type === "online") {
    networkState.listeners.online.add(listener);
  } else if (type === "offline") {
    networkState.listeners.offline.add(listener);
  }
  originalAddEventListener(type, listener);
});

window.removeEventListener = jest.fn(
  (type: string, listener: EventListener) => {
    if (type === "online") {
      networkState.listeners.online.delete(listener);
    } else if (type === "offline") {
      networkState.listeners.offline.delete(listener);
    }
    originalRemoveEventListener(type, listener);
  }
);

/**
 * Simulate going online
 */
export function simulateOnline(): void {
  networkState.isOnline = true;
  networkState.listeners.online.forEach((listener) => {
    listener(new Event("online"));
  });
}

/**
 * Simulate going offline
 */
export function simulateOffline(): void {
  networkState.isOnline = false;
  networkState.listeners.offline.forEach((listener) => {
    listener(new Event("offline"));
  });
}

/**
 * Reset network state
 */
export function resetNetworkState(): void {
  networkState.isOnline = true;
  // Don't clear listeners - they get cleaned up by component unmount
}

// ============================================================================
// matchMedia Mock (for ThemeProvider)
// ============================================================================

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((ev: MediaQueryListEvent) => void) | null;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

const mediaQueryListeners: Map<string, Set<(e: MediaQueryListEvent) => void>> =
  new Map();
let prefersDarkMode = false;

const createMockMediaQueryList = (query: string): MockMediaQueryList => {
  const matches =
    query === "(prefers-color-scheme: dark)" ? prefersDarkMode : false;

  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
      if (event === "change") {
        if (!mediaQueryListeners.has(query)) {
          mediaQueryListeners.set(query, new Set());
        }
        mediaQueryListeners.get(query)!.add(listener);
      }
    }),
    removeEventListener: jest.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
      if (event === "change") {
        mediaQueryListeners.get(query)?.delete(listener);
      }
    }),
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    dispatchEvent: jest.fn(),
  };
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn(createMockMediaQueryList),
});

/**
 * Simulate system theme change
 */
export function simulateSystemThemeChange(isDark: boolean): void {
  prefersDarkMode = isDark;
  const query = "(prefers-color-scheme: dark)";
  const listeners = mediaQueryListeners.get(query);
  if (listeners) {
    const event = {
      matches: isDark,
      media: query,
    } as MediaQueryListEvent;
    listeners.forEach((listener) => listener(event));
  }
}

// ============================================================================
// crypto.randomUUID Mock
// ============================================================================

let uuidCounter = 0;

if (!global.crypto) {
  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: () => `test-uuid-${++uuidCounter}-${Date.now()}`,
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
    },
  });
} else if (!global.crypto.randomUUID) {
  Object.defineProperty(global.crypto, "randomUUID", {
    value: () => `test-uuid-${++uuidCounter}-${Date.now()}`,
  });
}

// ============================================================================
// Document/DOM Mocks
// ============================================================================

// Mock document.documentElement for ThemeProvider
const mockClassList = {
  _classes: new Set<string>(),
  add: jest.fn(function (this: typeof mockClassList, ...classes: string[]) {
    classes.forEach((c) => this._classes.add(c));
  }),
  remove: jest.fn(function (this: typeof mockClassList, ...classes: string[]) {
    classes.forEach((c) => this._classes.delete(c));
  }),
  contains: jest.fn(function (this: typeof mockClassList, className: string) {
    return this._classes.has(className);
  }),
  toggle: jest.fn(function (this: typeof mockClassList, className: string) {
    if (this._classes.has(className)) {
      this._classes.delete(className);
      return false;
    }
    this._classes.add(className);
    return true;
  }),
};

Object.defineProperty(document.documentElement, "classList", {
  value: mockClassList,
  writable: true,
});

// ============================================================================
// Console Filtering
// ============================================================================

const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.log in tests
  console.log = jest.fn();

  // Filter out expected errors
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    const suppressedPatterns = [
      "Warning: ReactDOM.render",
      "Warning: An update to",
      "act(...)",
      "[AuthProvider]",
      "[Sync]",
      "[ToastContext]",
      "Expected test error",
    ];
    if (suppressedPatterns.some((pattern) => message.includes(pattern))) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  // Suppress specific warnings
  console.warn = (...args: unknown[]) => {
    const message = String(args[0]);
    const suppressedPatterns = [
      "experimental",
      "deprecated",
      "[ToastContext] Queue at capacity",
    ];
    if (suppressedPatterns.some((pattern) => message.includes(pattern))) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// ============================================================================
// Custom Jest Matchers for Provider Testing
// ============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAuthenticated(): R;
      toHaveTheme(theme: "light" | "dark"): R;
      toHaveToastCount(count: number): R;
      toHaveSyncStatus(status: string): R;
      toBeOnline(): R;
      toHaveStorageItem(key: string, value?: string): R;
    }
  }
}

expect.extend({
  /**
   * Assert user is authenticated (has user object)
   */
  toBeAuthenticated(received: { user: unknown; isAuthenticated: boolean }) {
    const pass = received.user !== null && received.isAuthenticated === true;
    return {
      pass,
      message: () =>
        pass
          ? `Expected user not to be authenticated`
          : `Expected user to be authenticated, but user is ${received.user} and isAuthenticated is ${received.isAuthenticated}`,
    };
  },

  /**
   * Assert current theme mode
   */
  toHaveTheme(
    received: { mode: string; isDark: boolean },
    expected: "light" | "dark"
  ) {
    const pass =
      received.mode === expected &&
      received.isDark === (expected === "dark");
    return {
      pass,
      message: () =>
        pass
          ? `Expected theme not to be ${expected}`
          : `Expected theme to be ${expected}, but got mode=${received.mode}, isDark=${received.isDark}`,
    };
  },

  /**
   * Assert toast count
   */
  toHaveToastCount(received: { toasts: unknown[] }, count: number) {
    const actual = received.toasts.length;
    const pass = actual === count;
    return {
      pass,
      message: () =>
        pass
          ? `Expected not to have ${count} toasts`
          : `Expected ${count} toasts, but got ${actual}`,
    };
  },

  /**
   * Assert sync status
   */
  toHaveSyncStatus(received: { syncStatus: string }, status: string) {
    const pass = received.syncStatus === status;
    return {
      pass,
      message: () =>
        pass
          ? `Expected sync status not to be ${status}`
          : `Expected sync status to be ${status}, but got ${received.syncStatus}`,
    };
  },

  /**
   * Assert online status
   */
  toBeOnline(received: { isOnline: boolean }) {
    const pass = received.isOnline === true;
    return {
      pass,
      message: () =>
        pass
          ? `Expected to be offline`
          : `Expected to be online, but isOnline is ${received.isOnline}`,
    };
  },

  /**
   * Assert localStorage/sessionStorage has item
   */
  toHaveStorageItem(
    received: Storage,
    key: string,
    expectedValue?: string
  ) {
    const actualValue = received.getItem(key);
    const hasKey = actualValue !== null;
    const valueMatches =
      expectedValue === undefined || actualValue === expectedValue;
    const pass = hasKey && valueMatches;
    return {
      pass,
      message: () => {
        if (!hasKey) {
          return `Expected storage to have key "${key}", but it was not found`;
        }
        if (!valueMatches) {
          return `Expected storage key "${key}" to have value "${expectedValue}", but got "${actualValue}"`;
        }
        return `Expected storage not to have key "${key}"`;
      },
    };
  },
});

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================

beforeEach(() => {
  // Clear storage before each test
  mockLocalStorage.clear();
  mockSessionStorage.clear();

  // Reset network state
  resetNetworkState();

  // Reset UUID counter
  uuidCounter = 0;

  // Reset theme preference
  prefersDarkMode = false;

  // Reset document classList
  mockClassList._classes.clear();

  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore mocks
  jest.restoreAllMocks();

  // Clear any pending timers
  jest.clearAllTimers();
});

// ============================================================================
// Exported Test Utilities
// ============================================================================

/**
 * Wait for all pending promises to resolve
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a specific condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout: number = 5000,
  interval: number = 50
): Promise<void> {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Condition not met within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create a deferred promise for testing async operations
 */
export function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Setup pre-populated localStorage for auth testing
 */
export function setupAuthenticatedStorage(user: {
  id: string;
  email: string;
  name: string;
  role?: string;
}): void {
  mockLocalStorage.setItem("lexiflow_auth_token", "test-token-12345");
  mockLocalStorage.setItem("lexiflow_auth_user", JSON.stringify({
    ...user,
    role: user.role || "attorney",
    permissions: [],
  }));
}

/**
 * Setup theme preference in localStorage
 */
export function setupThemePreference(theme: "light" | "dark"): void {
  mockLocalStorage.setItem("lexiflow-theme", theme);
}
