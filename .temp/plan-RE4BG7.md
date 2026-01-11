# Refactoring Plan: Large Domain Service Files

**Agent ID:** typescript-architect
**Task ID:** RE4BG7
**Started:** 2026-01-11
**Target:** Break down 3 files (799, 792, 797 LOC) into ~90 LOC modules

## Overview

This refactoring addresses technical debt by decomposing three large service files into smaller, focused modules that adhere to the Single Responsibility Principle. Each file will be split into 8-9 modules of approximately 90 lines of code.

## Architectural Strategy

### Decomposition Pattern
1. **Type Definitions Module** - All interfaces, types, enums
2. **Query Keys Module** - React Query cache keys
3. **Domain-Specific Operation Modules** - Grouped by responsibility
4. **Index Barrel Module** - Re-exports with backward compatibility

### Type Safety Guarantees
- All exports maintain exact type signatures
- No breaking changes to public API surface
- Proper generic constraints preserved
- Import/export chain maintains type inference

## Phase 1: RealEstateDomain.ts (799 LOC → 9 modules)

### Module Breakdown

#### 1. `types.ts` (~120 LOC)
- All status type unions
- `RealEstateBaseEntity` interface
- 10 entity interfaces (Property, Disposal, Encroachment, etc.)
- `PortfolioStats` interface

#### 2. `queryKeys.ts` (~20 LOC)
- `REAL_ESTATE_QUERY_KEYS` constant object
- Type safety for React Query integration

#### 3. `propertyOperations.ts` (~90 LOC)
- `getAllProperties()`
- `getPropertyById()`
- `createProperty()`
- `updateProperty()`
- `deleteProperty()`

#### 4. `disposalOperations.ts` (~75 LOC)
- `getDisposals()`
- `createDisposal()`
- `updateDisposal()`
- `deleteDisposal()`

#### 5. `encroachmentOperations.ts` (~80 LOC)
- `getEncroachments()`
- `createEncroachment()`
- `updateEncroachment()`
- `resolveEncroachment()`

#### 6. `acquisitionOperations.ts` (~65 LOC)
- `getAcquisitions()`
- `createAcquisition()`
- `updateAcquisition()`

#### 7. `utilizationOperations.ts` (~50 LOC)
- `getUtilization()`
- `updateUtilization()`

#### 8. `financialOperations.ts` (~220 LOC)
- Cost Share operations (~70 LOC)
- Outgrant operations (~50 LOC)
- Solicitation operations (~50 LOC)
- Relocation operations (~50 LOC)

**Split into 3 sub-modules:**
- `costShareOperations.ts` (~70 LOC)
- `outgrantOperations.ts` (~50 LOC)
- `otherFinancialOperations.ts` (~100 LOC)

#### 9. `auditOperations.ts` (~60 LOC)
- `getAuditItems()`
- `updateAuditItem()`
- `getPortfolioStats()`
- `getModuleUsers()`
- `updateUserPermissions()`

#### 10. `index.ts` (~30 LOC)
- Barrel exports maintaining API compatibility
- Re-export `RealEstateService` as default

**Total Modules:** 10 (target: ~90 LOC each)

## Phase 2: BillingDomain.ts (792 LOC → 9 modules)

### Module Breakdown

#### 1. `types.ts` (~50 LOC)
- Import types from `@/types`
- Query parameter interfaces
- Custom error types reference

#### 2. `queryKeys.ts` (~25 LOC)
- `BILLING_QUERY_KEYS` constant object

#### 3. `repository.ts` (~120 LOC)
- `BillingRepository` class scaffolding
- Private validation methods
- Constructor and base setup

#### 4. `timeEntryOperations.ts` (~100 LOC)
- `getAll()`, `getById()`, `add()`, `update()`, `delete()`
- `getTimeEntries()`
- `getPaginatedTimeEntries()`
- `addTimeEntry()`

#### 5. `rateOperations.ts` (~45 LOC)
- `getRates()`
- Rate table type handling

#### 6. `invoiceOperations.ts` (~100 LOC)
- `getInvoices()`
- `createInvoice()`
- `updateInvoice()`
- `sendInvoice()`

#### 7. `trustOperations.ts` (~100 LOC)
- `getTrustAccount()`
- `getTrustTransactions()`
- `getTrustAccounts()`
- IOLTA compliance validation

