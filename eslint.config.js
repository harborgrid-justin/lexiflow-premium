/**
 * Root-level ESLint configuration for LexiFlow monorepo
 * 
 * This config handles the workspace structure and delegates to
 * workspace-specific configs for frontend and backend.
 * 
 * DEBUGGING: Set DEBUG=eslint:* in environment to see detailed logs
 */

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    // Global ignores for monorepo root
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.d.ts',
      
      // Delegate to workspace-specific configs
      'frontend/**',
      'backend/**',
      'packages/**',
      
      // Root-level ignores
      'FRONTEND_LOADING_TRACE.md',
      'docs/**',
      '.github/**',
      '.git/**',
    ],
  },
  {
    // Minimal config for root-level JS files only
    files: ['*.js', '*.mjs', '*.cjs'],
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
