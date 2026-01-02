# Next.js 16 Enterprise Compliance Gap Analysis

**Analysis Date:** Fri Jan  2 03:05:40 PM UTC 2026
**Total Pages Analyzed:** 165

---

## Executive Summary

- **Total Issues Found:** 704
- **Critical Issues:** 1
- **High Priority:** 230
- **Medium Priority:** 298
- **Low Priority:** 175
- **Pages with Issues:** 165 out of 165 (100.0%)

### Issues by Category:

- **Performance:** 175 issues
- **Error Boundaries:** 165 issues
- **Loading States:** 165 issues
- **TypeScript:** 109 issues
- **Dynamic Routes:** 58 issues
- **Data Fetching:** 31 issues
- **Metadata API:** 1 issues

---

## Detailed Analysis by File

### 1. src/app/(main)/access-logs/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/access-logs

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/access-logs

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 2. src/app/(main)/admin/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/admin

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/admin

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 3. src/app/(main)/admissions/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/admissions/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/admissions/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 4. src/app/(main)/admissions/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/admissions

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/admissions

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 5. src/app/(main)/analytics/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/analytics

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/analytics

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 6. src/app/(main)/announcements/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/announcements

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/announcements

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 7. src/app/(main)/appeals/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/appeals/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/appeals/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 8. src/app/(main)/appeals/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/appeals

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/appeals

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 9. src/app/(main)/arbitration/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/arbitration/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/arbitration/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 10. src/app/(main)/arbitration/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/arbitration

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/arbitration

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 11. src/app/(main)/audit-logs/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/audit-logs

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/audit-logs

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 12. src/app/(main)/backup-restore/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/backup-restore

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/backup-restore

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 13. src/app/(main)/bar-requirements/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/bar-requirements

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/bar-requirements

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 14. src/app/(main)/billing/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/billing

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/billing

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 15. src/app/(main)/briefs/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/briefs/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/briefs/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 16. src/app/(main)/briefs/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/briefs

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/briefs

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 17. src/app/(main)/budget-forecasting/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/budget-forecasting

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/budget-forecasting

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 18. src/app/(main)/case-analytics/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-analytics

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-analytics

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 19. src/app/(main)/case-calendar/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-calendar

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-calendar

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 20. src/app/(main)/case-financials/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-financials

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-financials

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 21. src/app/(main)/case-insights/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-insights

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-insights

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 22. src/app/(main)/case-intake/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-intake

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-intake

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 23. src/app/(main)/case-operations/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-operations

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-operations

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 24. src/app/(main)/case-overview/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/case-overview

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/case-overview

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 25. src/app/(main)/cases/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/cases/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/cases/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 26. src/app/(main)/cases/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/cases

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/cases

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

---

