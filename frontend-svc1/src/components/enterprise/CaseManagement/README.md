# Enterprise Case Management Components

Comprehensive enterprise-grade case management system for LexiFlow Premium.

## Overview

This module provides advanced case management capabilities including:
- Advanced case filtering and bulk operations
- Case templates for different practice areas
- Enhanced timeline visualization
- Team management with role-based access control
- Budget tracking and financial alerts

## Components

### 1. EnterpriseCaseList

**Location**: `./EnterpriseCaseList.tsx`

Advanced case list management with enterprise features:

#### Features
- **Multi-column filtering**: Filter by status, practice area, client, date ranges, budget ranges
- **Saved views**: Save and load custom filter configurations
- **Bulk operations**:
  - Bulk status updates
  - Bulk assignments
  - Mass export
  - Archive multiple cases
  - Delete multiple cases
- **Advanced search**: Full-text search across case fields
- **Column customization**: Show/hide columns, reorder, resize
- **Sorting**: Multi-column sorting with visual indicators
- **Pagination**: Efficient handling of large case lists

#### Usage
```tsx
import { EnterpriseCaseList } from '@/components/enterprise/CaseManagement';

<EnterpriseCaseList
  cases={cases}
  onCaseSelect={(id) => navigate(`/cases/${id}`)}
  onBulkOperation={(operation, caseIds) => handleBulkOp(operation, caseIds)}
  onFilterChange={(filters) => handleFilters(filters)}
  savedViews={savedViews}
  onSaveView={(view) => saveView(view)}
/>
```

### 2. CaseTemplates

**Location**: `./CaseTemplates.tsx`

Matter template management for rapid case creation:

#### Features
- **Practice area templates**: Pre-configured templates for:
  - Civil Litigation (Breach of Contract, etc.)
  - Corporate (Formation, M&A, etc.)
  - Real Estate (Purchase/Sale, Leasing)
  - Family Law (Divorce, Custody)
  - Personal Injury (Auto Accidents, etc.)
- **Template cloning**: Duplicate and customize existing templates
- **Checklist automation**: Auto-generate task checklists
- **Document templates**: Required documents for each case type
- **Milestone tracking**: Pre-defined case milestones
- **Budget estimation**: Estimated duration and budget per template

#### Usage
```tsx
import { CaseTemplates } from '@/components/enterprise/CaseManagement';

<CaseTemplates
  templates={templates}
  onCreateFromTemplate={(template, values) => createCase(template, values)}
  onEditTemplate={(template) => editTemplate(template)}
  onCloneTemplate={(id) => cloneTemplate(id)}
/>
```

### 3. EnhancedCaseTimeline

**Location**: `./EnhancedCaseTimeline.tsx`

Advanced timeline visualization with multiple view modes:

#### Features
- **Multiple view modes**:
  - Chronological view
  - Grouped by event type
  - Milestone view
- **Event filtering**: Filter by type, status, date range
- **Interactive events**: Click events for details
- **Event relationships**: Link related events
- **Priority indicators**: Visual priority markers
- **Status tracking**: Track event completion status
- **Document attachments**: Link documents to events
- **Team assignments**: Assign events to team members

#### Supported Event Types
- Filings
- Hearings
- Deadlines
- Documents
- Motions
- Orders
- Discovery
- Depositions
- Conferences
- Trials
- Settlements
- Notes
- Milestones

#### Usage
```tsx
import { EnhancedCaseTimeline } from '@/components/enterprise/CaseManagement';

<EnhancedCaseTimeline
  events={events}
  onEventClick={(event) => viewEventDetails(event)}
  onEventUpdate={(event) => updateEvent(event)}
  onEventCreate={(event) => createEvent(event)}
  viewMode="chronological"
  showFilters={true}
  allowEdit={true}
/>
```

### 4. CaseTeam

**Location**: `./CaseTeam.tsx`

Team management with role-based access control:

#### Features
- **Role-based permissions**: 8 predefined roles with default permissions:
  - Lead Attorney (full access)
  - Co-Counsel
  - Associate
  - Paralegal
  - Legal Assistant
  - Expert Witness
  - External Counsel
  - Consultant
- **Permission management**: Granular permission control:
  - View case details
  - Edit case information
  - Delete records
  - Manage team
  - Manage documents
  - Manage billing
  - Manage calendar
  - Communicate with client
- **Workload tracking**:
  - Hours logged
  - Task completion
  - Capacity utilization
- **Billing integration**: Track billing rates and generate invoices
- **External counsel**: Manage external attorneys and consultants
- **Expertise tagging**: Tag team members with areas of expertise

