import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Get current directory for tsconfigRootDir
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// DEBUGGING: Uncomment to see resolved paths
// console.log('[ESLint Debug] Frontend config loaded');
// console.log('[ESLint Debug] tsconfigRootDir:', __dirname);
// console.log('[ESLint Debug] tsconfig path:', __dirname + '/tsconfig.json');

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
        
        // Enterprise debugging options
        EXPERIMENTAL_useProjectService: false,
        debugLevel: process.env.ESLINT_DEBUG ? ['typescript-eslint'] : undefined,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.js',
      '**/*.d.ts',
      '__tests__/**',
    ],
  }
);
