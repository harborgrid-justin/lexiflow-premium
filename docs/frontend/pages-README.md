# Enterprise Page Architecture

## Overview
This directory contains **standardized enterprise pages** organized by business domain. Pages follow a strict composition pattern where they act as thin wrappers around feature modules, ensuring consistency and reusability across the application.

## 🏗️ Organization Structure

Pages are organized into **8 business domains** for improved scalability, maintainability, and discoverability:

```
pages/
├── dashboard/          # 📊 Executive & Analytics (1 page)
├── cases/              # 📁 Case Management (7 pages)
├── litigation/         # ⚖️ Litigation Suite (4 pages)
├── operations/         # 🏢 Business Operations (6 pages)
├── documents/          # 📝 Document Management (2 pages)
├── knowledge/          # 📚 Knowledge Management (4 pages)
├── collaboration/      # 🔄 Team Collaboration (2 pages)
└── user/               # 👤 User & Profile (2 pages)
```

**Total**: 28 pages across 8 domains

## Architecture Principles

### 1. Pure Composition Pattern
- **Pages = Templates + Features + Routing**
- No business logic in pages
- All logic resides in feature modules
- Pages orchestrate feature components only

### 2. Component Hierarchy
```
Pages (Routing & Orchestration)
  ↓
Templates (Layout Structure)
  ↓
Organisms (Complex UI Components)
  ↓
Molecules (Composite Components)
  ↓
Atoms (Base UI Elements)
  ↓
Features (Domain Logic & State)
```

### 3. Template Usage
All pages use standardized templates:
- **PageContainer**: Basic page wrapper with consistent padding and max-width
- **TabbedPageLayout**: Pages with tabbed navigation (Dashboard, Billing, etc.)
- **ManagerLayout**: Pages with sidebar and filter panels
- **AppShell**: Full application shell with navigation

## Page Domains

### 📊 Dashboard (1 page)
- **[DashboardPage](./dashboard/)**: Executive dashboard with firm-wide metrics

### 📁 Case Management (7 pages)
- **[CaseListPage](./cases/)**: Case list and search
- **[CaseOverviewPage](./cases/)**: Individual case dashboard
- **[CaseAnalyticsPage](./cases/)**: Case analytics and reporting
- **[CaseIntakePage](./cases/)**: New case intake form
- **[CaseOperationsPage](./cases/)**: Case task management
- **[CaseInsightsPage](./cases/)**: AI-powered case insights
- **[CaseFinancialsPage](./cases/)**: Case budgets and billing

### ⚖️ Litigation (4 pages)
- **[DiscoveryPage](./litigation/)**: E-discovery management
- **[PleadingsPage](./litigation/)**: Legal document drafting
- **[EvidencePage](./litigation/)**: Evidence vault and chain of custody
- **[LitigationStrategyPage](./litigation/)**: Visual strategy planning

### 🏢 Operations (6 pages)
- **[BillingPage](./operations/)**: Time tracking and invoicing
- **[CompliancePage](./operations/)**: Conflict checks and ethics
- **[CRMPage](./operations/)**: Client relationship management
- **[DocumentsPage](./operations/)**: Document repository
- **[CorrespondencePage](./operations/)**: Email and communication
- **[AdminPage](./operations/)**: System administration

### 📝 Documents (2 pages)
- **[DraftingPage](./documents/)**: AI-powered drafting
- **[DocumentAssemblyPage](./documents/)**: Template-based generation

### 📚 Knowledge Management (4 pages)
- **[LegalResearchPage](./knowledge/)**: Case law research
- **[RulesPage](./knowledge/)**: Federal and local rules
- **[JurisdictionPage](./knowledge/)**: Court-specific rules
- **[ClauseLibraryPage](./knowledge/)**: Reusable clauses

### 🔄 Collaboration (2 pages)
- **[WorkflowPage](./collaboration/)**: Process automation
- **[CalendarPage](./collaboration/)**: Deadline tracking

### 👤 User (2 pages)
- **[ProfilePage](./user/)**: User profile and settings
- **[MarketingPage](./user/)**: Business development

## Usage Examples

### Option 1: Root Import (Backwards Compatible)
```tsx
// Import from root - works exactly as before
import { DashboardPage, CaseListPage, DiscoveryPage } from '@/components/pages';
```

