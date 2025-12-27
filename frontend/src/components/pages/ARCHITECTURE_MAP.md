# LexiFlow Enterprise Page Architecture Map

## Page Inventory (23 Pages)

### 📊 Executive & Analytics (1)
```
DashboardPage
├── Template: PageContainer
├── Feature: Dashboard
└── Domain: Executive Overview
```

### 📁 Case Management (7)
```
CaseListPage
├── Template: PageContainer
├── Feature: CaseManagement
└── Domain: Case List/Search

CaseOverviewPage
├── Template: PageContainer
├── Feature: CaseOverviewDashboard
└── Domain: Case Status

CaseAnalyticsPage
├── Template: PageContainer
├── Feature: CaseAnalyticsDashboard
└── Domain: Case Analytics

CaseIntakePage
├── Template: PageContainer
├── Feature: NewCaseIntakeForm
└── Domain: Case Creation

CaseOperationsPage
├── Template: PageContainer
├── Feature: CaseOperationsCenter
└── Domain: Task Management

CaseInsightsPage
├── Template: PageContainer
├── Feature: CaseInsightsDashboard
└── Domain: AI Insights

CaseFinancialsPage
├── Template: PageContainer
├── Feature: CaseFinancialsCenter
└── Domain: Financial Tracking
```

### ⚖️ Litigation (4)
```
DiscoveryPage
├── Template: PageContainer
├── Feature: DiscoveryDashboard
└── Domain: E-Discovery

PleadingsPage
├── Template: PageContainer
├── Feature: PleadingDashboard
└── Domain: Legal Drafting

EvidencePage
├── Template: PageContainer
├── Feature: EvidenceDashboard
└── Domain: Evidence Management

LitigationStrategyPage
├── Template: PageContainer (fullscreen)
├── Feature: LitigationBuilder
└── Domain: Strategy Planning
```

### 🏢 Operations (6)
```
BillingPage
├── Template: PageContainer
├── Feature: BillingDashboard
└── Domain: Time & Billing

CompliancePage
├── Template: PageContainer
├── Feature: ComplianceDashboard
└── Domain: Ethics/Conflicts

CRMPage
├── Template: PageContainer
├── Feature: CRMDashboard
└── Domain: Client Relations

DocumentsPage
├── Template: PageContainer
├── Feature: DocumentManager
└── Domain: Document Repository

CorrespondencePage
├── Template: PageContainer
├── Feature: CorrespondenceManager
└── Domain: Communications

AdminPage
├── Template: PageContainer
├── Feature: AdminPanel
└── Domain: System Admin
```

### 📝 Document Generation (2)
```
DraftingPage
├── Template: PageContainer (fullscreen)
├── Feature: DraftingDashboard
└── Domain: AI Drafting

DocumentAssemblyPage
├── Template: PageContainer
├── Feature: DocumentAssemblyHub
└── Domain: Template Assembly
```

### 📚 Knowledge Management (4)
```
LegalResearchPage
├── Template: PageContainer (fullscreen)
├── Feature: ResearchTool
└── Domain: Case Law Research

RulesPage
├── Template: PageContainer
├── Feature: RulesDashboard
└── Domain: Federal/Local Rules

JurisdictionPage
├── Template: PageContainer
├── Feature: JurisdictionManager
└── Domain: Court Rules

ClauseLibraryPage
├── Template: PageContainer
├── Feature: ClauseLibraryManager
└── Domain: Clause Repository
```

### 🔄 Workflow & Collaboration (2)
```
WorkflowPage
├── Template: PageContainer
├── Feature: WorkflowManager
└── Domain: Process Automation

CalendarPage
├── Template: PageContainer
├── Feature: CaseCalendar
└── Domain: Scheduling
```

