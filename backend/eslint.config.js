import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Get current directory for tsconfigRootDir
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// DEBUGGING: Uncomment to see resolved paths
// console.log('[ESLint Debug] Backend config loaded');
// console.log('[ESLint Debug] tsconfigRootDir:', __dirname);
// console.log('[ESLint Debug] tsconfig path:', __dirname + '/tsconfig.json');

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        
        // Enterprise debugging options
        EXPERIMENTAL_useProjectService: false,
        debugLevel: process.env.ESLINT_DEBUG ? ['typescript-eslint'] : undefined,
      },
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-octal-escape': 'error',

      // Best practices
      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-throw-literal': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '**/*.js',
      '**/*.d.ts',
      'test/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      'scripts/**',
    ],
  }
);