### Option 2: Domain Import (Recommended)
```tsx
// Import from domain - better for tree-shaking
import { CaseListPage, CaseOverviewPage } from '@/components/pages/cases';
import { DiscoveryPage } from '@/components/pages/litigation';
```

### Option 3: Direct Import (Most Explicit)
```tsx
// Direct file import - maximum clarity
import { CaseListPage } from '@/components/pages/cases/CaseListPage';
```

### In Route Configuration
```tsx
// All import styles work in routing
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/cases" element={<CaseListPage />} />
<Route path="/discovery" element={<DiscoveryPage />} />
```

## Design Patterns

### Pattern 1: Simple Page
```tsx
export const SimplePage: React.FC<Props> = ({ ...props }) => {
  return (
    <PageContainer>
      <FeatureComponent {...props} />
    </PageContainer>
  );
};
```

### Pattern 2: Tabbed Page
```tsx
export const TabbedPage: React.FC<Props> = ({ initialTab }) => {
  return (
    <PageContainer>
      <TabbedFeature initialTab={initialTab} />
    </PageContainer>
  );
};
```

### Pattern 3: Full-Screen Page (Canvas/Editor)
```tsx
export const FullScreenPage: React.FC<Props> = ({ caseId }) => {
  return (
    <PageContainer className="h-full p-0">
      <FullScreenFeature caseId={caseId} />
    </PageContainer>
  );
};
```

## Benefits of Domain Organization

✅ **Scalability**: Easy to add new pages to specific domains  
✅ **Discoverability**: Related pages grouped together logically  
✅ **Maintainability**: Changes scoped to specific business domains  
✅ **Onboarding**: Clear mental model for new developers  
✅ **Navigation**: IDE folder structure matches business domains  
✅ **Documentation**: Domain-specific README files provide context  
✅ **Testing**: Enables domain-scoped test suites  
✅ **Backwards Compatible**: Existing imports continue to work

### For Developers
- **Predictable structure**: All pages follow same pattern
- **Easy navigation**: Clear separation between pages and features
- **Testability**: Pages are simple wrappers, easy to test
- **Reusability**: Features can be used in multiple pages

### For Enterprise
- **Consistency**: Uniform UX across all pages
- **Maintainability**: Changes to features propagate automatically
- **Scalability**: Add new pages by composing existing features
- **Documentation**: Clear architectural boundaries

## Feature vs Page Decision Matrix

| Criteria | Feature | Page |
|----------|---------|------|
| Contains business logic | ✅ | ❌ |
| Manages state | ✅ | ❌ |
| Reusable across views | ✅ | ❌ |
| Routing endpoint | ❌ | ✅ |
| Uses templates | Maybe | Always |
| Has URL/path | ❌ | ✅ |

## Migration from Features to Pages

Existing code in `features/` directory should remain as-is. Pages simply provide a standardized routing layer on top of features:

**Before** (direct feature import in routes):
```tsx
import { Dashboard } from '@/features/dashboard/components/Dashboard';
<Route path="/dashboard" element={<Dashboard {...props} />} />
```

**After** (using standardized page):
```tsx
import { DashboardPage } from '@/components/pages';
<Route path="/dashboard" element={<DashboardPage {...props} />} />
```

## Key Files

- **index.ts**: Barrel exports for all pages
- **[Page].tsx**: Individual page implementations
- **README.md**: This file - architecture documentation

## Standards Compliance

All pages follow LexiFlow enterprise standards:
- ✅ TypeScript strict mode
- ✅ JSDoc documentation
- ✅ Theme system integration via templates
- ✅ Accessibility (ARIA labels, keyboard nav)
- ✅ Responsive design via Tailwind
- ✅ Error boundaries via templates
- ✅ Loading states via templates

## Next Steps

1. **Update routing**: Replace direct feature imports with page imports in routing config
2. **Add page-level tests**: Test page composition and prop passing
3. **Document page flows**: Create user journey maps linking pages
4. **Performance monitoring**: Add page-level metrics and analytics
5. **SEO optimization**: Add meta tags and structured data to pages

## Related Documentation

- `/docs/COMPONENT_ARCHITECTURE.md` - Overall component design
- `/frontend/src/features/README.md` - Feature module guidelines
- `/frontend/src/components/templates/README.md` - Template documentation
- `/.github/copilot-instructions.md` - Project conventions

---

**Last Updated**: December 27, 2025  
**Architecture Owner**: Enterprise Architecture Team  
**Status**: ✅ Complete - 23 pages implemented
