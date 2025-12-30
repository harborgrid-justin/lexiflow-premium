# Circular Dependencies Analysis Report

**Generated:** December 30, 2025
**Tool:** dpdm (Dependency Path Dependency Manager)

## Summary

### Frontend (React/TypeScript)

- **Total Files Analyzed:** 2,424
- **Circular Dependency Chains Found:** 717

### Backend (NestJS/TypeScript)

- **Total Files Analyzed:** 1,294
- **Circular Dependency Chains Found:** 17

---

## Frontend Critical Issues

### 1. **ThemeContext → Config → Components Cycle** (Multiple chains)

The most pervasive issue involves ThemeContext importing from config, which imports layout components, which eventually import back to services/hooks that need theme context.

**Example Chain:**

```
src/providers/ThemeContext.tsx
  → src/config/index.ts
  → src/config/tabs.config.ts
  → src/components/layouts/index.ts
  → src/components/ui/layouts/AppShellLayout/AppShellLayout.tsx
```

**Impact:** This creates hundreds of derivative circular dependencies through the component tree.

**Recommendation:**

- Extract theme types and constants to a separate `theme/constants.ts` file
- Use dependency injection or context providers more carefully
- Consider lazy loading theme-dependent components

### 2. **Services → DataService → API → Services Cycle**

```
src/services/index.ts
  → src/services/data/dataService.ts
  → src/services/data/routing/DataSourceRouter.ts
  → src/api/index.ts
  → src/api/domains/drafting.api.ts
```

**Impact:** Core data access layer has circular dependencies.

**Recommendation:**

- Break the cycle by using dependency injection
- Create interface abstractions for API clients
- Move type definitions to separate files

### 3. **Integration Orchestrator Handler Cycles** (Multiple)

All integration handlers import back into the services that trigger them:

- LeadStageChangedHandler
- TaskCompletedHandler
- DocumentUploadedHandler
- InvoiceStatusChangedHandler
- CitationSavedHandler
- WallErectedHandler
- StaffHiredHandler
- ServiceCompletedHandler

**Recommendation:**

- Use event bus pattern with proper decoupling
- Handlers should not directly depend on domain services
- Consider using a mediator pattern

### 4. **Component Barrel Export Issues**

Many circular dependencies stem from barrel exports (index.ts files) that re-export components which then import from the same barrel:

```
src/components/atoms/index.ts
  → src/components/ui/atoms/index.ts
  → src/components/ui/atoms/Button/index.ts
  → src/components/ui/atoms/Button/Button.tsx
```

**Recommendation:**

- Avoid circular barrel exports
- Use direct imports where possible
- Consider flattening the component structure

---

## Backend Critical Issues

### 1. **User Entity Bidirectional Relationships**

```
src/users/entities/user.entity.ts
  → src/users/entities/user-profile.entity.ts
  → src/auth/entities/session.entity.ts
  → src/billing/time-entries/entities/time-entry.entity.ts
  → src/case-teams/entities/case-team.entity.ts
```

**Recommendation:**

- Use TypeORM's lazy loading with `() => EntityClass` syntax
- Avoid circular imports by using forward references
- Consider splitting entities into separate modules

### 2. **Case → Client → Invoice Cycle**

```
src/cases/entities/case.entity.ts
  → src/clients/entities/client.entity.ts
  → src/billing/invoices/entities/invoice.entity.ts
```

**Recommendation:**

- Use TypeORM forward references: `@ManyToOne(() => Client)`
- Consider using DTOs to break circular type dependencies
- Refactor to use interfaces for cross-module types

### 3. **Document Module → Processing Jobs Module**

```
src/documents/documents.module.ts
  → src/processing-jobs/processing-jobs.module.ts
```

**Recommendation:**

- Use dynamic module imports with `forwardRef()`
- Extract shared functionality to a common module
- Consider using event-driven architecture instead of direct module dependencies

### 4. **Evidence Chain of Custody Cycle**

```
src/evidence/entities/evidence-item.entity.ts
  → src/evidence/entities/chain-of-custody-event.entity.ts
```

**Recommendation:**

- Use TypeORM lazy loading
- Properly configure bidirectional relationships with forward references

---

## Priority Recommendations

### High Priority (Frontend)

1. **Fix ThemeContext cycles** - This is causing the majority (500+) of circular dependencies
2. **Refactor DataService architecture** - Core data layer should not have cycles
3. **Fix integration handler patterns** - Use proper event bus decoupling

### High Priority (Backend)

1. **Fix entity relationship cycles** - Use TypeORM forward references consistently
2. **Fix module-level circular dependencies** - Use `forwardRef()` or extract common modules

### Medium Priority

1. Audit and fix barrel export patterns in frontend
2. Implement proper dependency injection patterns
3. Create architectural guidelines to prevent future cycles

### Low Priority

1. Create automated checks in CI/CD to catch new circular dependencies
2. Document architectural patterns in team guidelines
3. Add ESLint rules to detect import cycles

---

## Detailed Reports

Full detailed reports have been saved to:

- Frontend: `/tmp/frontend-circular-deps.txt` (13,872 lines)
- Backend: `/tmp/backend-circular-deps.txt` (6,446 lines)

## How to View Full Reports

```bash
# View frontend circular dependencies
cat /tmp/frontend-circular-deps.txt

# View backend circular dependencies
cat /tmp/backend-circular-deps.txt

# Re-run analysis
cd frontend && dpdm --circular --warning=false 'src/**/*.{ts,tsx}'
cd backend && dpdm --circular --warning=false 'src/**/*.ts'
```

## Next Steps

1. **Immediate:** Address the ThemeContext cycle as it's causing cascade effects
2. **Short-term:** Fix the core DataService and integration handler patterns
3. **Medium-term:** Refactor entity relationships using proper TypeORM patterns
4. **Long-term:** Establish architectural guidelines and automated checks

---

**Note:** Many of these circular dependencies may not cause runtime issues but can lead to:

- Build order problems
- Tree-shaking issues
- Increased bundle sizes
- Maintenance difficulties
- Harder to test code