### 27. src/app/(main)/citations/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/citations/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/citations/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 28. src/app/(main)/citations/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/citations

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/citations

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 29. src/app/(main)/clauses/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/clauses/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/clauses/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 30. src/app/(main)/clauses/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/clauses

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/clauses

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 31. src/app/(main)/client-portal/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/client-portal

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/client-portal

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 32. src/app/(main)/clients/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/clients/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/clients/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 33. src/app/(main)/clients/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/clients

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/clients

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 34. src/app/(main)/collections-queue/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/collections-queue

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/collections-queue

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 35. src/app/(main)/compliance-alerts/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/compliance-alerts

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/compliance-alerts

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 36. src/app/(main)/compliance/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/compliance

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/compliance

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 37. src/app/(main)/conference-rooms/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conference-rooms/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conference-rooms/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 38. src/app/(main)/conference-rooms/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conference-rooms

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conference-rooms

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 39. src/app/(main)/conflict-alerts/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conflict-alerts

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conflict-alerts

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 40. src/app/(main)/conflict-waivers/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conflict-waivers/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conflict-waivers/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 41. src/app/(main)/conflict-waivers/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conflict-waivers

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conflict-waivers

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 42. src/app/(main)/conflicts/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conflicts/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conflicts/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 43. src/app/(main)/conflicts/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/conflicts

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/conflicts

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 44. src/app/(main)/contracts/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/contracts/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/contracts/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 45. src/app/(main)/contracts/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/contracts

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/contracts

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 46. src/app/(main)/correspondence/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/correspondence

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/correspondence

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 47. src/app/(main)/court-dates/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/court-dates

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/court-dates

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 48. src/app/(main)/court-reporters/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/court-reporters/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/court-reporters/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 49. src/app/(main)/court-reporters/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/court-reporters

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/court-reporters

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 50. src/app/(main)/crm/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/crm

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/crm

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 51. src/app/(main)/custodians/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/custodians/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/custodians/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 52. src/app/(main)/custodians/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/custodians

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/custodians

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 53. src/app/(main)/daf/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/daf

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/daf

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 54. src/app/(main)/database-control/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/database-control

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/database-control

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 55. src/app/(main)/deadlines/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/deadlines

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/deadlines

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 56. src/app/(main)/depositions/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/depositions/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/depositions/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 57. src/app/(main)/depositions/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/depositions

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/depositions

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 58. src/app/(main)/discovery/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/discovery/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/discovery/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 59. src/app/(main)/discovery/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/discovery

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/discovery

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 60. src/app/(main)/docket/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/docket/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/docket/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 61. src/app/(main)/docket/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/docket

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/docket

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 62. src/app/(main)/document-approvals/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/document-approvals

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/document-approvals

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 63. src/app/(main)/document-versions/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/document-versions

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/document-versions

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 64. src/app/(main)/documents/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/documents/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/documents/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 65. src/app/(main)/documents/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/documents

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/documents

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 66. src/app/(main)/drafting/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/drafting

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/drafting

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 67. src/app/(main)/engagement-letters/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/engagement-letters/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/engagement-letters/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 68. src/app/(main)/engagement-letters/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/engagement-letters

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/engagement-letters

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 69. src/app/(main)/entity-director/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/entity-director

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/entity-director

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 70. src/app/(main)/equipment/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/equipment/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/equipment/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 71. src/app/(main)/equipment/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/equipment

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/equipment

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 72. src/app/(main)/ethical-walls/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/ethical-walls/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/ethical-walls/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 73. src/app/(main)/ethical-walls/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/ethical-walls

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/ethical-walls

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 74. src/app/(main)/evidence/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/evidence/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/evidence/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 75. src/app/(main)/evidence/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/evidence

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/evidence

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 76. src/app/(main)/exhibits/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/exhibits/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/exhibits/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 77. src/app/(main)/exhibits/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/exhibits

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/exhibits

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 78. src/app/(main)/expenses/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/expenses/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/expenses/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 79. src/app/(main)/expenses/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/expenses

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/expenses

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 80. src/app/(main)/expert-witnesses/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/expert-witnesses/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/expert-witnesses/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 81. src/app/(main)/expert-witnesses/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/expert-witnesses

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/expert-witnesses

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 82. src/app/(main)/fee-agreements/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/fee-agreements/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/fee-agreements/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 83. src/app/(main)/fee-agreements/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/fee-agreements

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/fee-agreements

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 84. src/app/(main)/firm-operations/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/firm-operations

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/firm-operations

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 85. src/app/(main)/intake-forms/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/intake-forms/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/intake-forms/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 86. src/app/(main)/intake-forms/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/intake-forms

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/intake-forms

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 87. src/app/(main)/integrations/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/integrations

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/integrations

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 88. src/app/(main)/interrogatories/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/interrogatories/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/interrogatories/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 89. src/app/(main)/interrogatories/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/interrogatories

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/interrogatories

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 90. src/app/(main)/invoices/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/invoices/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/invoices/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 91. src/app/(main)/invoices/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/invoices

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/invoices

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 92. src/app/(main)/judgments/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/judgments/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/judgments/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 93. src/app/(main)/judgments/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/judgments

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/judgments

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 94. src/app/(main)/jurisdiction/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/jurisdiction

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/jurisdiction

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 95. src/app/(main)/jurisdictions/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/jurisdictions/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/jurisdictions/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 96. src/app/(main)/jury-selection/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/jury-selection/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/jury-selection/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 97. src/app/(main)/jury-selection/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/jury-selection

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/jury-selection

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 98. src/app/(main)/knowledge-base/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/knowledge-base

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/knowledge-base

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 99. src/app/(main)/legal-holds/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/legal-holds/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/legal-holds/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 100. src/app/(main)/legal-holds/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/legal-holds

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/legal-holds

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 101. src/app/(main)/litigation-strategy/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/litigation-strategy

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/litigation-strategy

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 102. src/app/(main)/matters/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/matters/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/matters/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 103. src/app/(main)/matters/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/matters

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/matters

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 104. src/app/(main)/mediation/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/mediation/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/mediation/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 105. src/app/(main)/mediation/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/mediation

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/mediation

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 106. src/app/(main)/messenger/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/messenger

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/messenger

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 107. src/app/(main)/motions/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/motions/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/motions/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 108. src/app/(main)/motions/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/motions

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/motions

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 109. src/app/(main)/notifications/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/notifications

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/notifications

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 110. src/app/(main)/organizations/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/organizations/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/organizations/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 111. src/app/(main)/organizations/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/organizations

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/organizations

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 112. src/app/(main)/parties/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/parties/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/parties/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 113. src/app/(main)/parties/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/parties

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/parties

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 114. src/app/(main)/payment-plans/[id]/page.tsx

**Total Issues:** 6

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/payment-plans/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/payment-plans/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 115. src/app/(main)/payment-plans/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/payment-plans

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/payment-plans

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 116. src/app/(main)/permissions/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/permissions

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/permissions

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 117. src/app/(main)/pleadings/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/pleadings/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/pleadings/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 118. src/app/(main)/pleadings/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/pleadings

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/pleadings

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 119. src/app/(main)/process-servers/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/process-servers/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/process-servers/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 120. src/app/(main)/process-servers/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/process-servers

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/process-servers

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 121. src/app/(main)/production-requests/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/production-requests/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/production-requests/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 122. src/app/(main)/production-requests/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/production-requests

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/production-requests

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 123. src/app/(main)/profile/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/profile

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/profile

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 124. src/app/(main)/rate-tables/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/rate-tables/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/rate-tables/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 125. src/app/(main)/rate-tables/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/rate-tables

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/rate-tables

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 126. src/app/(main)/reports/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/reports

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/reports

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 127. src/app/(main)/research/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/research/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/research/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

