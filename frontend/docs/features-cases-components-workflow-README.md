# Workflow Module - Enterprise Organization

## Directory Structure

```
workflow/
├── README.md                          # This file - module documentation
├── index.ts                           # Main barrel export (organized by category)
├── types.ts                           # Shared type definitions
├── constants.ts                       # Shared constants (colors, tabs, config)
├── utils.tsx                          # Utility functions (formatDeadline, getCaseProgress)
│
├── DESIGNERS/                         # Visual Workflow Builders
│   ├── AdvancedWorkflowDesigner.tsx   # 10-feature enterprise designer
│   └── WorkflowTemplateBuilder.tsx    # Template creation & editing
│
├── MANAGEMENT/                        # Workflow Library & Engine
│   ├── MasterWorkflow.tsx             # Main workflow hub (templates/cases/firm/ops)
│   ├── WorkflowLibrary.tsx            # Template library browser
│   ├── WorkflowEngineDetail.tsx       # Engine configuration viewer
│   ├── TemplatePreview.tsx            # Template preview modal
│   ├── TemplateActions.tsx            # Template action buttons
│   └── WorkflowTabs.ts                # Master workflow tab configuration
│
├── EXECUTION/                         # Task Management Components
│   ├── ParallelTasksManager.tsx       # Concurrent task execution
│   ├── TaskDependencyManager.tsx      # Task dependency graph
│   ├── TaskReassignmentPanel.tsx      # Task reassignment UI
│   ├── TaskWorkflowBadges.tsx         # Status badges
│   └── StageEditor.tsx                # Workflow stage editor
│
├── MONITORING/                        # Analytics & Tracking
│   ├── SLAMonitor.tsx                 # SLA tracking & alerts
│   ├── WorkflowAnalyticsDashboard.tsx # Performance metrics
│   ├── AuditTrailViewer.tsx           # Audit log viewer
│   ├── NotificationCenter.tsx         # Real-time notifications
│   ├── TimeTrackingPanel.tsx          # Time entry tracking
│   └── WorkflowTimeline.tsx           # Visual timeline view
│
├── AUTOMATION/                        # Configuration & Approvals
│   ├── WorkflowConfig.tsx             # Workflow settings panel
│   ├── WorkflowAutomations.tsx        # Automation rules
│   ├── ApprovalWorkflow.tsx           # Approval chain management
│   └── WorkflowQuickActions.tsx       # Quick action buttons
│
├── PROCESS/                           # Firm & Case Workflows
│   ├── FirmProcessList.tsx            # Firm-wide process list
│   ├── FirmProcessDetail.tsx          # Process detail view
│   └── CaseWorkflowList.tsx           # Case-specific workflows
│
├── PANELS/                            # Main UI Container
│   └── EnhancedWorkflowPanel.tsx      # Tabbed workflow interface
│
├── builder/                           # Visual Builder Components
│   ├── index.ts                       # Builder exports
│   ├── types.ts                       # Builder types (re-exports central types)
│   ├── BuilderCanvas.tsx              # Drag-drop node canvas
│   ├── BuilderPalette.tsx             # Node type palette
│   ├── BuilderProperties.tsx          # Property editor panel
│   ├── BuilderToolbar.tsx             # Toolbar (zoom/pan controls)
│   ├── GeneralSettings.tsx            # Workflow settings
│   └── SimulationView.tsx             # Execution simulator
│
├── components/                        # Advanced Designer Components
│   ├── index.ts                       # Component exports
│   ├── WorkflowDesignerHeader.tsx     # Designer header
│   ├── WorkflowFeatureTabs.tsx        # 10-feature tabs
│   ├── WorkflowFeatureStats.tsx       # Real-time stats
│   └── panels/                        # 10 Feature Panels
│       ├── index.ts                   # Panel exports with feature matrix
│       ├── VisualDesignerPanel.tsx    # 1. Visual designer
│       ├── ConditionalBranchingPanel.tsx # 2. Conditional logic
│       ├── ParallelExecutionPanel.tsx    # 3. Parallel tasks
│       ├── VersionControlPanel.tsx       # 4. Version control
│       ├── SLAMonitoringPanel.tsx        # 5. SLA monitoring
│       ├── ApprovalChainsPanel.tsx       # 6. Approval chains
│       ├── RollbackPanel.tsx             # 7. Rollback/snapshots
│       ├── AnalyticsPanel.tsx            # 8. Analytics
│       ├── AISuggestionsPanel.tsx        # 9. AI suggestions
│       └── ExternalTriggersPanel.tsx     # 10. External triggers
│
├── modules/                           # Specialized Modules
│   ├── index.ts                       # Module exports
│   └── ReviewPanel.tsx                # Workflow review panel
│
└── hooks/                             # Custom Hooks
    ├── index.ts                       # Hook exports
    └── useAdvancedWorkflowDesigner.ts # Advanced designer state/logic

```

