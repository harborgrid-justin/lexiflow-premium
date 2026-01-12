/**
 * MSW Setup for Tests
 * Configure Mock Service Worker for all tests
 */

import {
  resetServerHandlers,
  startServer,
  stopServer,
} from "./utils/mswHandlers";

// Establish API mocking before all tests
beforeAll(() => {
  startServer();
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  resetServerHandlers();
});

// Clean up after all tests are done
afterAll(() => {
  stopServer();
});
