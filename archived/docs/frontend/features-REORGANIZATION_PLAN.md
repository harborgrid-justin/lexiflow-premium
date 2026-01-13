# Features Directory Reorganization Plan

**Date:** December 28, 2025  
**Status:** 🔄 In Progress  
**Goal:** Consolidate feature modules, eliminate overlaps, and establish clear architectural boundaries

---

## 📊 Current State Analysis

### Directory Statistics
- **Total Files:** 667
- **Feature Domains:** 10

| Feature | Files | Purpose |
|---------|-------|---------|
| admin | 127 | Admin console, system configuration, user management |
| cases | 197 | Case management, workflows, intake, financials |
| dashboard | 9 | Main dashboard views |
| document-assembly | 4 | Document generation wizard (3-step process) |
| drafting | 8 | Document drafting tools and templates |
| knowledge | 84 | Research, rules, practice management, citations |
| litigation | 140 | Evidence, pleadings, discovery, war room, exhibits |
| operations | 85 | Messenger, documents, billing, compliance, correspondence |
| profile | 6 | User profile, security, preferences |
| visual | 7 | Nexus graph visualization |

### Architecture Discovery

**Current Pattern:**
```
/components  ← Shared/reusable UI components (Atomic Design)
/features    ← Feature-sliced design (vertical business domains)
```

**Key Finding:** Dual architecture with some overlap:
- **Components** use atomic design (atoms/molecules/organisms)
- **Features** contain complete vertical slices with their own components
- Features import from `/components` for UI primitives ✅
- Features cross-import from other features ⚠️ (creates coupling)

---

## 🎯 Identified Issues

### 1. **Cross-Feature Dependencies**
Features directly import from each other, creating tight coupling:
```typescript
// ❌ Bad: Direct cross-feature imports
import { BuilderCanvas } from '@/features/cases/components/workflow/builder/BuilderCanvas';
import { EvidenceCustodyLog } from '@features/litigation/evidence';
import { ResearchTool } from '@/features/knowledge/research/ResearchTool';
```

### 2. **Overlapping Domains**
Some functionality exists in both `/components` and `/features`:
- Cases module (both)
- Dashboard (both)
- Discovery/Evidence (litigation vs components)

### 3. **Inconsistent Barrel Exports**
Not all feature subdirectories have `index.ts` files:
- `/features/litigation/evidence/` - No index.ts
- `/features/cases/components/workflow/builder/` - No index.ts
- Many nested folders lack exports

### 4. **Service Layer Sprawl**
Services mixed between `/services` and `/services/features/`:
```typescript
// Two different service locations
import { GeminiService } from '@/services/features/research/geminiService';
import { DocumentService } from '@/services/features/documents/documentService';
```

### 5. **Deep Nesting**
Some features have 4-5 levels of nesting:
```
/features/cases/components/list/case-form-old/BasicInfoSection.tsx
/features/litigation/pleadings/designer/tools/ComplianceHUD.tsx
```

---

## 🏗️ Reorganization Strategy

### Phase 1: Establish Boundaries ✅
**Goal:** Define clear separation of concerns

#### Architecture Decision Records (ADR)

**ADR-001: Features vs Components**
```
/components/              → Presentational UI components only
  ├── atoms/             → Buttons, inputs, badges (no business logic)
  ├── molecules/         → Cards, forms, modals (composition of atoms)
  ├── organisms/         → Tables, headers, complex UI (composition)
  └── layouts/           → Page layouts, shells

/features/               → Feature-sliced business domains
  ├── [domain]/
  │   ├── components/    → Domain-specific components
  │   ├── hooks/         → Domain-specific hooks
  │   ├── services/      → Domain services (if not global)
  │   ├── types/         → Domain types
  │   ├── utils/         → Domain utilities
  │   └── index.ts       → Public API barrel export
  └── shared/            → Cross-feature utilities (NEW)
```

**ADR-002: Import Rules**
- ✅ Features MAY import from `/components` (UI primitives)
- ✅ Features MAY import from `/features/shared` (cross-cutting)
- ❌ Features MUST NOT directly import from other features
- ✅ Use facade pattern or context for feature communication

### Phase 2: Create Shared Layer 🔄
**Goal:** Extract common utilities used across features

#### New Structure: `/features/shared`
```
/features/shared/
  ├── components/        → Cross-feature components
  │   ├── DocumentPreview.tsx
  │   └── EntityCard.tsx
  ├── hooks/             → Shared hooks
  │   ├── useFeatureNav.ts
  │   └── useDocumentUpload.ts
  ├── services/          → Shared services facade
  │   ├── api/           → Consolidated API client
  │   └── events/        → Event bus for feature communication
  ├── types/             → Shared domain types
  │   ├── document.ts
  │   └── case.ts
  ├── utils/             → Shared utilities
  └── index.ts           → Public exports
```

#### Services to Extract:
- `GeminiService` → `/features/shared/services/ai/gemini.ts`
- `DocumentService` → `/features/shared/services/documents/service.ts`
- `BluebookFormatter` → `/features/shared/services/citations/bluebook.ts`

### Phase 3: Add Barrel Exports 🔄
**Goal:** Simplify imports with index.ts files

