# Features Directory

**Enterprise Feature-Sliced Architecture for LexiFlow**

This directory contains vertical business feature modules organized by domain. Each feature is a self-contained slice with its own components, hooks, services, and types.

---

## 📐 Architecture Principles

### Features vs Components

```
/components/             → Presentational UI components (Atomic Design)
  ├── atoms/            → Pure UI primitives (Button, Input, Badge)
  ├── molecules/        → Composite UI (Card, Modal, Dropdown)
  ├── organisms/        → Complex UI (Table, Form, Toolbar)
  └── layouts/          → Page layouts and shells

/features/              → Feature-sliced business domains
  ├── [domain]/         → Self-contained feature module
  │   ├── components/   → Domain-specific components
  │   ├── hooks/        → Domain-specific hooks
  │   ├── services/     → Domain services (if not global)
  │   ├── types/        → Domain types
  │   ├── utils/        → Domain utilities
  │   └── index.ts      → Public API barrel export
  └── shared/           → Cross-feature utilities
```

**Key Distinction:**
- **Components** = UI primitives with no business logic
- **Features** = Business logic + domain-specific UI

---

## 🗂️ Feature Domains

### Primary Features (197+ files each)

#### `cases/` - Case Management System
Complete case lifecycle management from intake to closure.

**Modules:**
- `intake/` - New case intake forms
- `list/` - Case list views and filtering
- `detail/` - Case detail pages
- `workflow/` - Workflow designer and automation
- `docket/` - Docket management
- `entities/` - Party and counsel management
- `financials/` - Case billing and budgets
- `calendar/` - Case deadlines and events
- `analytics/` - Case performance metrics

**Public API:**
```typescript
import { 
  CaseList, 
  CaseDetail, 
  NewCaseIntakeForm, 
  WorkflowDesigner 
} from '@features/cases';
```

#### `litigation/` - Litigation Management (140 files)
Trial preparation, evidence, discovery, and pleadings.

**Modules:**
- `evidence/` - Evidence vault and chain of custody
- `discovery/` - Discovery requests and responses
- `pleadings/` - Pleading designer and management
- `exhibits/` - Exhibit preparation
- `war-room/` - Trial war room and strategy
- `strategy/` - Litigation planning

**Public API:**
```typescript
import { 
  EvidenceVault, 
  PleadingDesigner, 
  WarRoom 
} from '@features/litigation';
```

### Secondary Features (50-100 files)

#### `operations/` - Firm Operations (85 files)
Internal operations, documents, billing, and communications.

**Modules:**
- `messenger/` - Secure internal messaging
- `documents/` - Document management and viewer
- `billing/` - Billing and invoicing
- `compliance/` - Compliance tracking
- `correspondence/` - External correspondence

#### `knowledge/` - Knowledge Management (84 files)
Research, citations, rules, and practice resources.

**Modules:**
- `research/` - Legal research tools
- `citation/` - Citation management
- `rules/` - Court rules and procedures
- `practice/` - Practice management resources
- `jurisdiction/` - Jurisdiction-specific tools

#### `admin/` - Administration Console (127 files)
System administration and configuration.

**Modules:**
- System settings
- User management
- Data quality
- Schema management

### Utility Features

#### `dashboard/` (9 files)
Main dashboard and analytics overview.

#### `profile/` (6 files)
User profile, security, and preferences.

#### `visual/` (7 files)
Nexus graph visualization for relationships.

#### `document-assembly/` (4 files)
3-step document generation wizard.

#### `drafting/` (8 files)
Template-based document drafting.

---

## 🔗 Dependencies & Imports

### Import Rules

✅ **Allowed:**
```typescript
// Import UI components
import { Button, Card } from '@/components/atoms';

// Import from features via public API
import { EvidenceVault } from '@features/litigation/evidence';

// Import from shared layer
import { GeminiService } from '@features/shared/services';
```

❌ **Not Allowed:**
```typescript
// Direct cross-feature imports (creates coupling)
import { BuilderCanvas } from '@features/cases/components/workflow/builder/BuilderCanvas';

// Importing internal components from other features
import { InternalHelper } from '@features/knowledge/internal/helper';
```

### Dependency Graph

```
features/
├── shared/          ← Can be imported by any feature
├── cases/           → Imports: shared, components
├── litigation/      → Imports: shared, components
├── knowledge/       → Imports: shared, components
├── operations/      → Imports: shared, components
├── admin/           → Imports: shared, components
├── dashboard/       → Imports: shared, components, cases
└── profile/         → Imports: shared, components
```

