/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
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
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.cjs'],
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  clearMocks: true,
  resetMocks: true,
};

module.exports = config;
