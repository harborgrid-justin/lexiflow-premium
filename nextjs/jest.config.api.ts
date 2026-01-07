/**
 * Jest Configuration for API Route Testing
 *
 * This configuration is specifically optimized for testing Next.js 16 API routes.
 * It uses node environment (not jsdom) since API routes run on the server.
 *
 * Run API tests with: npm run test:api
 * Run with coverage: npm run test:api:coverage
 * Watch mode: npm run test:api:watch
 *
 * @see https://nextjs.org/docs/app/building-your-application/testing/jest
 */

import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

const config: Config = {
  // Display name for this configuration
  displayName: "api",

  // Use Node environment for API routes (not jsdom)
  testEnvironment: "node",

  // Coverage provider
  coverageProvider: "v8",

  // Setup files that run before each test file
  setupFilesAfterEnv: ["<rootDir>/jest.setup.api.ts"],

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
    "^@theme/(.*)$": "<rootDir>/src/components/theme/$1",
    "^@rendering/utils$": "<rootDir>/src/utils/rendering/index.ts",
  },

  // Test match patterns - only API route tests
  testMatch: [
    "<rootDir>/src/app/api/**/__tests__/**/*.{ts,tsx}",
    "<rootDir>/src/app/api/**/*.{spec,test}.{ts,tsx}",
    "<rootDir>/src/__tests__/api/**/*.{ts,tsx}",
    "<rootDir>/src/test-utils/api/**/*.{spec,test}.{ts,tsx}",
  ],

  // Paths to ignore
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/src/app/\\(main\\)/", // Ignore page routes
  ],

  // Coverage collection settings
  collectCoverageFrom: [
    "src/app/api/**/*.ts",
    "src/lib/backend-proxy.ts",
    "src/lib/api-headers.ts",
    "!src/app/api/**/*.d.ts",
    "!src/app/api/**/__tests__/**",
  ],

  // Coverage thresholds for API routes
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Higher thresholds for critical auth routes
    "src/app/api/auth/**/*.ts": {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage output directory
  coverageDirectory: "<rootDir>/coverage/api",

  // Coverage reporters
  coverageReporters: ["text", "text-summary", "lcov", "html", "json"],

  // Transform files with ts-jest
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          module: "commonjs",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
        isolatedModules: true,
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Verbose output
  verbose: true,

  // Test timeout (30 seconds for API tests that may involve network)
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks automatically
  restoreMocks: true,

  // Detect open handles (useful for API tests with async operations)
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
        publicPath: "./coverage/api/html-report",
        filename: "api-test-report.html",
        openReport: false,
        expand: true,
      },
    ],
  ],

  // Snapshot serializer settings
  snapshotSerializers: [],

  // Projects configuration for running specific test suites
  // Uncomment to enable project-based organization
  // projects: [
  //   {
  //     displayName: 'auth-api',
  //     testMatch: ['<rootDir>/src/app/api/auth/**/*.test.ts'],
  //   },
  //   {
  //     displayName: 'cases-api',
  //     testMatch: ['<rootDir>/src/app/api/cases/**/*.test.ts'],
  //   },
  // ],

  // Watch plugins for interactive mode
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],

  // Fail tests on console warnings/errors (strict mode)
  // Uncomment to enable strict mode
  // errorOnDeprecated: true,

  // Bail on first failure (useful for CI)
  // bail: 1,
};

// Export the async config
export default createJestConfig(config);
