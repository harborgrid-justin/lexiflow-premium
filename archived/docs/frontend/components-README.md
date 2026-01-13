# Enterprise Component Architecture

## Overview
This directory follows **Atomic Design principles** with domain-driven organization for enterprise-grade legal OS application.

## Directory Structure

```
components/
├── ui/                          # ⚛️ Atomic Design System (Shared UI)
│   ├── atoms/                  # Basic UI primitives (Button, Input, Badge)
│   ├── molecules/              # Simple composed components (Card, Modal)
│   ├── organisms/              # Complex UI components (Table, Sidebar)
│   └── layouts/                # Page structure components
│
├── atoms/                       # 🔗 Convenience re-exports from ui/atoms
├── molecules/                   # 🔗 Convenience re-exports from ui/molecules
├── layouts/                     # 🔗 Convenience re-exports from ui/layouts
│
├── organisms/                   # 🏗️ Application Organisms
│   ├── Sidebar/                # Main navigation
│   ├── Table/                  # Data tables
│   ├── BackendHealthMonitor/  # Infrastructure components
│   ├── cases/                  # Case-specific organisms (legacy)
│   ├── discovery/              # Discovery-specific organisms (legacy)
│   └── ...                     # Other complex components
│
├── features/                    # 🎯 Domain-Specific Feature Components
│   ├── cases/                  # Case management organisms & pages
│   ├── discovery/              # Discovery & evidence organisms & pages
│   ├── documents/              # Document management organisms & pages
│   ├── litigation/             # Litigation organisms & pages
│   ├── operations/             # Operations organisms & pages
│   ├── knowledge/              # Knowledge organisms & pages
│   ├── collaboration/          # Collaboration organisms & pages
│   ├── admin/                  # Admin organisms & pages
│   ├── billing/                # Billing organisms & pages
│   ├── calendar/               # Calendar organisms & pages
│   ├── dashboard/              # Dashboard organisms & pages
│   ├── navigation/             # Navigation organisms & pages
│   ├── search/                 # Search organisms & pages
│   └── user/                   # User profile organisms & pages
│   └── index.ts
│
├── theme/                       # 🎨 Design System
│   ├── tokens.ts              # Design tokens
│   └── index.ts
│
└── stories/                     # 📚 Storybook Stories
    └── ...
```

## Architecture Notes

### Dual Feature Structure
- **`/components/features/`** → Domain-specific UI components (organisms + pages)
- **`/src/features/`** → Complete feature modules (components + hooks + services + types)

### Re-export Layers
- `/components/atoms/` → Re-exports from `/components/ui/atoms/`
- `/components/molecules/` → Re-exports from `/components/ui/molecules/`
- `/components/layouts/` → Re-exports from `/components/ui/layouts/`

This allows both import patterns:
```typescript
import { Button } from '@/components/atoms';  // ✅ Works
import { Button } from '@/components/ui/atoms';  // ✅ Also works
```

## Component Categorization

### 🎨 UI Layer (Atomic Design)

#### Atoms (`ui/atoms/`)
**Purpose**: Basic UI building blocks that cannot be broken down further.

**Examples**:
- `Button/` - Action triggers
- `Badge/` - Status indicators
- `Input/` - Form inputs
- `Icon/` - Icon components
- `Text/` - Typography components
- `StatusDot/` - Status indicators
- `Avatar/` - User avatars
- `Spinner/` - Loading indicators

**Guidelines**:
- ✅ Single responsibility
- ✅ No business logic
- ✅ Highly reusable
- ✅ Design system compliant

#### Molecules (`ui/molecules/`)
**Purpose**: Simple combinations of atoms serving a single purpose.

**Examples**:
- `Card/` - Content containers
- `Modal/` - Dialog overlays
- `Tabs/` - Tab navigation
- `SearchInput/` - Search with icon
- `FileUpload/` - File upload widget
- `Pagination/` - Page navigation
- `EmptyState/` - Empty list states
- `MetricCard/` - KPI displays

**Guidelines**:
- ✅ Composed of 2-4 atoms
- ✅ Single, clear purpose
- ✅ Domain-agnostic
- ✅ Reusable across features

#### Organisms (`ui/organisms/`)
**Purpose**: Complex UI components that form distinct sections of an interface.