### 👤 User & Firm (2)
```
ProfilePage
├── Template: PageContainer
├── Feature: ProfileDashboard
└── Domain: User Profile

MarketingPage
├── Template: PageContainer
├── Feature: MarketingDashboard
└── Domain: Business Development
```

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGES LAYER                         │
│  (Routing endpoints - pure composition, no logic)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      TEMPLATES LAYER                        │
│  PageContainer | TabbedPageLayout | ManagerLayout           │
│  (Layout structure, consistent spacing)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      FEATURES LAYER                         │
│  Dashboard | CaseManagement | DiscoveryDashboard            │
│  (Domain logic, state management, business rules)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     ORGANISMS LAYER                         │
│  PageHeader | Table | FilterPanel | NotificationCenter      │
│  (Complex reusable components)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                     MOLECULES LAYER                         │
│  Card | Modal | MetricCard | SearchInput                    │
│  (Composite components with multiple atoms)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                       ATOMS LAYER                           │
│  Button | Input | Badge | Avatar                            │
│  (Base UI primitives)                                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
User Action
    ↓
Page (Routing)
    ↓
Feature Component (Event Handler)
    ↓
DataService/API (Business Logic)
    ↓
Backend API or IndexedDB
    ↓
React Query Cache
    ↓
Component Re-render
    ↓
UI Update
```

## Page-to-Feature Mapping

| Page | Primary Feature | Feature Location |
|------|----------------|------------------|
| DashboardPage | Dashboard | features/dashboard/components/Dashboard.tsx |
| CaseListPage | CaseManagement | features/cases/components/list |
| CaseOverviewPage | CaseOverviewDashboard | features/cases/components/overview |
| DiscoveryPage | DiscoveryDashboard | features/litigation/discovery/dashboard |
| BillingPage | BillingDashboard | features/operations/billing |
| LegalResearchPage | ResearchTool | features/knowledge/research |
| AdminPage | AdminPanel | features/admin/components |

## Routing Integration Example

```tsx
// app/routes.tsx or similar
import {
  DashboardPage,
  CaseListPage,
  CaseOverviewPage,
  DiscoveryPage,
  BillingPage,
  // ... other pages
} from '@/components/pages';

const routes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/cases', element: <CaseListPage /> },
  { path: '/cases/:id', element: <CaseOverviewPage /> },
  { path: '/discovery', element: <DiscoveryPage /> },
  { path: '/billing', element: <BillingPage /> },
  // ... more routes
];
```

## Template Patterns Used

### Pattern A: Standard Page
**Pages**: Most pages (17/23)
```tsx
<PageContainer>
  <FeatureComponent />
</PageContainer>
```

### Pattern B: Fullscreen Canvas
**Pages**: LitigationStrategyPage, DraftingPage, LegalResearchPage (3/23)
```tsx
<PageContainer className="h-full p-0">
  <FullscreenFeature />
</PageContainer>
```

### Pattern C: Contextual Page
**Pages**: Case-specific pages (3/23)
```tsx
<PageContainer>
  <FeatureComponent caseId={caseId} />
</PageContainer>
```

## Feature Reusability Matrix

| Feature | Used in Pages | Reusable |
|---------|---------------|----------|
| PageContainer | All 23 pages | ✅ Yes |
| Dashboard | DashboardPage | Single use |
| CaseManagement | CaseListPage | Single use |
| DiscoveryDashboard | DiscoveryPage | Single use |
| DocumentManager | DocumentsPage | ✅ Multi-use |

## Benefits Summary

### 🎯 Consistency
- All pages use PageContainer template
- Uniform spacing, max-width, animations
- Consistent loading states and error handling

### 🔧 Maintainability
- Clear separation: Pages ≠ Features
- Feature changes auto-propagate to pages
- Single source of truth for each domain

### 📈 Scalability
- Add new pages by composing existing features
- No duplication of business logic
- Easy to add new feature variations

### 🧪 Testability
- Pages are simple, minimal test surface
- Test features independently
- Integration tests at page level are straightforward

### 📚 Discoverability
- All pages exported from single index.ts
- Clear naming convention: [Domain]Page
- Self-documenting architecture

---

**Architecture Status**: ✅ Complete  
**Total Pages**: 23  
**Total Features Used**: 25+  
**Total Templates**: 4  
**Coverage**: All major application domains
