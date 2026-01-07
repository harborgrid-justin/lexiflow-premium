/**
 * Jest Configuration for Provider Testing
 *
 * This configuration is specifically optimized for testing React Context Providers,
 * hooks, and state management logic. Uses jsdom environment for React component testing.
 *
 * Run provider tests with: npm run test:providers
 * Run with coverage: npm run test:providers:coverage
 * Watch mode: npm run test:providers:watch
 *
 * Providers tested:
 * - AuthProvider (authentication state, login/logout)
 * - ThemeProvider (dark/light mode, theme tokens)
 * - ToastProvider (notifications, queue management)
 * - SyncProvider (offline sync, mutation queue)
 * - WindowProvider (window/modal management)
 * - DataSourceProvider (API data sources)
 * - QueryClientProvider (React Query setup)
 *
 * @see https://testing-library.com/docs/react-testing-library/intro/
 */

import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

const config: Config = {
  // Display name for this configuration
  displayName: "providers",

  // Use jsdom environment for React component/hook testing
  testEnvironment: "jsdom",

  // Coverage provider
  coverageProvider: "v8",

  // Setup files that run before each test file
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts", // Base React setup
    "<rootDir>/jest.setup.providers.ts", // Provider-specific setup
  ],

  // Module name mapper for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
    "^@/types/(.*)$": "<rootDir>/src/types/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/providers/(.*)$": "<rootDir>/src/providers/$1",
    "^@/api/(.*)$": "<rootDir>/src/api/$1",
    "^@theme/(.*)$": "<rootDir>/src/components/theme/$1",
    "^@rendering/utils$": "<rootDir>/src/utils/rendering/index.ts",
    // Mock CSS modules
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  // Test match patterns - only provider tests
  testMatch: [
    "<rootDir>/src/providers/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/providers/**/*.{spec,test}.{ts,tsx}",
    "<rootDir>/src/__tests__/providers/**/*.{ts,tsx}",
    "<rootDir>/src/test-utils/providers/**/*.{spec,test}.{ts,tsx}",
  ],

  // Paths to ignore
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/src/app/", // Ignore page/route tests
  ],

  // Coverage collection settings
  collectCoverageFrom: [
    "src/providers/**/*.{ts,tsx}",
    "!src/providers/**/*.d.ts",
    "!src/providers/**/__tests__/**",
    "!src/providers/**/index.ts", // Barrel files
    "!src/providers/**/*.types.ts", // Type-only files
    "!src/providers/**/*.backup.tsx", // Backup files
    "!src/providers/**/*.refactored.tsx", // Refactored files (if not primary)
  ],

  // Coverage thresholds for providers
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Higher thresholds for critical auth provider
    "src/providers/AuthProvider.tsx": {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Repository layer should have solid coverage
    "src/providers/repository/**/*.ts": {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage output directory
  coverageDirectory: "<rootDir>/coverage/providers",

  // Coverage reporters
  coverageReporters: ["text", "text-summary", "lcov", "html", "json"],

  // Transform files with ts-jest
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        isolatedModules: true,
      },
    ],
  },

  // Transform ignore patterns - don't transform node_modules except specific packages
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|@tanstack|framer-motion)/)",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Verbose output
  verbose: true,

  // Test timeout (15 seconds for hook/context tests)
  testTimeout: 15000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks automatically
  restoreMocks: true,

  // Reset modules between tests (important for context isolation)
  resetModules: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after tests complete
  forceExit: true,

  // Maximum workers for parallel test execution
  maxWorkers: "50%",

  // Globals
  globals: {
    "ts-jest": {
      useESM: false,
    },
  },

  // Reporter configuration
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./coverage/providers/html-report",
        filename: "provider-test-report.html",
        openReport: false,
        expand: true,
      },
    ],
  ],

  // Fake timers configuration (useful for testing auto-dismiss toasts, etc.)
  fakeTimers: {
    enableGlobally: false, // Enable per-test as needed
    legacyFakeTimers: false,
  },

  // Watch plugins for interactive mode
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Projects configuration for running specific provider test suites
  // Uncomment to enable project-based organization
  // projects: [
  //   {
  //     displayName: 'auth-provider',
  //     testMatch: ['<rootDir>/src/providers/**/Auth*.test.{ts,tsx}'],
  //   },
  //   {
  //     displayName: 'theme-provider',
  //     testMatch: ['<rootDir>/src/providers/**/Theme*.test.{ts,tsx}'],
  //   },
  //   {
  //     displayName: 'toast-provider',
  //     testMatch: ['<rootDir>/src/providers/**/Toast*.test.{ts,tsx}'],
  //   },
  //   {
  //     displayName: 'sync-provider',
  //     testMatch: ['<rootDir>/src/providers/**/Sync*.test.{ts,tsx}'],
  //   },
  //   {
  //     displayName: 'repository',
  //     testMatch: ['<rootDir>/src/providers/repository/**/*.test.{ts,tsx}'],
  //   },
  // ],

  // Snapshot serializers for React components
  snapshotSerializers: [],

  // Bail on first failure (useful for CI)
  // bail: 1,
};

// Export the async config
export default createJestConfig(config);
