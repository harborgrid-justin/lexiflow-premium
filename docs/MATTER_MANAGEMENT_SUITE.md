# Matter Management - Enterprise Suite

## Overview
Comprehensive enterprise-grade matter management system with full lifecycle support from intake to closure. Built with React + NestJS, fully integrated with PostgreSQL backend.

## 📋 Components

### 1. Matter Overview Dashboard
**Path:** `components/matters/overview/MatterOverviewDashboard.tsx`

**Features:**
- Real-time KPI metrics (active matters, intake pipeline, deadlines, at-risk matters)
- Matter status distribution with drill-down
- Intake pipeline visualization with stage metrics and conversion rates
- Resource allocation and team utilization tracking
- Recent activity feed with smart prioritization
- Quick action menu for common operations
- Advanced search and filtering

**API Endpoints:**
- `GET /matters/kpis` - KPI metrics
- `GET /matters/pipeline` - Intake pipeline stages
- `GET /matters` - All matters with filters

**Usage:**
```typescript
import { MatterOverviewDashboard } from '@/components/matters';

<MatterOverviewDashboard />
```

---

### 2. Matter Calendar
**Path:** `components/matters/calendar/MatterCalendar.tsx`

**Features:**
- Multi-view calendar (month, week, day, agenda)
- Matter deadlines, court dates, and hearings
- Team availability and conflict detection
- Drag-and-drop scheduling (future enhancement)
- Color-coded event categorization
- Event reminders and notifications
- Export to external calendars (iCal, Google, Outlook)

**API Endpoints:**
- `GET /matters/calendar/events` - Calendar events with date filtering

**Usage:**
```typescript
import { MatterCalendar } from '@/components/matters';

<MatterCalendar />
```

---

### 3. Matter Analytics Dashboard
**Path:** `components/matters/analytics/MatterAnalyticsDashboard.tsx`

**Features:**
- Matter performance metrics
- Financial performance tracking
- Team utilization analytics
- Practice area breakdown
- Trend analysis and forecasting
- Time-to-resolution metrics
- Revenue forecasting
- Custom report generation

**API Endpoints:**
- `GET /matters/analytics/revenue` - Revenue analytics
- `GET /matters/kpis` - Performance KPIs

**Usage:**
```typescript
import { MatterAnalyticsDashboard } from '@/components/matters';

<MatterAnalyticsDashboard />
```

---

### 4. New Matter Intake Form
**Path:** `components/matters/intake/NewMatterIntakeForm.tsx`

**Features:**
- Multi-step wizard interface
- Client information capture
- Automated conflict checking
- Budget and fee agreement setup
- Team assignment
- Risk assessment
- Compliance verification
- Engagement letter generation (future)

**Steps:**
1. Client Information
2. Matter Details
3. Conflict Check (automated)
4. Team Assignment
5. Financial Setup
6. Review & Submit

**API Endpoints:**
- `POST /matters` - Create new matter
- `POST /compliance/conflict-checks` - Run conflict check

**Usage:**
```typescript
import { NewMatterIntakeForm } from '@/components/matters';

<NewMatterIntakeForm />
```

---

### 5. Matter Operations Center
**Path:** `components/matters/operations/MatterOperationsCenter.tsx`

**Features:**
- Task management and assignment
- Team collaboration tools
- Document workflow tracking
- Deadline monitoring
- Resource allocation
- Activity timeline
- Communication hub
- Multiple view modes (list, kanban, calendar)

**API Endpoints:**
- `GET /matters/tasks` - Matter tasks (future endpoint)
- `GET /matters/activity` - Activity feed (future endpoint)

**Usage:**
```typescript
import { MatterOperationsCenter } from '@/components/matters';

<MatterOperationsCenter />
```

---

### 6. Matter Insights Dashboard
**Path:** `components/matters/insights/MatterInsightsDashboard.tsx`

**Features:**
- AI-powered risk assessment
- Outcome predictions
- Budget variance analysis
- Team performance metrics
- Client satisfaction tracking
- Predictive cost modeling
- Success probability analysis
- Resource optimization recommendations

**API Endpoints:**
- `GET /matters/insights/risk` - Risk assessment data
- `GET /matters/financials/overview` - Budget variance

**Usage:**
```typescript
import { MatterInsightsDashboard } from '@/components/matters';

<MatterInsightsDashboard />
```

---

### 7. Matter Financials Center
**Path:** `components/matters/financials/MatterFinancialsCenter.tsx`

**Features:**
- Billing overview and analytics
- Budget tracking and forecasting
- Expense management
- Time entry overview
- Profitability analysis
- Realization rates
- Collection tracking
- Invoice generation
- Trust accounting

**API Endpoints:**
- `GET /matters/financials/overview` - Financial overview
- `GET /matters/analytics/revenue` - Revenue data
- `GET /billing/invoices` - Recent invoices (from billing module)

**Usage:**
```typescript
import { MatterFinancialsCenter } from '@/components/matters';

<MatterFinancialsCenter />
```

---

## 🔧 Backend API Enhancements

### New Endpoints Added to `/backend/src/matters/`

#### Controller (`matters.controller.ts`)
```typescript
GET /matters/kpis?dateRange=30d
GET /matters/pipeline?dateRange=30d
GET /matters/calendar/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&matterIds=id1,id2
GET /matters/analytics/revenue?dateRange=30d
GET /matters/insights/risk?matterIds=id1,id2
GET /matters/financials/overview?dateRange=30d
```