## Module Categories

### 1. Core (Root Level)
**Files:** `types.ts`, `constants.ts`, `utils.tsx`, `index.ts`

**Purpose:** Shared types, constants, and utilities used across all workflow components.

**Key Exports:**
- `WorkflowAnalyticsData`, `SLAItem`, `ApprovalRequest`, `AuditEvent` - Shared types
- `getChartColors()` - Theme-aware chart colors
- `ENHANCED_WORKFLOW_TABS` - Tab configuration
- `formatDeadline()`, `getCaseProgress()` - Utility functions

### 2. Designers
**Files:** `AdvancedWorkflowDesigner.tsx`, `WorkflowTemplateBuilder.tsx`

**Purpose:** Visual workflow builders with drag-drop capabilities.

**Features:**
- **AdvancedWorkflowDesigner**: 10 enterprise features (conditional branching, parallel execution, version control, SLA, approvals, rollback, analytics, AI, triggers)
- **WorkflowTemplateBuilder**: Create/edit workflow templates with visual canvas

### 3. Management
**Files:** `MasterWorkflow.tsx`, `WorkflowLibrary.tsx`, `WorkflowEngineDetail.tsx`, etc.

**Purpose:** High-level workflow organization and template management.

**Features:**
- Multi-tab navigation (templates, cases, firm processes, ops center, analytics, settings)
- Template library browser with search/filter
- Engine configuration viewer

### 4. Execution
**Files:** `ParallelTasksManager.tsx`, `TaskDependencyManager.tsx`, etc.

**Purpose:** Task execution and dependency management.

**Features:**
- Concurrent task execution with parallel tracks
- Task dependency visualization (graph)
- Task reassignment UI
- Workflow stage editor

### 5. Monitoring
**Files:** `SLAMonitor.tsx`, `WorkflowAnalyticsDashboard.tsx`, `AuditTrailViewer.tsx`, etc.

**Purpose:** Real-time monitoring and analytics.

**Features:**
- SLA tracking with progress indicators
- Performance metrics and charts
- Audit trail with filtering
- Live notification center
- Time tracking integration

### 6. Automation
**Files:** `WorkflowConfig.tsx`, `WorkflowAutomations.tsx`, `ApprovalWorkflow.tsx`, etc.

**Purpose:** Workflow configuration and approval chains.

**Features:**
- Automation rule configuration
- Multi-stage approval workflows
- Quick action shortcuts
- Workflow settings panel

### 7. Process
**Files:** `FirmProcessList.tsx`, `FirmProcessDetail.tsx`, `CaseWorkflowList.tsx`

**Purpose:** Firm-wide and case-specific workflow management.

**Features:**
- Firm process templates
- Case workflow instances
- Process detail views

### 8. Panels
**Files:** `EnhancedWorkflowPanel.tsx`

**Purpose:** Main UI container for workflow management.

**Features:**
- Tabbed interface (tasks, dependencies, approvals, history)
- KPI dashboard
- Component composition pattern

### 9. Builder (Submodule)
**Directory:** `builder/`

**Purpose:** Modular visual builder components.

**Components:**
- `BuilderCanvas` - Main drag-drop area
- `BuilderPalette` - Node type selector
- `BuilderProperties` - Property editor
- `BuilderToolbar` - Zoom/pan controls
- `GeneralSettings` - Workflow settings
- `SimulationView` - Test execution

### 10. Components (Submodule)
**Directory:** `components/`

**Purpose:** Advanced designer UI components and feature panels.

**Structure:**
- Header/Navigation: `WorkflowDesignerHeader`, `WorkflowFeatureTabs`, `WorkflowFeatureStats`
- Panels: 10 advanced feature panels (see `components/panels/index.ts` for full matrix)

### 11. Modules (Submodule)
**Directory:** `modules/`

**Purpose:** Specialized workflow modules.

**Components:**
- `ReviewPanel` - Workflow review and approval

### 12. Hooks (Submodule)
**Directory:** `hooks/`

**Purpose:** Custom React hooks for workflow logic.

**Hooks:**
- `useAdvancedWorkflowDesigner` - State management for advanced designer (10 features)

## Import Patterns

### External Imports (from parent components)
```typescript
import {
  MasterWorkflow,
  WorkflowTemplateBuilder,
  AdvancedWorkflowDesigner,
  EnhancedWorkflowPanel
} from '@/features/cases/components/workflow';
```

