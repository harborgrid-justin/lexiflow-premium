/**
 * ESLint Import Boundaries Configuration
 * 
 * Enforces feature-sliced architecture rules:
 * - Features cannot directly import from other features
 * - Features can only import from shared layer or components
 */

module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@features/*/!(index)', '@features/*/!(index)/**'],
            message: 'Import from feature public API (index.ts) only, not internal modules',
          },
          {
            group: ['@/features/admin/**'],
            message: 'Admin feature is restricted. Use admin APIs or shared layer.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Feature-specific rules
      files: ['src/features/**/*.{ts,tsx}'],
      rules: {
        // Prevent cross-feature imports (except shared)
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@features/cases/**',
                  '@features/litigation/**',
                  '@features/knowledge/**',
                  '@features/operations/**',
                  '@features/admin/**',
                  '@features/dashboard/**',
                  '@features/profile/**',
                  '@features/visual/**',
                  '@features/drafting/**',
                  '@features/document-assembly/**',
                ],
                message: 'Cross-feature imports not allowed. Use @features/shared or feature public API',
              },
            ],
          },
        ],
      },
    },
  ],
};