**Examples**:
- `DataTable/` - Enterprise data tables
- `FormBuilder/` - Dynamic form builder
- `FileManager/` - File management UI
- `Calendar/` - Calendar widget
- `Timeline/` - Event timelines
- `KanbanBoard/` - Kanban views

**Guidelines**:
- ✅ Composed of molecules and atoms
- ✅ Can have internal state
- ✅ Domain-agnostic but configurable
- ✅ May connect to data layer

#### Layouts (`ui/layouts/`)
**Purpose**: Page structure and content arrangement patterns.

**Examples**:
- `AppShell/` - Main application shell
- `PageContainer/` - Standard page wrapper
- `SplitViewLayout/` - Two-pane layouts
- `TabbedLayout/` - Tab-based pages
- `TwoColumnLayout/` - Two-column layouts
- `GridLayout/` - Grid-based layouts

**Guidelines**:
- ✅ Define page structure
- ✅ No business logic
- ✅ Composable
- ✅ Responsive by default

### 🎯 Feature Layer (Domain-Driven)

Each feature domain contains:

```
features/[domain]/
├── components/           # Domain-specific organisms
│   ├── [Component]/
│   │   ├── index.tsx
│   │   ├── [Component].tsx
│   │   ├── [Component].stories.tsx
│   │   └── [Component].test.tsx
│   └── index.ts
├── pages/               # Complete page compositions
│   ├── [Page]/
│   │   ├── index.tsx
│   │   ├── [Page].tsx
│   │   └── [Page].stories.tsx
│   └── index.ts
├── hooks/               # Domain-specific hooks
├── utils/               # Domain-specific utilities
├── types/               # Domain-specific types
└── index.ts            # Barrel exports
```

#### Current Domains