### Internal Imports (within workflow module)
```typescript
// Use relative paths for submodules
import { BuilderCanvas, BuilderPalette } from './builder';
import { VisualDesignerPanel, AnalyticsPanel } from './components/panels';
import { useAdvancedWorkflowDesigner } from './hooks';

// Use named exports from root
import { formatDeadline, getCaseProgress } from './utils';
import { ENHANCED_WORKFLOW_TABS, getChartColors } from './constants';
import type { SLAItem, ApprovalRequest } from './types';
```

## Design Principles

### 1. Single Responsibility
Each component has one clear purpose:
- `SLAMonitor` → SLA tracking ONLY
- `TaskDependencyManager` → Dependency graph ONLY
- `ApprovalWorkflow` → Approval chains ONLY

### 2. Composition Over Inheritance
- Use small, focused components
- Compose complex UIs from simple parts
- Example: `EnhancedWorkflowPanel` composes `SLAMonitor`, `TimeTrackingPanel`, etc.

### 3. Separation of Concerns
- **Presentation** - Pure UI components (stateless)
- **Container** - State management components (stateful)
- **Hooks** - Reusable logic
- **Utils** - Pure functions

### 4. Type Safety
- All props typed with TypeScript interfaces
- Shared types in `types.ts`
- Re-export central types from `@/types` where applicable

### 5. Consistent Naming
- **Components**: PascalCase (`WorkflowTemplateBuilder`)
- **Hooks**: camelCase with `use` prefix (`useAdvancedWorkflowDesigner`)
- **Utils**: camelCase (`formatDeadline`)
- **Constants**: UPPER_SNAKE_CASE (`ENHANCED_WORKFLOW_TABS`)

### 6. Backend Integration
All components use backend APIs via:
- `DataService` facade (routes to backend by default)
- `DocumentsApiService` for direct API access
- `useQuery` / `useMutation` from `@/hooks/useQueryHooks`

### 7. No Duplication
- Tab configurations consolidated in `constants.ts`
- Icon utilities in `builder/types.ts` (re-exports from central types)
- Chart colors in `constants.ts` (`getChartColors`)

## Testing Strategy

### Unit Tests
- Test utility functions in isolation (`formatDeadline`, `getCaseProgress`)
- Test component rendering with mocked data
- Test hooks with React Testing Library

### Integration Tests
- Test component interactions
- Test workflow builder drag-drop
- Test approval chain flows

### E2E Tests
- Test full workflow creation → execution → completion
- Test template creation and deployment
- Test SLA monitoring and alerts

## Performance Considerations

### Code Splitting
- Lazy load designers (`AdvancedWorkflowDesigner`, `WorkflowTemplateBuilder`)
- Use `React.lazy()` for heavy components

### Memoization
- Use `React.memo()` for pure presentational components
- Use `useMemo()` for expensive computations (e.g., chart data processing)
- Use `useCallback()` for event handlers passed to child components

### Query Optimization
- Use `queryKeys` for proper cache invalidation
- Set appropriate `staleTime` for query caching
- Use pagination for large lists (workflows, tasks, audit logs)

## Future Enhancements

1. **Real-time Collaboration** - Multi-user workflow editing with WebSockets
2. **Workflow Versioning** - Full version control with diff view
3. **Advanced Analytics** - Machine learning insights for workflow optimization
4. **Mobile Support** - Responsive design for workflow monitoring on mobile
5. **Workflow Marketplace** - Share and import community templates

## Contributing Guidelines

1. **New Components** - Place in appropriate category directory
2. **New Features** - Add to `AdvancedWorkflowDesigner` or create new designer
3. **Shared Logic** - Extract to `hooks/` or `utils.tsx`
4. **Types** - Add to `types.ts` or central `@/types`
5. **Constants** - Add to `constants.ts`
6. **Documentation** - Update this README with any structural changes

## Dependencies

### Internal
- `@/features/theme` - Theme context and utilities
- `@/hooks/useQueryHooks` - Data fetching hooks
- `@/services/data/dataService` - Backend API facade
- `@/api/admin/documents-api` - Document operations
- `@/types` - Central type definitions

### External
- `react` - UI library
- `lucide-react` - Icon library
- `recharts` - Chart components (analytics)

## Migration Notes

### From Old Structure
If migrating from the old flat structure:

1. **Update imports** - Change to use barrel exports from `./workflow`
2. **Check tab constants** - Use `ENHANCED_WORKFLOW_TABS` instead of inline arrays
3. **Verify types** - Import from `./workflow/types` instead of inline definitions
4. **Update tests** - Mock imports from new paths

### Breaking Changes
None. All exports maintain backward compatibility via barrel exports in `index.ts`.