#### Target Directories (Priority Order):
1. `/features/litigation/evidence/` → Public evidence components
2. `/features/cases/components/workflow/` → Workflow public API
3. `/features/knowledge/research/` → Research tools
4. `/features/operations/messenger/` → Messaging public API
5. All subdirectories 2+ levels deep

#### Example Pattern:
```typescript
// /features/litigation/evidence/index.ts
export { EvidenceVault } from './EvidenceVault';
export { EvidenceIntake } from './EvidenceIntake';
export { EvidenceCustodyLog } from './EvidenceCustodyLog';
export type { EvidenceItem, CustodyEvent } from './types';

// Usage becomes cleaner
import { EvidenceVault, EvidenceIntake } from '@features/litigation/evidence';
```

### Phase 4: Flatten Deep Hierarchies 🔄
**Goal:** Reduce nesting to 2-3 levels maximum

#### Targets:
```
Before:
/features/cases/components/list/case-form-old/BasicInfoSection.tsx

After:
/features/cases/components/forms/CaseBasicInfoSection.tsx
```

### Phase 5: Consolidate Overlaps 🔄
**Goal:** Merge duplicated functionality

#### Consolidation Map:
1. **Dashboard**: Move feature logic from `/components/dashboard` → `/features/dashboard`
2. **Cases**: Keep feature in `/features/cases`, remove from `/components` if duplicate
3. **Document Assembly**: Merge `/features/document-assembly` + `/features/drafting` → `/features/documents/assembly`

### Phase 6: Update Imports 🔄
**Goal:** Fix all import paths to use new structure

- Update to use barrel exports
- Fix cross-feature imports to use `/features/shared`
- Ensure consistent path aliases (`@features/`, `@/features/`)

---

## 📋 Implementation Checklist

### Immediate Actions (Today)
- [x] Create reorganization plan
- [ ] Create `/features/shared` directory structure
- [ ] Extract `GeminiService` to shared
- [ ] Extract `DocumentService` to shared
- [ ] Add index.ts to top 10 feature directories

### Short-term (This Week)
- [ ] Add barrel exports to all subdirectories
- [ ] Flatten deeply nested paths (4+ levels)
- [ ] Move services from `/services/features/` to `/features/shared/services/`
- [ ] Create feature communication event bus
- [ ] Update cross-feature imports to use shared layer

### Medium-term (Next Sprint)
- [ ] Consolidate dashboard overlaps
- [ ] Merge document-assembly + drafting features
- [ ] Create feature dependency graph visualization
- [ ] Update all import paths project-wide
- [ ] Add ESLint rules to prevent cross-feature imports

### Documentation
- [ ] Create `/features/README.md` with architecture guide
- [ ] Document each feature's public API
- [ ] Add ADRs (Architecture Decision Records)
- [ ] Create migration guide for developers

---

## 🔧 Migration Examples

### Before: Cross-Feature Import
```typescript
// ❌ Tight coupling
import { BuilderCanvas } from '@/features/cases/components/workflow/builder/BuilderCanvas';
import { ResearchTool } from '@/features/knowledge/research/ResearchTool';
```

### After: Using Shared Layer
```typescript
// ✅ Decoupled via shared layer
import { WorkflowBuilder } from '@features/shared/components/WorkflowBuilder';
import { useResearch } from '@features/shared/hooks/useResearch';

// Or via facade pattern
import { FeatureRegistry } from '@features/shared/registry';
const ResearchTool = FeatureRegistry.get('knowledge.research');
```

### Before: Deep Nesting
```typescript
import { ComplianceHUD } from '@/features/litigation/pleadings/designer/tools/ComplianceHUD';
```

### After: Flattened with Barrel Export
```typescript
// From index.ts
export { ComplianceHUD } from './tools/ComplianceHUD';

// Usage
import { ComplianceHUD } from '@features/litigation/pleadings';
```

---

## 📐 Success Metrics

- ✅ Zero direct cross-feature imports (except via `/features/shared`)
- ✅ All features have public API (`index.ts`)
- ✅ Maximum 3 levels of directory nesting
- ✅ Services consolidated in one location
- ✅ Import paths use aliases consistently
- ✅ ESLint rules enforce boundaries

---

## 🚨 Risk Mitigation

**Risk:** Breaking existing imports during refactor  
**Mitigation:** 
- Implement in phases
- Use TypeScript compiler to catch errors
- Keep old paths temporarily with deprecation warnings

**Risk:** Features becoming too large  
**Mitigation:**
- Split features when they exceed 50 files
- Use subfeatures (e.g., `/litigation/discovery/`, `/litigation/evidence/`)

**Risk:** Over-engineering the shared layer  
**Mitigation:**
- Only move utilities after 3+ features use them
- Prefer duplication over premature abstraction

---

## 📖 Next Steps

1. **Review & Approve** this plan with team
2. **Create `/features/shared`** directory structure
3. **Start with highest-impact**: Extract GeminiService & DocumentService
4. **Iterative rollout**: One feature domain at a time
5. **Continuous validation**: Run build after each phase

**Estimated Timeline:** 2-3 sprints for complete reorganization
