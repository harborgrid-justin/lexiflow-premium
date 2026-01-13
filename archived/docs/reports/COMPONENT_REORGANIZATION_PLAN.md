# Component Directory Reorganization Plan

## Current Issues
1. **Inconsistent Naming**: `case-list`, `case-detail`, `case-management` should be unified
2. **Flat Structure**: 36 top-level directories with unclear relationships
3. **Navigation Mismatch**: Directory structure doesn't match our 6-category navigation hierarchy
4. **Duplicate Concepts**: Multiple "admin/data" subdirectories, overlapping concerns

## Proposed Structure (Aligned with Navigation Categories)

### Category 1: Main (Dashboard & Core)
```
components/
├── dashboard/          [KEEP - 8 files]
├── profile/            [KEEP - 5 files]
├── notifications/      [KEEP - 1 file]
```

### Category 2: Case Work → matters/
```
components/
└── matters/
    ├── list/           [FROM case-list/ - 27 files]
    │   ├── jurisdiction/ [FROM case-list/jurisdiction/]
    │   ├── case-form/    [FROM case-list/case-form/]
    │   └── matter-form/  [FROM case-list/matter-form/]
    ├── detail/         [FROM case-detail/ - 19 files + subdirs]
    │   ├── overview/
    │   ├── projects/
    │   ├── collaboration/
    │   ├── motions/
    │   ├── arguments/
    │   ├── risk/
    │   ├── workflow/
    │   ├── planning/
    │   ├── documents/
    │   ├── layout/
    │   ├── opposition/
    │   ├── timeline/
    │   └── strategy/
    ├── create/         [FROM case-management/ - 2 files]
    │   ├── CreateCasePage.tsx
    │   └── FederalLitigationCaseForm.tsx
    ├── docket/         [FROM docket/ - 14 files]
    ├── entities/       [FROM entities/ - 11 files + subdirs]
    │   ├── ubo/
    │   ├── counsel/
    │   ├── talent/
    │   └── layout/
    ├── workflow/       [FROM workflow/ - 28 files + subdirs]
    │   ├── builder/
    │   └── modules/
    └── calendar/       [FROM calendar/ - 8 files]
```

### Category 3: Litigation Tools → litigation/
```
components/
└── litigation/
    ├── strategy/       [FROM litigation/ - 12 files]
    ├── discovery/      [FROM discovery/ - 25 files + subdirs]
    │   ├── dashboard/
    │   ├── interviews/
    │   ├── viewer/
    │   └── layout/
    ├── evidence/       [FROM evidence/ - 14 files + subdirs]
    │   ├── fre/
    │   ├── overview/
    │   └── intake/
    ├── exhibits/       [FROM exhibits/ - 4 files]
    ├── pleadings/      [FROM pleading/ - 7 files + subdirs]
    │   ├── modules/
    │   ├── editor/
    │   ├── designer/
    │   ├── sidebar/
    │   ├── tools/
    │   └── visual/
    └── war-room/       [FROM war-room/ - 9 files + subdirs]
        ├── opposition/
        ├── advisory/
        └── cards/
```

### Category 4: Operations → operations/
```
components/
└── operations/
    ├── documents/      [FROM documents/ - 13 files + subdirs]
    │   ├── preview/
    │   ├── pdf/
    │   ├── table/
    │   └── viewer/
    ├── billing/        [FROM billing/ - 8 files + subdirs]
    │   ├── trust/
    │   ├── rate-tables/
    │   └── fee-agreements/
    ├── compliance/     [FROM compliance/ - 7 files]
    ├── correspondence/ [FROM correspondence/ - 8 files]
    ├── messenger/      [FROM messenger/ - 11 files]
    └── crm/            [FROM crm/ - 9 files + subdirs]
        └── client-portal/
```