---

### 128. src/app/(main)/research/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/research

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/research

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

---

### 129. src/app/(main)/retainers/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/retainers/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/retainers/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 130. src/app/(main)/retainers/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/retainers

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/retainers

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 131. src/app/(main)/rules/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/rules

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/rules

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 132. src/app/(main)/settings/page.tsx

**Total Issues:** 2

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/settings

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/settings

---

### 133. src/app/(main)/settlements/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/settlements/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/settlements/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 134. src/app/(main)/settlements/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/settlements

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/settlements

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 135. src/app/(main)/statute-alerts/page.tsx

**Total Issues:** 6

#### 🔴 CRITICAL Issues:

- **Metadata API:** Missing metadata export or generateMetadata function
  - All pages should export metadata for SEO

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/statute-alerts

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/statute-alerts

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 136. src/app/(main)/statute-tracker/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/statute-tracker

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/statute-tracker

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 137. src/app/(main)/subpoenas/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/subpoenas/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/subpoenas/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 138. src/app/(main)/subpoenas/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/subpoenas

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/subpoenas

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 139. src/app/(main)/system-settings/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/system-settings

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/system-settings

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 140. src/app/(main)/tasks/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/tasks/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/tasks/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 141. src/app/(main)/tasks/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/tasks

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/tasks

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 142. src/app/(main)/templates/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/templates/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/templates/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 143. src/app/(main)/templates/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/templates

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/templates

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 144. src/app/(main)/time-entries/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/time-entries/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/time-entries/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 145. src/app/(main)/time-entries/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/time-entries

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/time-entries

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 146. src/app/(main)/timesheets/[id]/page.tsx

**Total Issues:** 7

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/timesheets/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

- **TypeScript:** Incorrect params typing
  - In Next.js 15+, params should be Promise<{ id: string }>

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/timesheets/[id]

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 147. src/app/(main)/timesheets/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/timesheets

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/timesheets

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 148. src/app/(main)/trial-exhibits/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/trial-exhibits/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/trial-exhibits/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 149. src/app/(main)/trial-exhibits/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/trial-exhibits

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/trial-exhibits

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 150. src/app/(main)/trust-accounting/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/trust-accounting/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/trust-accounting/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 151. src/app/(main)/trust-accounting/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/trust-accounting

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/trust-accounting

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 152. src/app/(main)/trust-ledger/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/trust-ledger

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/trust-ledger

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 153. src/app/(main)/users/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/users/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/users/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 154. src/app/(main)/users/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/users

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/users

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 155. src/app/(main)/vendors/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/vendors/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/vendors/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 156. src/app/(main)/vendors/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/vendors

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/vendors

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

- **Data Fetching:** Server component not marked as async
  - Server components with data fetching should be async

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 157. src/app/(main)/war-room/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/war-room/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/war-room/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 158. src/app/(main)/war-room/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/war-room

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/war-room

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 159. src/app/(main)/witnesses/[id]/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/witnesses/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/witnesses/[id]

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 160. src/app/(main)/witnesses/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/witnesses

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/witnesses

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 161. src/app/(main)/workflows/[id]/page.tsx

**Total Issues:** 5

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/workflows/[id]

- **Dynamic Routes:** Missing generateStaticParams
  - Dynamic routes should export generateStaticParams for SSG

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/workflows/[id]

#### 🔵 LOW Priority:

- **Performance:** Missing Suspense boundary
  - Async components should use Suspense for streaming

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 162. src/app/(main)/workflows/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/workflows

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/workflows

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 163. src/app/(main)/write-offs/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/(main)/write-offs

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/(main)/write-offs

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 164. src/app/dashboard/page.tsx

**Total Issues:** 4

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app/dashboard

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app/dashboard

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

#### 🔵 LOW Priority:

- **Performance:** No caching strategy
  - Data fetching should specify cache or revalidate options

---

### 165. src/app/page.tsx

**Total Issues:** 3

#### 🟠 HIGH Priority:

- **Error Boundaries:** Missing error.tsx
  - No error boundary at src/app

#### 🟡 MEDIUM Priority:

- **Loading States:** Missing loading.tsx
  - No loading state at src/app

- **TypeScript:** Missing TypeScript interfaces
  - No Props types defined

---


---


## Summary Statistics

```
Total Pages: 165
Pages with Issues: 165
Compliant Pages: 0
Compliance Rate: 0.0%

Issue Distribution:
  Critical: 1
  High:     230
  Medium:   298
  Low:      175
  Total:    704
```
