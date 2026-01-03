# ESLint Fixes Batch 1 - Critical Errors

## Summary
Total issues: 775 (448 errors, 327 warnings)

## Priority Order
1. Parsing errors (blocking compilation)
2. Unused variables with underscore prefix (errors)
3. Empty object patterns (errors)
4. no-case-declarations (errors)
5. no-constant-binary-expression (errors)
6. no-constant-condition (errors)
7. Replace all `any` types (warnings)
8. React hooks dependencies (warnings)

## Critical Parsing Errors to Fix First
1. ✅ workflows/instance.$instanceId.tsx - FIXED
2. BackendHealthMonitor.tsx (2 instances)
3. PDFViewer.tsx
4. DocumentUploader.tsx
5. storage.ts (2 instances)
6. EnhancedSearch.old.tsx
7. AdaptiveLoader.tsx
8. validation.ts

## Batch Strategy
Due to the volume, I'll:
1. Fix all unused variable errors by prefixing with `_`
2. Fix all empty object patterns
3. Fix parsing errors
4. Fix constant binary expression errors
5. Replace `any` types with `unknown` or proper types
6. Address React hooks warnings

## Files Fixed So Far
- ✅ routes/workflows/instance.$instanceId.tsx
- ✅ routes/cases/create.tsx
- ✅ routes/admin/audit.tsx (partial)