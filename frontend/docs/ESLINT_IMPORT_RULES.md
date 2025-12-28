# ESLint Import Rules Configuration

This configuration enforces absolute imports and prevents common import anti-patterns.

## Installation

```bash
npm install -D eslint-plugin-import @typescript-eslint/parser
```

## Configuration

Add to your `eslint.config.js` or `.eslintrc.json`:

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'import': importPlugin,
    },
    rules: {
      // Enforce absolute imports (no relative imports across directories)
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['../*', '../../*', '../../../*'],
            message: 'Use absolute imports (@/) instead of relative imports across directories.',
          },
          {
            group: ['**/types/**'],
            message: 'Import types from @/types barrel export, not from types/ subdirectories.',
          },
        ],
      }],

      // Ensure consistent import ordering
      'import/order': ['error', {
        'groups': [
          'builtin',  // Node.js built-in modules
          'external', // npm packages
          'internal', // @/ aliased imports
          'parent',   // ../ relative imports
          'sibling',  // ./ relative imports
          'index',    // ./index
          'type',     // type imports
        ],
        'pathGroups': [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'never',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      }],

      // Prefer type imports
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],

      // No default exports (except for React components and routes)
      'import/no-default-export': 'warn',

      // Prevent circular dependencies
      'import/no-cycle': ['error', {
        maxDepth: 10,
        ignoreExternal: true,
      }],

      // No duplicate imports
      'import/no-duplicates': 'error',

      // Ensure imports point to files that exist
      'import/no-unresolved': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    // Allow relative imports within test files
    files: ['**/__tests__/**/*', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
```

## Example Violations and Fixes

### ❌ Violation: Relative Import

```typescript
// ❌ Error: Use absolute imports (@/) instead
import { queryKeys } from '../../../utils/queryKeys';
import { Case } from '../../types/models';
```

### ✅ Fix: Absolute Import

```typescript
// ✅ Correct
import { queryKeys } from '@/utils/queryKeys';
import { Case } from '@/types';
```

### ❌ Violation: Importing from Types Subdirectory

```typescript
// ❌ Error: Import from barrel export
import { Case } from '@/types/models';
import { SearchResult } from '@/types/search';
```

### ✅ Fix: Import from Barrel

```typescript
// ✅ Correct
import { Case, SearchResult } from '@/types';
```

### ❌ Violation: Mixed Import Types

```typescript
// ❌ Error: Separate type imports
import { Case, type CaseStatus } from '@/types';
```

### ✅ Fix: Consistent Type Imports

```typescript
// ✅ Correct
import type { Case, CaseStatus } from '@/types';
// OR
import { Case, CaseStatus } from '@/types';
```

## Auto-Fix

Many of these rules support auto-fixing:

```bash
# Fix all auto-fixable issues
npx eslint --fix src/

# Check without fixing
npx eslint src/
```

## VS Code Integration

Add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint staged files
npx lint-staged
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Migration Strategy

1. **Gradually enable rules**: Start with warnings, then upgrade to errors
2. **Fix directory by directory**: hooks/ → utils/ → features/
3. **Use auto-fix**: Many issues can be fixed automatically
4. **Update as you go**: Fix imports when touching files for other reasons

## Impact

- **Consistency**: All imports follow the same pattern
- **Maintainability**: Easy to move files without breaking imports
- **Code Quality**: Prevents circular dependencies and duplicate imports
- **Developer Experience**: Clear error messages guide correct usage
