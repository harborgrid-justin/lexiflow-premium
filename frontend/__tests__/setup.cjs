/**
 * Jest test setup file (CommonJS)
 * Configures global mocks and test utilities
 */

// Import jest-dom matchers
require('@testing-library/jest-dom');

// Set environment variables for tests (import.meta.env is transformed to process.env)
process.env.VITE_ENV = 'test';
process.env.MODE = 'test';
process.env.DEV = 'true';
process.env.PROD = 'false';
process.env.SSR = 'false';
process.env.VITE_API_URL = 'http://localhost:3001';
process.env.VITE_APP_NAME = 'LexiFlow';
process.env.VITE_AUTH_TOKEN_KEY = 'lexiflow_auth_token';

// Suppress console warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Allow through actual test failures but suppress React warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
       args[0].includes('Not implemented:') ||
       args[0].includes('Could not parse CSS'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });

  console.warn = jest.fn((...args) => {
    // Suppress common warnings
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: function() { return 'test-uuid-' + Math.random().toString(36).substring(7); },
    getRandomValues: function(arr) {
      for (var i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return true; },
    };
  },
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(function() {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(function() {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
});

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true
});

// Mock sessionStorage
var sessionStorageMock = (function() {
  var store = {};
  return {
    getItem: jest.fn(function(key) { return store[key] || null; }),
    setItem: jest.fn(function(key, value) { store[key] = value.toString(); }),
    removeItem: jest.fn(function(key) { delete store[key]; }),
    clear: jest.fn(function() { store = {}; }),
  };
})();
Object.defineProperty(global, 'sessionStorage', { value: sessionStorageMock });