1. **cases/** - Matter lifecycle management
   - Case lists, details, timelines
   - Docket management
   - Case analytics

2. **discovery/** - Discovery & evidence
   - Document review
   - Evidence management
   - Production workflows

3. **documents/** - Document management
   - Document viewer
   - Version control
   - Collaboration

4. **litigation/** - Trial management
   - Trial preparation
   - Exhibit management
   - Witness coordination

5. **operations/** - Firm operations
   - HR management
   - Workflow automation
   - Correspondence

6. **collaboration/** - Communication
   - Chat
   - Comments
   - Activity feeds

7. **knowledge/** - Legal research
   - Research tools
   - Knowledge base
   - Citation management

8. **billing/** - Financial management
   - Time tracking
   - Invoicing
   - Financial analytics

9. **admin/** - System administration
   - User management
   - Settings
   - Integrations

10. **dashboard/** - Analytics & reporting
    - KPI dashboards
    - Reports
    - Business intelligence

### 🔄 Shared Layer (Cross-Cutting)

#### Data Display (`shared/data-display/`)
- `DataTable/` - Enterprise tables
- `ListView/` - List views
- `GridView/` - Grid layouts
- `TreeView/` - Hierarchical data

#### Forms (`shared/forms/`)
- `FormBuilder/` - Dynamic forms
- `FormField/` - Field components
- `Validation/` - Validation helpers

#### Navigation (`shared/navigation/`)
- `Breadcrumbs/` - Navigation breadcrumbs
- `Menu/` - Context menus
- `Sidebar/` - Navigation sidebar
- `TopBar/` - Top navigation

#### Feedback (`shared/feedback/`)
- `Toast/` - Toast notifications
- `Alert/` - Alert messages
- `ConfirmDialog/` - Confirmation dialogs
- `LoadingState/` - Loading states

## Import Patterns

### ✅ Recommended Imports

```typescript
// UI Components (Atomic Design)
import { Button, Badge, Input } from '@/components/ui/atoms';
import { Card, Modal, Tabs } from '@/components/ui/molecules';
import { DataTable, Calendar } from '@/components/ui/organisms';
import { PageContainer, SplitViewLayout } from '@/components/ui/layouts';

// Feature Components (Domain-Specific)
import { CaseList, CaseDetail } from '@/components/features/cases';
import { DocumentViewer } from '@/components/features/documents';
import { DiscoveryDashboard } from '@/components/features/discovery';

// Shared Components (Cross-Cutting)
import { DataTable } from '@/components/shared/data-display';
import { FormBuilder } from '@/components/shared/forms';
import { Breadcrumbs } from '@/components/shared/navigation';

// Theme
import { tokens } from '@/components/theme';
```

### ❌ Avoid

```typescript
// Don't import from deep paths
import Button from '@/components/ui/atoms/Button/Button';

// Don't mix layers
import { Button } from '@/components/features/cases';

// Don't use legacy paths
import { Button } from '@/components/atoms';
```

## Component Development Guidelines

### 1. **Component Structure**

```typescript
// [Component].tsx
import React from 'react';
import { ComponentProps } from './types';
import styles from './[Component].module.css';

export function Component({ prop1, prop2 }: ComponentProps) {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
}

// index.ts
export { Component } from './[Component]';
export type { ComponentProps } from './types';
```

### 2. **Naming Conventions**

- **Components**: PascalCase (`CaseList`, `DocumentViewer`)
- **Files**: PascalCase for components (`CaseList.tsx`)
- **Folders**: PascalCase for component folders
- **Hooks**: camelCase with `use` prefix (`useCaseData`)
- **Utilities**: camelCase (`formatDate`, `validateEmail`)
- **Types**: PascalCase with `Type` suffix (`CaseListProps`)

### 3. **File Organization**

```
[Component]/
├── index.ts              # Barrel export
├── [Component].tsx       # Component implementation
├── [Component].stories.tsx # Storybook story
├── [Component].test.tsx  # Unit tests
├── [Component].module.css # Styles (if needed)
├── types.ts              # Type definitions
└── hooks/                # Component-specific hooks
    └── use[Feature].ts
```

### 4. **Testing Strategy**

- **Atoms**: Test rendering and prop variations
- **Molecules**: Test composition and interactions
- **Organisms**: Test complex interactions and state
- **Pages**: Integration tests with mock data
- **E2E**: Critical user flows

### 5. **Storybook Documentation**

Every component should have a `.stories.tsx` file demonstrating:
- Default state
- All prop variations
- Interactive states
- Error states
- Edge cases

## Migration Guide

### Phase 1: Create New Structure (✅ COMPLETED)
- Created `ui/` directory with atomic layers
- Created `features/` directory with domains
- Created `shared/` directory for cross-cutting

### Phase 2: Migrate Components (IN PROGRESS)
1. Move atoms to `ui/atoms/`
2. Move molecules to `ui/molecules/`
3. Move organisms to appropriate `features/` or `shared/`
4. Move layouts to `ui/layouts/`
5. Move pages to `features/[domain]/pages/`

### Phase 3: Update Imports (PENDING)
1. Update all import paths
2. Update `config/modules.tsx`
3. Update TypeScript paths in `tsconfig.json`
4. Update Storybook configuration

### Phase 4: Cleanup (PENDING)
1. Remove old directory structure
2. Remove `_legacy/` folder
3. Update documentation
4. Run tests

## Benefits of This Structure

### 🎯 **Clear Separation of Concerns**
- UI primitives separate from business logic
- Domain features isolated and maintainable
- Shared components properly categorized

### 📦 **Scalability**
- Easy to add new domains
- Component reuse across features
- Modular architecture

### 🔍 **Discoverability**
- Intuitive folder structure
- Consistent naming conventions
- Clear component hierarchy

### 🧪 **Testability**
- Isolated components
- Clear dependencies
- Mock-friendly structure

### 👥 **Team Collaboration**
- Domain ownership
- Reduced merge conflicts
- Clear contribution guidelines

### 📚 **Documentation**
- Self-documenting structure
- Storybook integration
- Clear component categories

## Best Practices

### DO ✅
- Keep components focused and single-purpose
- Use TypeScript for type safety
- Write comprehensive stories
- Follow atomic design principles
- Use semantic HTML
- Implement accessibility features
- Document complex logic
- Use meaningful prop names

### DON'T ❌
- Mix business logic in UI components
- Create deep component hierarchies
- Duplicate code across domains
- Use inline styles (use theme tokens)
- Skip accessibility attributes
- Import from implementation files
- Create circular dependencies
- Mix feature domains

## Resources

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Component Patterns](https://kentcdodds.com/blog/react-component-patterns)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Enterprise React Architecture](https://engineering.udacity.com/react-architecture-best-practices-3e03c54b9c05)

## Support

For questions or suggestions about component architecture, contact the Frontend Architecture team or open an issue in the project repository.
