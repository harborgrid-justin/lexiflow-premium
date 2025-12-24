# LexiFlow Platform Page Hierarchy

**Enterprise Legal Operating System - Complete Site Map**  
*Last Updated: December 23, 2025*

---

## Platform Overview

LexiFlow is an enterprise legal OS combining Case Management, Discovery, Legal Research, and Firm Operations into a unified platform. The system uses a backend-first architecture with PostgreSQL + NestJS backend as the primary data layer.

---

## Complete Page Hierarchy

### MAIN - Core Application Functions

```
├─ Dashboard (`/dashboard`)
│  └─ Executive overview with key metrics, recent activity, and quick actions
│
├─ Master Calendar (`/calendar`)
│  └─ Firm-wide calendar with deadlines, hearings, and events
│
└─ Secure Messenger (`/messages`)
   └─ Internal encrypted messaging system for team collaboration
```

---

### CASE WORK - Matter Management & Documents

```
├─ Matter Management (`/matters/overview`)
│  ├─ Matter Management (Overview Dashboard) (`/matters/overview`)
│  ├─ Operations Center (`/matters/operations`)
│  ├─ Insights & Risk (`/matters/insights`)
│  ├─ Matter Calendar (`/matters/calendar-view`)
│  ├─ Analytics (`/matters/analytics`)
│  ├─ Financials (`/matters/financials`)
│  └─ New Matter Intake (`/matters/intake`)
│
├─ Docket & Filings (`/docket`)
│  └─ Court filing management, docket tracking, and e-filing integration
│
├─ Document Manager (`/documents`)
│  └─ Central document repository with version control and OCR
│
├─ Correspondence (`/correspondence`)
│  └─ Email and letter management with matter association
│
├─ Pleading Builder (`/pleading_builder`)
│  └─ AI-powered legal document drafting with Bluebook citation formatting
│
├─ Litigation Strategy (`/litigation_builder`)
│  └─ Strategic planning tool for litigation cases
│
└─ Case Workflows (`/workflows`)
   └─ Automated workflow templates and task management
```

---

### LITIGATION TOOLS - Discovery, Evidence & Trial Prep

```
├─ Research (`/research`)
│  └─ Legal research with AI-powered case law analysis via Google Gemini
│
├─ Citations (`/citations`)
│  └─ Bluebook citation management and validation
│
├─ War Room (`/war_room`)
│  └─ Trial preparation command center with timeline builder
│
├─ Discovery Center (`/discovery`)
│  └─ Document review, production tracking, and privilege logging
│
├─ Evidence Vault (`/evidence`)
│  └─ Secure evidence management with chain of custody
│
└─ Exhibit Pro (`/exhibits`)
   └─ Trial exhibit preparation and management system
```

---

### OPERATIONS - Firm Management & Business

```
├─ Data Platform (`/data_platform`)
│  └─ Admin database control and data management interface
│
├─ Entity Director (`/entities`)
│  └─ Party, organization, and relationship management
│
├─ Firm Operations (`/practice`)
│  └─ HR, resources, and internal operations management
│
├─ Billing & Finance (`/billing`)
│  └─ Time tracking, billing, invoicing, and financial reporting
│
├─ Client CRM (`/crm`)
│  └─ Client relationship management and business development
│
└─ Analytics (`/analytics`)
   └─ Business intelligence and performance dashboards
```

---

### KNOWLEDGE - Reference & Templates

```
├─ Knowledge Base (`/library`)
│  └─ Internal knowledge repository and best practices library
│
├─ Clause Library (`/clauses`)
│  └─ Reusable contract clauses and legal language templates
│
├─ Jurisdictions (`/jurisdiction`)
│  └─ Court rules, procedures, and jurisdiction-specific guidance
│
└─ Rules Engine (`/rules_engine`)
   └─ Court rules database with automated compliance checking
```

---

### ADMIN - System Administration (Admin-Only)

```
├─ Compliance (`/compliance`)
│  └─ Ethics, conflicts of interest, and regulatory compliance tracking
│
└─ Admin Console (`/admin`)
   └─ System administration, user management, and configuration
      ├─ User Management
      ├─ Role & Permissions
      ├─ System Settings
      ├─ Integration Configuration
      └─ Audit Logs
```

---

## User Profiles & Settings

```
└─ User Profile (`/profile`)
   ├─ Personal Information
   ├─ Security Settings
   ├─ Notification Preferences
   ├─ Display Settings (Theme)
   └─ API Keys & Integrations
```

---

## Routing Architecture

### Module Registration Pattern
All pages are registered as lazy-loaded modules in `config/modules.tsx`:

