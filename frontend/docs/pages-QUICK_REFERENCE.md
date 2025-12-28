# Page Quick Reference Guide

## 🚀 Quick Start

Import any page from the centralized barrel export:
```tsx
import { DashboardPage, CaseListPage, DiscoveryPage } from '@/components/pages';
```

## 📋 Complete Page List (Alphabetical)

| Page Name | Purpose | Required Props |
|-----------|---------|----------------|
| **AdminPage** | System administration | `initialTab?` |
| **BillingPage** | Time tracking & invoicing | `navigateTo?`, `initialTab?` |
| **CalendarPage** | Deadline tracking | `caseId?` |
| **CaseAnalyticsPage** | Case metrics & reports | `caseId?` |
| **CaseFinancialsPage** | Case budgets & billing | `caseId` |
| **CaseInsightsPage** | AI-powered insights | `caseId` |
| **CaseIntakePage** | New case creation | `onComplete?`, `onCancel?` |
| **CaseListPage** | Case list/search | `onSelectCase?` |
| **CaseOperationsPage** | Task management | `caseId` |
| **CaseOverviewPage** | Case dashboard | `caseId?` |
| **ClauseLibraryPage** | Reusable clauses | - |
| **CompliancePage** | Ethics & conflicts | `initialTab?` |
| **CorrespondencePage** | Email tracking | `caseId?` |
| **CRMPage** | Client relations | - |
| **DashboardPage** | Executive overview | `onSelectCase`, `currentUser`, `initialTab?` |
| **DiscoveryPage** | E-discovery | `onNavigate` |
| **DocumentAssemblyPage** | Template-based docs | `caseId?` |
| **DocumentsPage** | Document repository | `caseId?` |
| **DraftingPage** | AI drafting | - |
| **EvidencePage** | Evidence vault | `onNavigate` |
| **JurisdictionPage** | Court rules | - |
| **LegalResearchPage** | Case law research | - |
| **LitigationStrategyPage** | Strategy canvas | `caseId` |
| **MarketingPage** | Business development | - |
| **PleadingsPage** | Legal documents | `onCreate`, `onEdit`, `caseId?` |
| **ProfilePage** | User settings | - |
| **RulesPage** | Federal/local rules | `onNavigate` |
| **WorkflowPage** | Process automation | `caseId?` |

## 🎯 Common Use Cases

### Basic Page with No Props
```tsx
import { ProfilePage, CRMPage } from '@/components/pages';

<Route path="/profile" element={<ProfilePage />} />
<Route path="/crm" element={<CRMPage />} />
```

### Page with Case Context
```tsx
import { CaseFinancialsPage } from '@/components/pages';

<Route 
  path="/cases/:caseId/financials" 
  element={<CaseFinancialsPage caseId={caseId} />} 
/>
```

### Page with Navigation Callback
```tsx
import { DiscoveryPage } from '@/components/pages';

const handleNavigate = (view: DiscoveryView, id?: string) => {
  // Navigation logic
};

<DiscoveryPage onNavigate={handleNavigate} />
```

### Page with Initial Tab
```tsx
import { BillingPage, CompliancePage } from '@/components/pages';

<BillingPage initialTab="invoices" />
<CompliancePage initialTab="conflicts" />
```

## 🏗️ Page Structure Pattern

Every page follows this pattern:
```tsx
import React from 'react';
import { FeatureComponent } from '@/features/domain';
import { PageContainer } from '@/components/templates/PageContainer';

interface PageProps {
  // Props specific to the feature
}

export const PageName: React.FC<PageProps> = (props) => {
  return (
    <PageContainer>
      <FeatureComponent {...props} />
    </PageContainer>
  );
};
```

## 🔄 Migration from Features

### Before (Direct Feature Import)
```tsx
// ❌ Old way - importing features directly
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { CaseManagement } from '@/features/cases';

<Route path="/dashboard" element={<Dashboard {...props} />} />
<Route path="/cases" element={<CaseManagement {...props} />} />
```

