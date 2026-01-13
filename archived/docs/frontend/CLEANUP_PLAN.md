# Detailed File Removal Plan

Generated: 2025-12-30

## Executive Summary

- **Total Orphaned Files**: 932
- **Estimated Space Savings**: ~15-25 MB source code
- **Build Time Improvement**: ~20-30% faster
- **IDE Performance**: Significant improvement in indexing

---

## Phase 1: Low-Risk Deletions (RECOMMENDED START)

### 1.1 Storybook Stories (~300 files, ~8 MB)

**Risk Level**: ✅ LOW - These are documentation files

Files to remove:

- All `.stories.tsx` files in `src/components/ui/`
- All `.stories.tsx` files in `src/components/features/`
- All `.stories.tsx` files in `src/components/organisms/`
- All `.styles.ts` companion files for stories

**Reasoning**: Storybook stories are for documentation. If Storybook isn't running (no .storybook config active), these are dead weight.

**Action**:

```bash
npm run cleanup:orphaned -- --dry-run --category=stories
# Review output, then:
npm run cleanup:orphaned -- --execute --category=stories
```

### 1.2 Legacy Components (~100 files, ~3 MB)

**Risk Level**: ✅ LOW - Explicitly marked as legacy

Remove:

- `src/components/organisms/_legacy/` (entire directory)
- `src/components/enterprise/` (replaced by features/)
- `src/features/admin/components/SecurityCompliance.old.tsx`

**Reasoning**: Files marked as `_legacy` or `.old` are explicitly deprecated.

**Action**:

```bash
npm run cleanup:orphaned -- --dry-run --category=legacy
npm run cleanup:orphaned -- --execute --category=legacy
```

---

## Phase 2: Medium-Risk Deletions (REVIEW FIRST)

### 2.1 Duplicate Components (~80 files, ~2.5 MB)

**Risk Level**: ⚠️ MEDIUM - Need to verify imports point to correct version

Keep locations:

- `src/components/features/core/components/` ✅
- `src/features/` ✅

Remove locations:

- `src/components/organisms/` (duplicates) ❌
- `src/components/features/` (barrel exports) ❌

Specific duplicates:

```
KEEP: src/components/features/core/components/BackendHealthMonitor/
DELETE: src/components/organisms/BackendHealthMonitor/

KEEP: src/components/features/core/components/ErrorBoundary/
DELETE: src/components/organisms/ErrorBoundary/

KEEP: src/components/features/core/components/Table/
DELETE: src/components/organisms/Table/

... (15 more similar cases)
```

**Pre-deletion Check**:

```bash
# Find all imports of duplicate components
grep -r "from.*organisms/BackendHealthMonitor" src/
grep -r "from.*organisms/ErrorBoundary" src/
# etc.
```

**Action**:

```bash
npm run cleanup:orphaned -- --dry-run --category=duplicates
# ⚠️ MANUAL REVIEW: Check the dry-run output carefully
# Then update imports if needed before executing
```

### 2.2 Unused Barrel Exports (~40 files, ~0.5 MB)

**Risk Level**: ⚠️ MEDIUM - May break imports if still referenced

Files:

- `src/components/atoms/*/index.ts` (10 files)
- `src/components/molecules/*/index.ts` (4 files)
- `src/components/layouts/*/index.ts` (2 files)
- `src/components/features/*/index.ts` (15 files)

**Pre-deletion Check**:

```bash
# Check if any imports use the barrel exports
grep -r "from '@/components/atoms/Badge'" src/
grep -r "from '@/components/molecules/Modal'" src/
```

**Safe Removal Pattern**:

1. Change imports from `@/components/atoms/Badge` to `@/components/ui/atoms/Badge/Badge`
2. Delete the barrel file
3. Re-run build to verify

---

## Phase 3: High-Risk Deletions (BACKUP FIRST)

### 3.1 Empty Service Files (~10 files, ~0.1 MB)

**Risk Level**: 🔴 HIGH - May be imported by build config

Files:

```
src/services/backend-services.ts
src/services/core-services.ts
src/services/features-services.ts
src/services/repositories.ts
src/services/utils-services.ts
src/services/core.exports.ts
```

