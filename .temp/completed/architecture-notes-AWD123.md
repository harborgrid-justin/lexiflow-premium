# Architecture Notes - AdvancedWorkflowDesigner Refactoring

## Component Hierarchy

```
AdvancedWorkflowDesigner (Main Container)
├── WorkflowDesignerHeader
├── WorkflowFeatureStats
├── WorkflowFeatureTabs
└── Feature Panels (conditional rendering based on activeTab)
    ├── VisualDesignerPanel
    ├── ConditionalBranchingPanel
    ├── ParallelExecutionPanel
    ├── VersionControlPanel
    ├── SLAMonitoringPanel
    ├── ApprovalChainsPanel
    ├── RollbackPanel
    ├── AnalyticsPanel
    ├── AISuggestionsPanel
    └── ExternalTriggersPanel
```

## Design Decisions

### State Management
- **Main Component**: Retains all data fetching hooks, mutations, and state
- **Sub-Components**: Receive data and callbacks via props (presentational components)
- **Rationale**: Keeps data logic centralized, makes sub-components reusable and testable

### Component Communication
- Parent-to-child: Props for data and event handlers
- Child-to-parent: Callback props for user actions
- No sibling communication needed (all state in parent)

### Props Design
- Each panel receives only the data it needs (principle of least knowledge)
- Callbacks passed for user actions (onClick handlers)
- Theme context used for styling (already available)

### Performance Considerations
- Sub-components are pure presentational components (candidates for React.memo)
- Data fetching optimized with conditional queries (already implemented)
- No prop drilling issues (single level of nesting)

### Type Safety
- All components will have explicit TypeScript interfaces
- Props interfaces will be exported for reusability
- Proper typing for all callbacks and handlers

## File Structure

```
/features/cases/components/workflow/
├── AdvancedWorkflowDesigner.tsx (main component)
├── components/
│   ├── WorkflowDesignerHeader.tsx
│   ├── WorkflowFeatureStats.tsx
│   ├── WorkflowFeatureTabs.tsx
│   └── panels/
│       ├── VisualDesignerPanel.tsx
│       ├── ConditionalBranchingPanel.tsx
│       ├── ParallelExecutionPanel.tsx
│       ├── VersionControlPanel.tsx
│       ├── SLAMonitoringPanel.tsx
│       ├── ApprovalChainsPanel.tsx
│       ├── RollbackPanel.tsx
│       ├── AnalyticsPanel.tsx
│       ├── AISuggestionsPanel.tsx
│       └── ExternalTriggersPanel.tsx
└── types/
    └── workflow-designer.types.ts (if needed for shared types)
```

## Integration Patterns

### Data Flow
1. Main component fetches data via useQuery hooks
2. Main component manages mutations via useMutation hooks
3. Data passed down to panels as props
4. User actions in panels trigger callbacks
5. Callbacks invoke mutations in main component
6. Query invalidation triggers re-fetch

### Error Handling
- Loading states handled in main component
- Error states can be passed to panels as props
- Notifications handled via useNotify hook in main component

## React Patterns Used

### Component Composition
- Main container component composes smaller feature panels
- Each panel is a focused, single-responsibility component
- Conditional rendering based on activeTab state

### Props Pattern
- Explicit props interfaces for type safety
- Optional props with default values where appropriate
- Callback props for event handling

### Hooks Usage
- Data fetching hooks remain in main component
- Theme hook used in sub-components for styling
- No custom hooks needed for initial refactoring

## Browser Compatibility
- No browser-specific code
- Uses standard React patterns
- CSS-in-JS via className (compatible with all modern browsers)