---

## 📦 Feature Structure Template

Each feature should follow this structure:

```
[feature-name]/
├── components/              # Feature-specific UI components
│   ├── ComponentA.tsx
│   ├── ComponentB.tsx
│   └── index.ts            # Barrel export
├── hooks/                   # Feature-specific hooks
│   ├── useFeatureLogic.ts
│   └── index.ts
├── services/                # Feature-specific services
│   ├── api.ts
│   └── index.ts
├── types/                   # Feature-specific types
│   ├── models.ts
│   ├── enums.ts
│   └── index.ts
├── utils/                   # Feature-specific utilities
│   ├── helpers.ts
│   └── index.ts
├── constants.ts            # Feature constants
├── index.ts                # Public API (REQUIRED)
└── README.md               # Feature documentation
```

---

## 🚀 Creating a New Feature

### 1. Create Directory Structure
```bash
mkdir -p features/my-feature/{components,hooks,services,types,utils}
```

### 2. Add index.ts (Public API)
```typescript
// features/my-feature/index.ts

/**
 * My Feature Module
 * Brief description of what this feature does
 */

// Export public components
export { MyComponent } from './components/MyComponent';

// Export public hooks
export { useMyFeature } from './hooks/useMyFeature';

// Export public types
export type { MyFeatureData, MyFeatureConfig } from './types';
```

### 3. Implement Components
Keep implementation details private. Only export what other features need to use.

### 4. Update Documentation
Add your feature to this README and create a feature-specific README.

---

## 🔧 Working with Shared Layer

The `shared/` directory contains cross-cutting concerns.

### When to Extract to Shared

Extract code when:
- ✅ 3+ features use the same utility
- ✅ Logic is feature-agnostic
- ✅ Provides cross-feature communication

Keep code in feature when:
- ❌ Only 1-2 features use it
- ❌ Tightly coupled to specific domain
- ❌ It's a pure UI component (use `/components`)

### Shared Services

Currently available:
```typescript
// AI Services
import { GeminiService } from '@features/shared/services/ai';

// Document Services
import { DocumentService } from '@features/shared/services/documents';

// Citation Services
import { BluebookFormatter } from '@features/shared/services/citations';
```

---

## 📝 Best Practices

### 1. Single Responsibility
Each feature should have one primary responsibility. If it grows too large (>100 files), consider splitting into sub-features.

### 2. Explicit Dependencies
Always use imports from public APIs (index.ts). Never reach into internal implementation.

### 3. Loose Coupling
Features should communicate through:
- Shared services
- Event bus (via IntegrationOrchestrator)
- Props/callbacks (parent coordination)

### 4. High Cohesion
Related functionality should live together. If you find yourself importing many things from one feature, consider if that logic should be shared.

### 5. Barrel Exports
Always provide an index.ts that exports the public API. This allows us to:
- Refactor internals without breaking imports
- Control what's public vs private
- Enable better tree-shaking

---

## 🧪 Testing Features

Each feature should have its own test coverage:

```
features/my-feature/
├── components/
│   ├── MyComponent.tsx
│   └── MyComponent.test.tsx
├── hooks/
│   ├── useMyFeature.ts
│   └── useMyFeature.test.ts
└── services/
    ├── api.ts
    └── api.test.ts
```

---

## 📚 Related Documentation

- [Reorganization Plan](./REORGANIZATION_PLAN.md) - Detailed migration strategy
- [Shared Layer](./shared/README.md) - Cross-feature utilities guide
- [Components README](../components/README.md) - UI component system
- [Copilot Instructions](../../.github/copilot-instructions.md) - Project conventions

---

## 🎯 Roadmap

### Completed ✅
- Feature-sliced architecture established
- Shared layer created
- Barrel exports for top features
- Documentation complete

### In Progress 🔄
- Extract services to shared layer
- Update cross-feature imports
- Flatten deep hierarchies

### Planned 📋
- Add ESLint rules for import boundaries
- Create feature dependency graph
- Set up feature flags system
- Add feature-level E2E tests

---

## 📞 Questions?

For architecture questions or concerns, refer to:
- [Architecture Decision Records](./REORGANIZATION_PLAN.md#adr-001-features-vs-components)
- Project Copilot instructions
- Team architecture lead

**Last Updated:** December 28, 2025