**Check Before Delete**:

```bash
grep -r "backend-services" src/
grep -r "core-services" src/
# etc.
```

### 3.2 Unused Hook Files (~5 files, ~0.05 MB)

**Risk Level**: 🔴 HIGH - May be dynamically imported

Files:

```
src/hooks/backend.ts
src/hooks/core.ts
src/hooks/domain.ts
src/hooks/performance.ts
src/hooks/ui.ts
```

---

## Phase 4: Nuclear Option (Complete Audit Required)

### 4.1 All 277 Modules with Unused Exports

**Risk Level**: 🔴 CRITICAL - Requires comprehensive codebase audit

This requires:

1. Run `ts-unused-exports` with full report
2. For each module, verify exports aren't used by:
   - Dynamic imports
   - Type-only imports
   - External tools (Storybook, tests)
3. Manually remove unused exports (not entire files)

**Not recommended for batch deletion** - do incrementally during refactoring.

---

## Execution Plan

### Week 1: Safe Cleanup

```bash
# Day 1: Backup
git checkout -b cleanup/orphaned-files
git push -u origin cleanup/orphaned-files

# Day 2: Storybook files
npm run cleanup:orphaned -- --execute --category=stories
git add -A && git commit -m "chore: remove orphaned Storybook files"

# Day 3: Legacy components
npm run cleanup:orphaned -- --execute --category=legacy
git add -A && git commit -m "chore: remove legacy/deprecated components"

# Day 4: Build verification
npm run build
npm run test
```

### Week 2: Careful Cleanup

```bash
# Day 1: Analyze duplicates
npm run cleanup:orphaned -- --dry-run --category=duplicates > duplicates.txt
# Manual review of duplicates.txt

# Day 2-3: Update imports
# Use find-and-replace to fix imports

# Day 4: Delete duplicates
npm run cleanup:orphaned -- --execute --category=duplicates
git add -A && git commit -m "chore: remove duplicate components"

# Day 5: Verification
npm run build && npm run test
```

### Week 3: Advanced Cleanup

```bash
# Only if confident after Week 1-2 success

# Barrel exports
npm run cleanup:orphaned -- --execute --category=barrels

# Empty services (one at a time)
# Manual verification for each file
```

---

## Rollback Plan

If issues arise:

```bash
# Rollback entire branch
git checkout main

# Rollback specific commit
git revert <commit-hash>

# Rollback specific file
git checkout main -- path/to/file.tsx
```

---

## Expected Outcomes

### After Phase 1:

- ✅ ~400 files removed
- ✅ ~10 MB saved
- ✅ 10-15% faster builds
- ✅ No functional changes

### After Phase 2:

- ✅ ~500 files removed
- ✅ ~13 MB saved
- ✅ 20-25% faster builds
- ⚠️ Possible import fixes needed

### After Phase 3:

- ✅ ~520 files removed
- ✅ ~14 MB saved
- ✅ 25-30% faster builds
- 🔴 High chance of needing fixes

---

## Monitoring

After each phase, check:

1. **Build succeeds**: `npm run build`
2. **Tests pass**: `npm run test` (if tests exist)
3. **No console errors**: Run dev server and check browser console
4. **Bundle size**: Compare before/after dist/ size

---

## Dependencies to Remove

After file cleanup, also uninstall:

```bash
npm uninstall @ai-sdk/openai @google/genai @lexiflow/shared-types
npm uninstall @nestjs/terminus axios-retry cache-manager cache-manager-redis-store
npm uninstall fast-check jotai lucide nest-winston opossum react-window winston

# DevDependencies
npm uninstall @chromatic-com/storybook @jest/globals @testing-library/jest-dom
npm uninstall @vitest/coverage-v8 jest-environment-jsdom joi playwright ts-node
```

**Expected Savings**: ~50-100 MB in node_modules

---

## Notes

- Always work in a feature branch
- Commit after each category
- Test thoroughly before merging
- Keep PR open for 24-48 hours for team review
- Run full E2E tests before final merge