#### 8. `analyticsOperations.ts` (~120 LOC)
- `getWIPStats()`
- `getRealizationStats()`
- `getTopAccounts()`
- `getOverviewStats()`
- `getOperatingSummary()`
- `getFinancialPerformance()`

#### 9. `utilityOperations.ts` (~40 LOC)
- `sync()`
- `export()`

#### 10. `index.ts` (~50 LOC)
- Export `BillingRepository` class with all methods
- Export query keys
- Export types

**Total Modules:** 10 (target: ~90 LOC each)

## Phase 3: geminiService.ts (797 LOC → 9 modules)

### Module Breakdown

#### 1. `types.ts` (~40 LOC)
- Module declaration for `@google/generative-ai`
- Interface definitions
- Type exports

#### 2. `client.ts` (~30 LOC)
- `getClient()` factory function
- API key resolution logic
- GoogleGenerativeAI instantiation

#### 3. `documentProcessing.ts` (~100 LOC)
- `analyzeDocument()`
- `critiqueBrief()`
- `reviewContract()`

#### 4. `legalResearch.ts` (~100 LOC)
- `conductResearch()`
- `shepardizeCitation()`
- `legalResearch()` (wrapper)
- `validateCitations()` (wrapper)

#### 5. `contentGeneration.ts` (~100 LOC)
- `streamDraft()`
- `generateDraft()`
- `generateReply()`
- `draftDocument()` (wrapper)
- `suggestReply()` (wrapper)

#### 6. `dataProcessing.ts` (~90 LOC)
- `parseDocket()`
- `extractCaseData()`
- `predictIntent()`

#### 7. `workflowAutomation.ts` (~100 LOC)
- `refineTimeEntry()`
- `generateStrategyFromPrompt()`
- `lintStrategy()`

#### 8. `index.ts` (~50 LOC)
- `GeminiService` object composition
- Re-export all methods
- Type exports

**Total Modules:** 8 (target: ~90 LOC each)

## Phase 4: Import Updates (45+ files)

### RealEstate Imports (11 files)
**Before:**
```typescript
import { RealEstateService, type RealEstateProperty } from '@/services/domain/RealEstateDomain';
```

**After:**
```typescript
import { RealEstateService, type RealEstateProperty } from '@/services/domain/RealEstateDomain';
// No changes needed due to barrel export
```

### Gemini Imports (34 files)
**Before:**
```typescript
import { GeminiService } from '@/services/features/research/geminiService';
```

**After:**
```typescript
import { GeminiService } from '@/services/features/research/geminiService';
// No changes needed due to barrel export
```

### Strategy
Use barrel exports (`index.ts`) to maintain backward compatibility. No consumer code changes required.

## Testing Strategy

### Pre-Refactor Validation
1. Build project: `npm run build`
2. Run type checks: `npm run type-check` (if available)
3. Run tests: `npm test` (if available)

### Post-Refactor Validation
1. Verify all imports resolve correctly
2. Build project without errors
3. Type-check all modules
4. Smoke test key features in dev mode

## Risk Mitigation

### Breaking Change Prevention
- Barrel exports maintain exact API surface
- All type exports preserved
- Service object structure unchanged
- Query keys structure unchanged

### Rollback Plan
Git-based rollback if issues discovered:
```bash
git checkout HEAD -- frontend/src/services/domain/RealEstateDomain.ts
git checkout HEAD -- frontend/src/services/domain/BillingDomain.ts
git checkout HEAD -- frontend/src/services/features/research/geminiService.ts
```

## Timeline

- **Phase 1 (RealEstate):** 10 modules, ~60 minutes
- **Phase 2 (Billing):** 10 modules, ~60 minutes
- **Phase 3 (Gemini):** 8 modules, ~50 minutes
- **Phase 4 (Validation):** Build + smoke test, ~20 minutes

**Total Estimated Time:** ~3 hours

## Success Criteria

- ✅ Each module ≤ 120 LOC (target: ~90)
- ✅ All exports maintain type safety
- ✅ Zero breaking changes to API surface
- ✅ Project builds without errors
- ✅ All imports resolve correctly
- ✅ Barrel exports provide backward compatibility