```typescript
const Dashboard = lazyWithPreload(() => import('../components/dashboard/Dashboard'));
const MatterModule = lazyWithPreload(() => import('@features/matters/components/list/MatterModule'));
// ... etc
```

### Navigation System
- **Config**: `config/nav.config.ts` - Navigation items with icons and categories
- **Paths**: `config/paths.config.ts` - Centralized route path constants
- **Registry**: `services/infrastructure/moduleRegistry.ts` - Dynamic module loading

### Holographic Routing
Custom routing system supports:
- Minimizable windows
- Floating dock metaphor
- Multi-window workflows
- Persistent window state

---

## Page Categories Summary

| Category | Pages | Purpose |
|----------|-------|---------|
| **Main** | 3 | Core daily workflows |
| **Case Work** | 14+ | Matter and document management |
| **Litigation Tools** | 6 | Discovery and trial preparation |
| **Operations** | 6 | Business and firm management |
| **Knowledge** | 4 | Reference materials and templates |
| **Admin** | 2 | System administration (restricted) |

**Total Pages**: 35+ distinct views

---

## Access Control

### Permission Levels
- **All Users**: Main, Case Work, Litigation Tools, Operations, Knowledge
- **Administrator**: All areas including Admin Console
- **Senior Partner**: All areas including Compliance

### Hidden Routes
Some routes are not directly accessible via sidebar:
- `/matters/create` - Matter creation form (accessed via actions)
- Individual matter detail views
- Document editor views
- Report generation pages

---

## Design System

### Layout Components
- `Sidebar.tsx` - Main navigation sidebar
- `TopBar.tsx` - Header with search and user menu
- `TabbedPageLayout.tsx` - Tabbed interface pattern
- `ManagerLayout.tsx` - List/detail view pattern

### Theme System
- Light/Dark mode support via `ThemeContext`
- Semantic color tokens in `theme/tokens.ts`
- Tailwind CSS utility-first approach

---

## Navigation Patterns

### Primary Navigation
1. **Sidebar Navigation** - Category-based with expandable submenus
2. **Breadcrumbs** - Hierarchical location tracking
3. **Quick Actions** - Context-sensitive action buttons
4. **Global Search** - Cross-module entity search

### Prefetching Strategy
Hover-based prefetching (`useHoverIntent`) with:
- 350ms hover threshold
- Component code preloading
- Data prefetching via React Query
- Background scheduling to prevent UI blocking

---

## Responsive Behavior

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column layouts
- Holographic windows

### Tablet (768px - 1023px)
- Collapsible sidebar
- Optimized two-column layouts
- Touch-friendly controls

### Mobile (< 768px)
- Hidden sidebar with hamburger menu
- Single-column stack layouts
- Bottom navigation alternative

---

## Integration Points

### Frontend ↔ Backend
- **API Layer**: `services/api/index.ts` - 90+ domain services
- **Data Service**: `services/dataService.ts` - Unified data access facade
- **Backend Mode**: Default PostgreSQL/NestJS (configurable via localStorage)

### External APIs
- **Google Gemini**: Legal research and AI analysis (`services/geminiService.ts`)
- **Court E-Filing**: PACER and state-specific e-filing integrations (planned)
- **Document OCR**: Tesseract.js for document text extraction

---

## Analytics & Tracking

### User Activity
- Page views and navigation patterns
- Feature usage metrics
- Performance monitoring
- Error tracking via `ErrorBoundary`

### Business Metrics
- Matter volume and status
- Document processing throughput
- Billing and time tracking
- User productivity scores

---

## Development Notes

### Adding New Pages
1. Create component in `components/[domain]/`
2. Add lazy import in `config/modules.tsx`
3. Define path constant in `config/paths.config.ts`
4. Add navigation item in `config/nav.config.ts`
5. Register in `ModuleRegistry`

### Module Conventions
- Domain-based folder structure
- Lazy loading with preload capability
- Consistent naming: `[Feature]Module.tsx`
- Type exports via root `types.ts`

---

## Additional Documentation

- **Backend API**: `docs/BACKEND_API_ENDPOINTS_INVENTORY.md`
- **Frontend Integration**: `docs/BACKEND_FRONTEND_INTEGRATION_COMPLETE.md`
- **Component Guidelines**: `docs/COMPONENT_TEMPLATE.tsx`
- **API Reference**: `docs/API_QUICK_REFERENCE.md`

---

## Platform Status

**Status**: Production Ready (Backend-First Architecture)  
**Last Major Update**: Backend Migration Complete (December 18, 2025)  
**Documentation Version**: 1.0.0
