import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@context/(.*)$': '<rootDir>/context/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@data/(.*)$': '<rootDir>/data/$1',
    '^@theme/(.*)$': '<rootDir>/theme/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};

export default config;
