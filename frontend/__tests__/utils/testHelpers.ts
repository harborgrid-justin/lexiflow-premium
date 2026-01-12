/**
 * Test Helper Utilities
 * Common helper functions for testing
 */

import { act } from "@testing-library/react";

/**
 * Wait for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 3000,
  interval: number = 50
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition");
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

/**
 * Flush all pending promises
 */
export const flushPromises = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 0)));

/**
 * Wait for specific time (for use with fake timers)
 */
export const advanceTimersByTime = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

/**
 * Run all timers (for use with fake timers)
 */
export const runAllTimers = async () => {
  await act(async () => {
    jest.runAllTimers();
  });
};

/**
 * Setup fake timers for a test
 */
export const setupFakeTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };

  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
};

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = () => {
  let store: Record<string, string> = {};

  const sessionStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };

  Object.defineProperty(window, "sessionStorage", {
    value: sessionStorageMock,
    writable: true,
  });

  return sessionStorageMock;
};

/**
 * Mock console methods
 */
export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  return originalConsole;
};

/**
 * Create mock file for testing file uploads
 */
export const createMockFile = (
  name: string = "test.pdf",
  size: number = 1024,
  type: string = "application/pdf"
): File => {
  const blob = new Blob(["test content"], { type });
  return new File([blob], name, { type });
};

/**
 * Create mock FileList for testing file inputs
 */
export const createMockFileList = (files: File[]): FileList => {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  };

  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true,
    });
  });

  return fileList as FileList;
};

/**
 * Mock IntersectionObserver
 */
export const mockIntersectionObserver = () => {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: null,
    rootMargin: "",
    thresholds: [],
    takeRecords: () => [],
  }));

  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    trigger: (entries: Partial<IntersectionObserverEntry>[]) => {
      const callback = (global.IntersectionObserver as jest.Mock).mock
        .calls[0][0];
      callback(entries);
    },
  };
};

/**
 * Mock ResizeObserver
 */
export const mockResizeObserver = () => {
  const mockObserve = jest.fn();
  const mockUnobserve = jest.fn();
  const mockDisconnect = jest.fn();

  global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }));

  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    trigger: (entries: Partial<ResizeObserverEntry>[]) => {
      const callback = (global.ResizeObserver as jest.Mock).mock.calls[0][0];
      callback(entries);
    },
  };
};

/**
 * Mock matchMedia
 */
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

/**
 * Create a deferred promise for testing async operations
 */
export const createDeferred = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};

/**
 * Suppress console errors during a test
 */
export const suppressConsoleError = (pattern?: RegExp) => {
  const originalError = console.error;

  beforeEach(() => {
    console.error = (...args: unknown[]) => {
      const message = args[0]?.toString() || "";
      if (!pattern || !pattern.test(message)) {
        originalError(...args);
      }
    };
  });

  afterEach(() => {
    console.error = originalError;
  });
};
