# API Folder Organization - Architecture Notes

## Root-Level Files (Intentionally Kept)

The following files remain in the `/frontend/src/api` root directory for architectural reasons:

### `data-platform-api.ts`
**Purpose**: Backward-compatible barrel export for data platform services  
**Reason**: Provides a single import point that re-exports from `./data-platform/` folder  
**Status**: Active - Used by legacy code and external integrations  
**Migration Path**: 
```typescript
// Old (still works)
import { dataPlatformApi } from '@/api/data-platform-api';

// New (preferred)
import { dataPlatformApi } from '@/api/data-platform';
```

### `pipelines-api.ts`, `query-workbench-api.ts`, `schema-management-api.ts`
**Purpose**: Legacy backward compatibility layer  
**Reason**: Some external code may still import these directly  
**Status**: These are DUPLICATES of files in `data-platform/` folder  
**Action Required**: These should be removed after verifying no external dependencies

## Recommendation: Remove Duplicate Root Files

The following root-level files are duplicates and should be removed:

```powershell
# Verify no imports before removing
cd C:\temp\lexiflow-premium\frontend\src\api
Remove-Item -Path pipelines-api.ts, query-workbench-api.ts, schema-management-api.ts -WhatIf
```

Before removing, search the codebase for any direct imports:
```powershell
# Check for direct imports in the frontend
cd C:\temp\lexiflow-premium\frontend
rg "from.*['\"]@/api/(pipelines-api|query-workbench-api|schema-management-api)['\"]"
rg "from.*['\"].*/(pipelines-api|query-workbench-api|schema-management-api)['\"]"
```

## Organization Summary

### ✅ Fully Organized Domains
All API services organized into domain folders:
- `auth/` - 7 files
- `litigation/` - 9 files  
- `discovery/` - 14 files
- `billing/` - 9 files
- `trial/` - 3 files
- `workflow/` - 8 files
- `communications/` - 6 files
- `compliance/` - 5 files
- `integrations/` - 6 files
- `analytics/` - 14 files
- `admin/` - 13 files
- `data-platform/` - 11 files
- `hr/` - 2 files
- `types/` - 62 files

### ✅ Updated Domain Aggregations
All files in `domains/` folder now correctly import from organized folders:
- ✅ `auth.api.ts` → imports from `auth/`
- ✅ `litigation.api.ts` → imports from `litigation/`
- ✅ `discovery.api.ts` → imports from `discovery/`
- ✅ `billing.api.ts` → imports from `billing/`
- ✅ `trial.api.ts` → imports from `trial/`
- ✅ `workflow.api.ts` → imports from `workflow/`
- ✅ `communications.api.ts` → imports from `communications/`
- ✅ `compliance.api.ts` → imports from `compliance/`
- ✅ `integrations.api.ts` → imports from `integrations/` and `data-platform/`
- ✅ `analytics.api.ts` → imports from `analytics/`, `billing/`, and `discovery/`
- ✅ `admin.api.ts` → imports from `admin/` and `analytics/`
- ✅ `data-platform.api.ts` → imports from `data-platform/`
- ✅ `hr.api.ts` → imports from `hr/`

### ✅ Main Index Export
The main `index.ts` properly exports:
- All domain folders via barrel exports
- All legacy domain aggregations for backward compatibility
- Type definitions from `types/` folder
- Consolidated `api` object for simplified access

## Testing Checklist

Before considering the migration complete, verify:

- [ ] No TypeScript compilation errors
- [ ] All imports in `domains/*.api.ts` point to organized folders
- [ ] No duplicate exports in `index.ts`
- [ ] All organized folders have proper `index.ts` files
- [ ] Type definitions properly exported from `types/`
- [ ] Legacy import patterns still work (backward compatibility)
- [ ] New import patterns work correctly

## Next Steps

1. **Test Compilation**: Run `npm run build` to ensure no errors
2. **Verify Imports**: Search for broken imports across the codebase
3. **Remove Duplicates**: After confirming no dependencies, remove root-level duplicates
4. **Update Documentation**: Ensure all docs reference new import patterns
5. **Communicate Changes**: Notify team about new folder structure
