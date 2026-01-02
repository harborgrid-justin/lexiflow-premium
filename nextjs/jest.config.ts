/**
 * Jest Configuration for Next.js 16
 *
 * @see https://nextjs.org/docs/testing#jest-and-react-testing-library
 */

import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Module paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Globals for import.meta support
  globals: {
    "import.meta": {
      env: {
        DEV: false,
        MODE: "test",
        VITE_ENV: "test",
      },
    },
  },

  // Test match patterns
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/*.{spec,test}.{ts,tsx}"],

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
  ],

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Transform files
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