#### Usage
```tsx
import { CaseTeam } from '@/components/enterprise/CaseManagement';

<CaseTeam
  caseId={caseId}
  members={teamMembers}
  onAddMember={(member) => addTeamMember(member)}
  onRemoveMember={(id) => removeTeamMember(id)}
  onUpdateMember={(member) => updateTeamMember(member)}
  onUpdatePermissions={(id, perms) => updatePermissions(id, perms)}
  allowEdit={true}
/>
```

### 5. CaseBudget

**Location**: `./CaseBudget.tsx`

Comprehensive budget tracking and financial management:

#### Features
- **Budget tracking**: Real-time budget vs. actual tracking
- **Category breakdown**: Track spending by category:
  - Attorney fees
  - Expert witnesses
  - Court fees & filings
  - Discovery costs
  - Travel & expenses
  - Legal research
  - Other costs
- **Budget alerts**: Configurable threshold alerts:
  - Warning alerts (75% threshold)
  - Critical alerts (90% threshold)
  - Custom alert thresholds
- **Burn rate calculation**: Daily spending rate and projections
- **Expense management**:
  - Track individual expenses
  - Approval workflows
  - Receipt attachments
- **Forecasting**: Project final costs based on current spending
- **Variance reporting**: Compare budgeted vs. actual vs. forecasted
- **Export capabilities**: Export budget reports

#### Usage
```tsx
import { CaseBudget } from '@/components/enterprise/CaseManagement';

<CaseBudget
  caseId={caseId}
  totalBudget={100000}
  totalActual={65000}
  categories={budgetCategories}
  alerts={budgetAlerts}
  expenses={expenses}
  onUpdateBudget={(categoryId, amount) => updateBudget(categoryId, amount)}
  onAddExpense={(expense) => addExpense(expense)}
  onApproveExpense={(id) => approveExpense(id)}
  allowEdit={true}
/>
```

## Type Definitions

All type definitions are centralized in `./types.ts` and include:

### Core Types
- `FilterCriteria` - Search and filter configuration
- `SavedView` - Saved filter view configuration
- `CaseTemplate` - Case template structure
- `TimelineEvent` - Timeline event data
- `TeamMember` - Team member information
- `BudgetCategory` - Budget category tracking
- `BudgetAlert` - Budget alert configuration

### Enterprise Features
- `ConflictCheckResult` - Conflict check results
- `RelatedMatter` - Related case linking
- `MassOperation` - Bulk operation tracking
- `CaseCloneConfig` - Case cloning configuration
- `PracticeAreaConfig` - Practice area setup
- `ExportConfig` - Export configuration
- `ImportConfig` - Import configuration

## Integration

### With Existing Case Management

These components are designed to work alongside existing case management components:

```tsx
import { CaseManagement } from '@/features/cases/components/list/CaseManagement';
import { EnterpriseCaseList, CaseTeam, CaseBudget } from '@/components/enterprise/CaseManagement';

// Use enterprise components for advanced features
// Use existing components for standard workflows
```

### With API Layer

All components accept data as props and emit events for data changes:

```tsx
// Fetch data
const { data: cases } = useQuery(['cases'], () => api.cases.getAll());

// Handle updates
const handleBulkUpdate = async (operation, caseIds) => {
  await api.cases.bulkUpdate(operation, caseIds);
  queryClient.invalidateQueries(['cases']);
};

<EnterpriseCaseList
  cases={cases}
  onBulkOperation={handleBulkUpdate}
/>
```

## Styling

All components use Tailwind CSS with dark mode support:
- Consistent color schemes across components
- Responsive design for mobile/tablet/desktop
- Dark mode variants for all UI elements
- Accessible color contrasts (WCAG AA compliant)

## Performance Considerations

- **Virtual scrolling**: For large case lists (1000+ cases)
- **Lazy loading**: Timeline events loaded on-demand
- **Memoization**: Heavy computations are memoized
- **Debounced search**: Search queries debounced to reduce API calls
- **Optimistic updates**: UI updates immediately, syncs with server

## Future Enhancements

Planned features for future releases:
- Advanced analytics and reporting
- AI-powered case recommendations
- Automated workflow triggers
- Integration with court e-filing systems
- Mobile app companion
- Voice commands and dictation
- Real-time collaboration features

## Support

For issues or questions:
- Check existing documentation in `/docs`
- Review component stories in Storybook
- Contact development team

## License

Proprietary - LexiFlow Premium Enterprise Edition