### Category 5: Knowledge → knowledge/
```
components/
└── knowledge/
    ├── base/           [FROM knowledge/ - 6 files]
    ├── research/       [FROM research/ - 11 files + subdirs]
    │   └── bluebook/
    ├── citation/       [FROM citation/ - 5 files]
    ├── clauses/        [FROM clauses/ - 4 files]
    ├── rules/          [FROM rules/ - 6 files + subdirs]
    │   └── rule-viewer/
    ├── jurisdiction/   [FROM jurisdiction/ - 8 files]
    └── practice/       [FROM practice/ - 9 files + subdirs]
        ├── hr/
        └── finance/
```

### Category 6: Admin → admin/
```
components/
└── admin/
    ├── console/        [FROM admin/ - 7 files (top-level only)]
    ├── analytics/      [FROM analytics/ - 8 files]
    ├── security/       [FROM admin/security/ - 5 files]
    ├── hierarchy/      [FROM admin/hierarchy/ - 3 files]
    ├── audit/          [FROM admin/audit/ - 1 file]
    ├── api-keys/       [FROM admin/api-keys/ - 1 file]
    ├── integrations/   [FROM admin/integrations/ - 1 file]
    ├── ledger/         [FROM admin/ledger/ - 1 file]
    ├── users/          [FROM admin/users/ - 1 file]
    ├── webhooks/       [FROM admin/webhooks/ - 1 file]
    ├── platform/       [FROM admin/platform/ - 4 files]
    └── data/           [FROM admin/data/ - 28 files + ALL subdirs]
        ├── sources/
        ├── schema/
        ├── quality/
        ├── governance/
        ├── catalog/
        ├── backup/
        ├── security/
        ├── pipeline/
        ├── lineage/
        ├── query/
        └── replication/
```

### Shared/Core (No Category) → Keep Top-Level
```
components/
├── common/             [KEEP - 79 files + subdirs]
│   ├── primitives/
│   ├── layout/
│   └── search/
├── layout/             [KEEP - 12 files]
├── sidebar/            [KEEP - 3 files]
├── visual/             [KEEP - 3 files]
└── document-assembly/  [KEEP - 3 files, utility component]
```

## Migration Strategy

### Phase 1: Create New Structure (Zero Downtime)
1. Create new directories: `matters/`, `litigation/`, `operations/`, `knowledge/`
2. Copy (not move) files to new locations
3. Update imports in copied files to use new paths

### Phase 2: Update Import References
1. Search for all imports from old paths
2. Update to new paths using multi_replace_string_in_file
3. Test each category independently

### Phase 3: Clean Up
1. Verify no references to old paths remain
2. Delete old directories
3. Update config/modules.tsx with new paths

## Import Pattern Examples

### Before
```typescript
import { CaseCard } from '../case-list/CaseCard';
import { CreateCasePage } from '../case-management/CreateCasePage';
import { CaseDetailOverview } from '../case-detail/overview/CaseDetailOverview';
```

### After
```typescript
import { CaseCard } from '../matters/list/CaseCard';
import { CreateCasePage } from '../matters/create/CreateCasePage';
import { CaseDetailOverview } from '../matters/detail/overview/CaseDetailOverview';
```

## Risk Mitigation
- ✅ Copy-first approach (no data loss)
- ✅ Incremental migration by category
- ✅ Test after each category
- ✅ Keep common/ and layout/ untouched (most stable)
- ✅ Update config/modules.tsx last (single source of truth)

## Estimated Impact
- **Files to move**: ~400+ .tsx files
- **Import statements to update**: 200-300 across entire codebase
- **Critical files to update**: config/modules.tsx (single point of registration)
- **Zero feature loss**: All components maintained, only paths change

## Execution Order
1. ✅ Document current structure (this file)
2. Create matters/ directory structure
3. Create litigation/ directory structure
4. Create operations/ directory structure
5. Create knowledge/ directory structure
6. Update admin/ consolidation
7. Update all imports (automated script)
8. Update config/modules.tsx paths
9. Test application load
10. Clean up old directories

---
*Generated: 2025-01-XX*
*Status: PENDING APPROVAL*
