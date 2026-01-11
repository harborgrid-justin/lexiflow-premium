# Architecture Notes - RE4BG7

## High-Level Design Decisions

### Decomposition Strategy
**Pattern:** Vertical Slice by Domain Responsibility + Horizontal Slice for Shared Concerns

This refactoring follows the **Single Responsibility Principle** and **Interface Segregation Principle** from SOLID:
- Each module handles one cohesive set of operations
- Type definitions separated from implementation
- Query keys isolated for React Query integration
- Barrel exports maintain backward compatibility

### Module Organization Pattern

```
[DomainName]/
├── types.ts              # Type definitions (interfaces, types, enums)
├── queryKeys.ts          # React Query cache keys
├── [operation1].ts       # Focused operation module (~90 LOC)
├── [operation2].ts       # Focused operation module (~90 LOC)
├── ...
└── index.ts              # Barrel export for backward compatibility
```

### Type System Strategy

#### Type Export Chain
1. **Source Types** → Defined in `types.ts`
2. **Operation Modules** → Import types from `./types`
3. **Barrel Export** → Re-export all types and functions
4. **Consumers** → Import from barrel (unchanged)

#### Type Safety Guarantees
- All function signatures preserved exactly
- Generic constraints maintained
- Return types explicitly declared
- No use of `any` type
- Discriminated unions for status types

### Integration Patterns

#### RealEstateDomain
- **Pattern:** Service Object with grouped methods
- **API Integration:** `apiClient` from infrastructure layer
- **Error Handling:** Try-catch with fallback empty arrays/nulls
- **Validation:** Parameter validation with descriptive errors

#### BillingDomain
- **Pattern:** Repository Class (OOP approach)
- **API Integration:** `BillingApiService` + `apiClient`
- **Error Handling:** Custom error types (`ComplianceError`, `OperationError`)
- **Compliance:** ABA Model Rules, IOLTA validation

#### GeminiService
- **Pattern:** Service Object with AI method grouping
- **API Integration:** Google Generative AI SDK
- **Error Handling:** Retry logic with exponential backoff
- **Streaming:** AsyncGenerator for real-time updates

### Design Pattern Analysis

#### RealEstateDomain
- **Factory Pattern:** Service object as method container
- **Command Pattern:** Each method represents a discrete command
- **Repository Pattern:** Abstraction over API client

#### BillingDomain
- **Repository Pattern:** `BillingRepository` extends base `Repository<T>`
- **Strategy Pattern:** Multiple validation strategies (ID, caseId, timekeeperId)
- **Template Method:** Base repository provides CRUD template

#### GeminiService
- **Singleton Pattern:** `getClient()` ensures single GoogleGenerativeAI instance
- **Adapter Pattern:** Wraps Google SDK with domain-specific methods
- **Facade Pattern:** Simplifies complex AI operations
- **Retry Pattern:** `withRetry()` wrapper for resilience

### Performance Considerations

#### Import Graph Optimization
**Before Refactor:**
- Consumers import entire 799-line file
- TypeScript must parse all types/functions
- Increased bundle size per route

**After Refactor:**
- Tree-shaking can eliminate unused modules
- Barrel export provides same convenience
- Smaller per-module parse time
- Better code splitting potential

#### Build Performance
- **Module Resolution:** Barrel exports add one indirection level
- **Type Checking:** Smaller modules = faster incremental compilation
- **IDE Performance:** Better IntelliSense with focused modules

#### Runtime Performance
- **No runtime impact:** All optimizations compile-time
- **Bundle size:** Potential reduction via tree-shaking
- **Lazy loading:** Easier to implement per-module

### Security Requirements

#### RealEstateDomain
- **Input Validation:** All IDs validated before API calls
- **SQL Injection:** Protected via apiClient parameter encoding
- **Authorization:** Assumes backend enforces permissions

#### BillingDomain
- **Compliance Validation:** IOLTA trust account type checking
- **Audit Trail:** All financial operations logged server-side
- **Data Integrity:** Validation before invoice creation

#### GeminiService
- **API Key Security:** Environment variable storage (not localStorage in prod)
- **Input Sanitization:** Content truncation prevents token overflow
- **XSS Prevention:** HTML output should be sanitized before rendering
- **Output Validation:** Zod schemas enforce expected structure

## Integration Map

### RealEstateDomain Consumers (11 files)
- `frontend/src/routes/real-estate/*.tsx` (11 route components)
- All import via barrel export (no changes needed)

### GeminiService Consumers (34 files)
- Knowledge features: Research, citation, brief analysis
- Litigation features: Strategy, pleadings, discovery
- Cases features: Time entry, docket import, drafting
- Operations: Documents, messenger
- Navigation: Command bars, headers
- All import via barrel export (no changes needed)

### BillingDomain Consumers (0 direct imports found)
- Likely accessed via hooks or indirect imports
- Barrel export ensures compatibility

## Refactoring Risk Assessment

### Low Risk ✅
- Type definitions extraction (compile-time validation)
- Query keys extraction (simple constant)
- Function grouping (pure reorganization)

### Medium Risk ⚠️
- Class method separation (BillingRepository)
- Service object decomposition (circular dependency potential)
- Import path changes (mitigated by barrel export)

### High Risk ❌
- None identified (backward compatibility maintained)

## Testing Strategy

### Type-Level Testing
- TypeScript compiler validates all type constraints
- Generic inference preserved across module boundaries
- No `any` escape hatches

### Build-Time Testing
```bash
npm run build  # Verify zero errors
npm run type-check  # If available
```

### Runtime Smoke Testing
1. RealEstate module: Load inventory page, verify data loads
2. Billing module: Load billing dashboard, verify stats render
3. Gemini service: Test document analysis, verify AI responses

## Future Architectural Improvements

### Potential Enhancements (Out of Scope)
1. **Dependency Injection:** Replace direct `apiClient` imports with DI
2. **Interface Segregation:** Define narrow interfaces per module
3. **Error Handling:** Standardize error types across all domains
4. **Logging:** Centralized logging service vs console.error
5. **Caching:** Module-level response caching for idempotent operations
6. **Testing:** Unit tests for each operation module

### Maintainability Benefits
- **Easier Code Review:** ~90 LOC files fit in single screen
- **Reduced Merge Conflicts:** Changes isolated to specific modules
- **Clear Ownership:** Each module has single responsibility
- **Faster Navigation:** Jump to specific operation file vs searching large file
- **Better Collaboration:** Multiple developers can work on different modules simultaneously

## Module Size Guidelines

**Target:** ~90 LOC per module
**Maximum:** 120 LOC
**Minimum:** 30 LOC

**Rationale:**
- Single screen view (no scrolling on standard monitor)
- Cognitive load reduction (can hold entire module in working memory)
- Git diff readability (changes fit in PR review UI)
- Testing scope (manageable test file size)
