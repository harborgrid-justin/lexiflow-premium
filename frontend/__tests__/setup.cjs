/**
 * Jest test setup file (CommonJS)
 * Configures global mocks and test utilities
 */

// Import jest-dom matchers
require("@testing-library/jest-dom");

// Polyfill TextEncoder/TextDecoder for jsdom
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web Streams API for MSW
try {
  const {
    ReadableStream,
    WritableStream,
    TransformStream,
  } = require("web-streams-polyfill/ponyfill");
  global.ReadableStream = global.ReadableStream || ReadableStream;
  global.WritableStream = global.WritableStream || WritableStream;
  global.TransformStream = global.TransformStream || TransformStream;
} catch (e) {
  // Fallback if web-streams-polyfill is not installed
  console.warn("web-streams-polyfill not found, using minimal polyfill");
}

// Polyfill fetch API for MSW in jsdom
if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || "";
      this.headers = new Map(Object.entries(init.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }
  };
}

if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this.headers = new Map(Object.entries(init.headers || {}));
      this.body = init.body;
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }
  };
}

if (typeof global.Headers === "undefined") {
  global.Headers = Map;
}

// Polyfill BroadcastChannel for MSW
if (typeof global.BroadcastChannel === "undefined") {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name;
      this._listeners = [];
    }

    postMessage(message) {
      this._listeners.forEach((listener) => {
        listener({ data: message, target: this });
      });
    }

    addEventListener(type, listener) {
      if (type === "message") {
        this._listeners.push(listener);
      }
    }

    removeEventListener(type, listener) {
      if (type === "message") {
        const index = this._listeners.indexOf(listener);
        if (index > -1) {
          this._listeners.splice(index, 1);
        }
      }
    }

    close() {
      this._listeners = [];
    }
  };
}

// Set environment variables for tests (import.meta.env is transformed to process.env)
process.env.VITE_ENV = "test";
process.env.MODE = "test";
process.env.DEV = "true";
process.env.PROD = "false";
process.env.SSR = "false";
process.env.VITE_API_URL = "http://localhost:3001";
process.env.VITE_APP_NAME = "LexiFlow";
process.env.VITE_AUTH_TOKEN_KEY = "lexiflow_auth_token";

// Suppress console warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Allow through actual test failures but suppress React warnings
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") ||
        args[0].includes("Not implemented:") ||
        args[0].includes("Could not parse CSS"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });

  console.warn = jest.fn((...args) => {
    // Suppress common warnings
    if (
      typeof args[0] === "string" &&
      (args[0].includes("componentWillReceiveProps") ||
        args[0].includes("componentWillMount"))
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
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: function () {
      return "test-uuid-" + Math.random().toString(36).substring(7);
    },
    getRandomValues: function (arr) {
      for (var i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return true;
      },
    };
  },
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(function () {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(function () {
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

Object.defineProperty(global, "localStorage", {
  value: new LocalStorageMock(),
  writable: true,
});

// Mock sessionStorage
var sessionStorageMock = (function () {
  var store = {};
  return {
    getItem: jest.fn(function (key) {
      return store[key] || null;
    }),
    setItem: jest.fn(function (key, value) {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(function (key) {
      delete store[key];
    }),
    clear: jest.fn(function () {
      store = {};
    }),
  };
})();
Object.defineProperty(global, "sessionStorage", { value: sessionStorageMock });
