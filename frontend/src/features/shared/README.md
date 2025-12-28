# Shared Feature Layer

This directory contains cross-cutting concerns used by multiple feature modules.

## Purpose

The shared layer exists to:
1. **Prevent direct cross-feature dependencies** - Features should not import directly from other features
2. **Reduce code duplication** - Common utilities are centralized here
3. **Provide clear boundaries** - Shared code is explicitly marked as reusable

## Structure

```
shared/
├── components/     → Business components used by multiple features
├── hooks/          → Custom hooks reused across features
├── services/       → Business services (AI, documents, etc.)
├── types/          → Domain types shared between features
└── utils/          → Helper functions and utilities
```

## Usage Guidelines

### When to Add Code Here

Add code to `shared/` when:
- ✅ 3+ features use the same utility/component
- ✅ Code provides cross-feature communication
- ✅ Logic is feature-agnostic (not tied to one domain)

### When NOT to Add Code Here

Keep code in feature folders when:
- ❌ Only 1-2 features use it (prefer duplication)
- ❌ Code is tightly coupled to a specific feature
- ❌ It's a pure UI component (use `/components` instead)

### Import Rules

```typescript
// ✅ Correct: Import from shared layer
import { GeminiService } from '@features/shared/services';
import { useDocumentUpload } from '@features/shared/hooks';

// ❌ Wrong: Direct cross-feature imports
import { GeminiService } from '@features/knowledge/services/gemini';
import { DocumentUpload } from '@features/operations/documents/upload';
```

## Migration Process

When extracting code to shared:

1. **Copy** the code to appropriate shared subdirectory
2. **Update exports** in `shared/[subdirectory]/index.ts`
3. **Update imports** in consuming features
4. **Remove** original code from feature directory
5. **Test** that all features still work

## Examples

### Shared Service
```typescript
// features/shared/services/ai/gemini.ts
export class GeminiService {
  async analyze(content: string) {
    // Implementation
  }
}

// features/knowledge/research/ResearchTool.tsx
import { GeminiService } from '@features/shared/services';
```

### Shared Hook
```typescript
// features/shared/hooks/useDocumentUpload.ts
export function useDocumentUpload() {
  // Implementation
}

// features/litigation/evidence/EvidenceIntake.tsx
import { useDocumentUpload } from '@features/shared/hooks';
```

## Principles

1. **Rule of Three** - Wait until 3 features need it before extracting
2. **High Cohesion** - Group related utilities together
3. **Low Coupling** - Minimize dependencies between shared modules
4. **Explicit Exports** - Always use barrel exports (index.ts)