### After (Using Pages)
```tsx
// ✅ New way - using standardized pages
import { DashboardPage, CaseListPage } from '@/components/pages';

<Route path="/dashboard" element={<DashboardPage {...props} />} />
<Route path="/cases" element={<CaseListPage {...props} />} />
```

## 📊 Page Categories

### Executive (1)
- DashboardPage

### Case Management (7)
- CaseListPage, CaseOverviewPage, CaseAnalyticsPage
- CaseIntakePage, CaseOperationsPage, CaseInsightsPage
- CaseFinancialsPage

### Litigation (4)
- DiscoveryPage, PleadingsPage, EvidencePage
- LitigationStrategyPage

### Operations (6)
- BillingPage, CompliancePage, CRMPage
- DocumentsPage, CorrespondencePage, AdminPage

### Documents (2)
- DraftingPage, DocumentAssemblyPage

### Knowledge (4)
- LegalResearchPage, RulesPage
- JurisdictionPage, ClauseLibraryPage

### Workflow (2)
- WorkflowPage, CalendarPage

### User (2)
- ProfilePage, MarketingPage

## 🎨 Template Variants

### Standard Page (Most Common)
```tsx
<PageContainer>
  <FeatureComponent />
</PageContainer>
```
**Used by**: 17 pages

### Fullscreen Page (Canvas/Editor)
```tsx
<PageContainer className="h-full p-0">
  <FeatureComponent />
</PageContainer>
```
**Used by**: LitigationStrategyPage, DraftingPage, LegalResearchPage

## 🔍 Finding the Right Page

| If you need... | Use this page |
|----------------|---------------|
| Executive dashboard | DashboardPage |
| List of cases | CaseListPage |
| Case details | CaseOverviewPage |
| Create new case | CaseIntakePage |
| E-discovery | DiscoveryPage |
| Draft documents | DraftingPage |
| Legal research | LegalResearchPage |
| Time tracking | BillingPage |
| Conflict checks | CompliancePage |
| Client management | CRMPage |
| User settings | ProfilePage |

## ⚡ Performance Tips

1. **Lazy Loading**: Pages are perfect for route-based code splitting
   ```tsx
   const DashboardPage = lazy(() => import('@/components/pages/DashboardPage'));
   ```

2. **Prefetching**: Preload likely next pages
   ```tsx
   import { preloadComponent } from '@/utils/lazyHelpers';
   preloadComponent(() => import('@/components/pages/CaseListPage'));
   ```

3. **Memoization**: Pages are pure, use React.memo if needed
   ```tsx
   export const PageName = React.memo<PageProps>(({ ...props }) => {
     // ...
   });
   ```

## 🐛 Common Issues

### Issue: "Page not found in index.ts"
**Solution**: Check spelling, all pages are exported from `@/components/pages`

### Issue: "Type error with props"
**Solution**: Import the Props interface from the page file if needed

### Issue: "Feature not rendering"
**Solution**: Verify the feature component is properly exported from its module

### Issue: "Page layout looks wrong"
**Solution**: Check if you need `className="h-full p-0"` for fullscreen layouts

## 📝 Adding a New Page

1. Create page file in `frontend/src/components/pages/`
2. Follow the standard pattern (see above)
3. Export from `index.ts`
4. Add to README.md and ARCHITECTURE_MAP.md
5. Update this quick reference

## 🔗 Related Files

- **Index**: `frontend/src/components/pages/index.ts`
- **Docs**: `frontend/src/components/pages/README.md`
- **Map**: `frontend/src/components/pages/ARCHITECTURE_MAP.md`
- **Templates**: `frontend/src/components/templates/`
- **Features**: `frontend/src/features/`

---

**Last Updated**: December 27, 2025  
**Total Pages**: 23  
**Status**: ✅ Production Ready
