/**
 * Jest test setup file (CommonJS)
 * Configures global mocks and test utilities
 */

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
  value: jest.fn().mockImplementation(function(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  }),
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
var localStorageMock = (function() {
  var store = {};
  return {
    getItem: jest.fn(function(key) { return store[key] || null; }),
    setItem: jest.fn(function(key, value) { store[key] = value.toString(); }),
    removeItem: jest.fn(function(key) { delete store[key]; }),
    clear: jest.fn(function() { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

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