#### Service (`matters.service.ts`)
- `getKPIs(dateRange)` - Calculate matter KPIs
- `getPipeline(dateRange)` - Intake pipeline analytics
- `getCalendarEvents(startDate, endDate, matterIds)` - Calendar event data
- `getRevenueAnalytics(dateRange)` - Revenue metrics
- `getRiskInsights(matterIds)` - Risk assessment
- `getFinancialOverview(dateRange)` - Financial summary

---

## 🎨 Design System Integration

All components use:
- **Theme Context** for dark/light mode
- **Tailwind CSS** utility classes with semantic tokens
- **Common Components**:
  - `Button` - Action buttons with variants
  - `Card` - Container component
  - `Badge` - Status indicators
  - `Modal` - Dialog overlays
  - `ErrorState` - Error handling
  - `EmptyState` - No data states

**Color Palette:**
- Primary: Blue (#3B82F6)
- Success: Emerald (#10B981)
- Warning: Amber (#F59E0B)
- Error: Rose (#EF4444)
- Accent: Purple (#8B5CF6)

---

## 📊 Data Flow

```
Frontend Component
    ↓
React Query Hook (useQuery)
    ↓
API Service (api.matters.*)
    ↓
Backend REST API (/matters/*)
    ↓
NestJS Service (MattersService)
    ↓
TypeORM Repository
    ↓
PostgreSQL Database
```

---

## 🔑 Key Features

### Enterprise-Grade
- ✅ Full CRUD operations
- ✅ Real-time updates via React Query
- ✅ Optimistic UI updates
- ✅ Error handling and retry logic
- ✅ Caching and invalidation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility (WCAG 2.1 AA compliant)
- ✅ TypeScript type safety

### Security
- ✅ Backend API authentication
- ✅ Input validation (class-validator)
- ✅ XSS prevention
- ✅ SQL injection protection (TypeORM)
- ✅ Role-based access control (future)

### Performance
- ✅ Code splitting with lazy loading
- ✅ Query caching and deduplication
- ✅ Pagination support
- ✅ Efficient re-renders (React.memo)
- ✅ Debounced search

---

## 🚀 Getting Started

### Import Components
```typescript
// Import individual components
import { 
  MatterOverviewDashboard,
  MatterCalendar,
  MatterAnalyticsDashboard,
  NewMatterIntakeForm,
  MatterOperationsCenter,
  MatterInsightsDashboard,
  MatterFinancialsCenter
} from '@/components/matters';

// Or use module paths
import { MatterOverviewDashboard } from '@/components/matters/overview';
```

### API Usage
```typescript
import { api } from '@/services/api';

// Get all matters
const matters = await api.matters.getAll();

// Get KPIs
const kpis = await api.matters.getKPIs('30d');

// Get calendar events
const events = await api.matters.getCalendarEvents('2025-01-01', '2025-01-31');

// Create new matter
const newMatter = await api.matters.create({
  title: 'Smith v. Acme Corp',
  clientName: 'John Smith',
  status: 'INTAKE',
  matterType: 'LITIGATION',
  ...
});
```

### React Query Hooks
```typescript
import { useQuery, queryClient } from '@/hooks/useQueryHooks';

// Fetch matters with caching
const { data: matters, isLoading, error } = useQuery({
  queryKey: ['matters', 'all'],
  queryFn: () => api.matters.getAll(),
});

// Invalidate cache after mutation
queryClient.invalidate(['matters']);
```

---

## 📝 Configuration

### Backend Configuration
- **Database:** PostgreSQL (configured in `backend/src/database/data-source.ts`)
- **Port:** 3000 (default NestJS port)
- **CORS:** Enabled for frontend (http://localhost:5173)

### Frontend Configuration
- **Backend URL:** Configured in `services/integration/apiConfig.ts`
- **API Mode:** Backend-first (IndexedDB deprecated)
- **Theme:** Dark/Light mode support via ThemeContext

---

## 🧪 Testing (Future Enhancement)

### Unit Tests
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### E2E Tests
```bash
# Backend E2E
cd backend
npm run test:e2e

# Frontend Cypress (future)
cd frontend
npm run cypress
```

---

## 🔄 Migration from Legacy

If migrating from IndexedDB to backend API:

1. **Data Export:** Export matters from IndexedDB
2. **Backend Import:** Use bulk import endpoint (future)
3. **Verification:** Compare counts and validate data integrity
4. **Switch Mode:** Remove `localStorage.VITE_USE_INDEXEDDB`

---

## 📚 Additional Resources

- **API Documentation:** `/api/docs` (Swagger)
- **Type Definitions:** `frontend/types/case.ts` and `frontend/types/primitives.ts`
- **Backend Entity:** `backend/src/matters/entities/matter.entity.ts`
- **Frontend API Service:** `frontend/services/api/matters-api.ts`

---

## 🤝 Contributing

When adding new features:
1. Add backend endpoint to `matters.controller.ts`
2. Implement service method in `matters.service.ts`
3. Add API method to `matters-api.ts`
4. Create/update React component
5. Add React Query hook integration
6. Update this README

---

## 📄 License

Copyright © 2025 LexiFlow Legal Suite. All rights reserved.
