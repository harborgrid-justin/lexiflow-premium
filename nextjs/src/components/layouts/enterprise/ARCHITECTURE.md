# Enterprise Layouts Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      SidebarProvider                         │
│  (Manages sidebar state, keyboard shortcuts, mobile)        │
│                                                              │
│  ┌───────────────┐  ┌──────────────────────────────────┐   │
│  │               │  │       SidebarInset               │   │
│  │  SidebarNav   │  │  (Main content area)             │   │
│  │               │  │                                  │   │
│  │  ┌─────────┐  │  │  ┌────────────────────────────┐ │   │
│  │  │ Header  │  │  │  │  Header                     │ │   │
│  │  │ Logo    │  │  │  │  - SidebarTrigger          │ │   │
│  │  │ Brand   │  │  │  │  - Breadcrumbs             │ │   │
│  │  └─────────┘  │  │  │  - Search (Cmd+K)          │ │   │
│  │               │  │  │  - Notifications           │ │   │
│  │  ┌─────────┐  │  │  │  - User Menu               │ │   │
│  │  │Content  │  │  │  └────────────────────────────┘ │   │
│  │  │         │  │  │                                  │   │
│  │  │Nav      │  │  │  ┌────────────────────────────┐ │   │
│  │  │Groups   │  │  │  │  Main Content              │ │   │
│  │  │         │  │  │  │                            │ │   │
│  │  │Cases    │  │  │  │  ┌──────────────────────┐ │ │   │
│  │  │Research │  │  │  │  │  DashboardLayout     │ │ │   │
│  │  │Docs     │  │  │  │  │  or Custom Content   │ │ │   │
│  │  │Trial    │  │  │  │  └──────────────────────┘ │ │   │
│  │  │Ops      │  │  │  │                            │ │   │
│  │  │Analytics│  │  │  │                            │ │   │
│  │  │Admin    │  │  │  │                            │ │   │
│  │  └─────────┘  │  │  └────────────────────────────┘ │   │
│  │               │  │                                  │   │
│  │  ┌─────────┐  │  └──────────────────────────────────┘   │
│  │  │Footer   │  │                                         │
│  │  │User     │  │                                         │
│  │  │Profile  │  │                                         │
│  │  │Settings │  │                                         │
│  │  │Theme    │  │                                         │
│  │  │Logout   │  │                                         │
│  │  └─────────┘  │                                         │
│  └───────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

## DashboardLayout Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    DashboardLayout                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Metrics Grid (Responsive: 1→2→4 columns)             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │ Active   │ │ Billable │ │ Revenue  │ │ Pending  │ │ │
│  │  │ Matters  │ │ Hours    │ │ (MTD)    │ │ Deadlines│ │ │
│  │  │  142     │ │  1,247   │ │ $284,920 │ │   23     │ │ │
│  │  │  +8.2%   │ │  +5.4%   │ │  +12.3%  │ │  -3.1%   │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────┐  ┌──────────────────────────┐   │
│  │   Charts (4 cols)     │  │  Sidebar (3 cols)        │   │
│  │                       │  │                          │   │
│  │  ┌─────────────────┐  │  │  ┌────────────────────┐ │   │
│  │  │ Case            │  │  │  │ Quick Actions      │ │   │
│  │  │ Distribution    │  │  │  │ - New Matter       │ │   │
│  │  │                 │  │  │  │ - Upload Document  │ │   │
│  │  │ [Chart]         │  │  │  │ - Log Time Entry   │ │   │
│  │  └─────────────────┘  │  │  │ - Create Invoice   │ │   │
│  │                       │  │  └────────────────────┘ │   │
│  │  ┌─────────────────┐  │  │                          │   │
│  │  │ Revenue Trend   │  │  │  ┌────────────────────┐ │   │
│  │  │                 │  │  │  │ Recent Activity    │ │   │
│  │  │ [Chart]         │  │  │  │                    │ │   │
│  │  └─────────────────┘  │  │  │ • New matter filed │ │   │
│  │                       │  │  │ • Document upload  │ │   │
│  └───────────────────────┘  │  │ • Invoice approved │ │   │
│                              │  │ • Discovery due    │ │   │
│                              │  │ • Time entry log   │ │   │
│                              │  │                    │ │   │
│                              │  │ [View All Activity]│ │   │
│                              │  └────────────────────┘ │   │
│                              └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Navigation Hierarchy

```
SidebarNav Navigation Structure
│
├── 📊 Cases & Matters
│   ├── Matter Management
│   │   ├── All Matters
│   │   ├── Matter Intake (3)
│   │   ├── Conflict Checking
│   │   └── Engagement Letters
│   ├── Case Strategy
│   └── Matter Workflows
│
├── 🔍 Discovery & Research
│   ├── Legal Research
│   │   ├── Case Law Research
│   │   ├── Statutory Research
│   │   ├── Citation Management
│   │   └── Knowledge Base
│   ├── Discovery Center (8)
│   │   ├── Discovery Dashboard
│   │   ├── Interrogatories
│   │   ├── Depositions (2)
│   │   ├── Subpoenas
│   │   └── Production Requests
│   └── Evidence Vault
│       ├── Evidence Dashboard
│       ├── Custodians
│       ├── Legal Holds
│       └── Exhibit Manager
│
├── 📄 Documents & Drafting
│   ├── Document Manager (24)
│   │   ├── All Documents
│   │   ├── Version Control
│   │   ├── Approvals (5)
│   │   └── Templates
│   ├── Document Assembly
│   │   ├── Drafting Studio
│   │   ├── Pleading Builder
│   │   └── Clause Library
│   └── Motions & Briefs
│       ├── All Motions
│       ├── Briefs
│       └── Court Dates
│
├── ⚖️ Litigation & Trial
│   ├── War Room
│   ├── Witnesses
│   │   ├── Fact Witnesses
│   │   └── Expert Witnesses
│   ├── Trial Preparation
│   │   ├── Trial Exhibits
│   │   └── Jury Selection
│   └── ADR & Settlements
│       ├── Mediation
│       ├── Arbitration
│       └── Settlements
│
├── 💼 Operations
│   ├── Billing & Finance
│   │   ├── Billing Dashboard
│   │   ├── Time Entries
│   │   ├── Invoices (7)
│   │   ├── Expenses
│   │   ├── Retainers
│   │   └── Trust Accounting
│   ├── Client Relations
│   │   ├── Clients
│   │   ├── Organizations
│   │   └── Parties
│   └── Compliance & Risk
│       ├── Compliance Dashboard
│       ├── Conflicts
│       └── Ethical Walls
│
├── 📈 Analytics & Reports
│   └── Analytics Dashboard
│       ├── Case Analytics
│       ├── Financial Reports
│       └── Reports
│
└── ⚙️ Administration
    ├── Integrations
    └── Settings
```

## Data Flow

### 1. User Authentication Flow
```
Login → Auth Provider → User Object → AppShell → SidebarNav Footer
                                    ↓
                              Header User Menu
```

### 2. Navigation Flow
```
User Click → SidebarNav Link → Next.js Router → New Page
                                              ↓
                                    AppShell with new breadcrumbs
                                              ↓
                                        Page Content
```

### 3. Command Palette Flow (Cmd+K)
```
Cmd+K Pressed → CommandDialog Opens → User Types → Filter Results
                                                  ↓
                              User Selects → Navigate to Route
```

### 4. Notification Flow
```
Notification Event → Backend → WebSocket/Polling → Notifications Array
                                                  ↓
                                    Header Bell Icon (Badge Count)
                                                  ↓
                              User Clicks → Dropdown Menu → Notification List
```

### 5. Theme Toggle Flow
```
User Clicks Theme Toggle → onThemeToggle Handler → Update Theme State
                                                  ↓
                                        Update CSS Variables
                                                  ↓
                                  Update localStorage/Cookie
```

## State Management

### Sidebar State
- **Location**: SidebarProvider context
- **Persistence**: Cookie (`sidebar:state`)
- **Controls**: Cmd+B keyboard shortcut, SidebarTrigger button, Rail click
- **Mobile**: Separate state for mobile overlay

### Active Navigation State
- **Location**: usePathname() hook
- **Detection**: pathname.startsWith() for active highlighting
- **Updates**: Automatic on route change

### Collapsible Groups State
- **Location**: Local state in SidebarNav
- **Storage**: `openGroups` object keyed by item title
- **Default**: Auto-expand if current route is within group

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | - Single column metrics<br>- Hamburger menu<br>- Sidebar overlay<br>- Stacked sections |
| Tablet | ≥ 768px | - Two column metrics<br>- Visible sidebar<br>- Side-by-side charts |
| Desktop | ≥ 1024px | - Four column metrics<br>- Full sidebar always visible<br>- 7-column chart grid (4+3) |

## Performance Optimizations

### Code Splitting
```tsx
// Lazy load chart components
const CaseDistributionChart = lazy(() => import('./charts/CaseDistribution'))

// Use Suspense for loading states
<Suspense fallback={<ChartSkeleton />}>
  <CaseDistributionChart />
</Suspense>
```

### Memoization
```tsx
// Memoize expensive navigation calculations
const navigationItems = useMemo(() =>
  buildNavigationFromConfig(userPermissions),
  [userPermissions]
)

// Memoize metric cards
const metricCards = useMemo(() =>
  metrics.map(m => <MetricCard key={m.title} metric={m} />),
  [metrics]
)
```

### Virtual Scrolling
```tsx
// For long activity feeds
<ScrollArea className="h-[400px]">
  <VirtualList
    items={activities}
    itemHeight={80}
    renderItem={(activity) => <ActivityItem activity={activity} />}
  />
</ScrollArea>
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dialogs, dropdowns, command palette
- **Arrow Keys**: Navigate within menus and dropdowns
- **Cmd+K / Ctrl+K**: Open command palette
- **Cmd+B / Ctrl+B**: Toggle sidebar

### Screen Reader Support
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA labels on icon-only buttons
- ARIA landmarks (header, main, nav)
- Hidden decorative icons (aria-hidden="true")
- Live region announcements for notifications

### Focus Management
- Visible focus indicators (ring-2 ring-offset-2)
- Focus trap in modals and dialogs
- Focus restoration after closing modals
- Skip to main content link

## Integration Points

### Authentication
```tsx
// Pass user object from auth provider
const { user } = useAuth()

<AppShell user={user} onLogout={handleLogout} />
```

### Theme System
```tsx
// Connect to theme provider
const { theme, toggleTheme } = useTheme()

<AppShell theme={theme} onThemeToggle={toggleTheme} />
```

### Notifications
```tsx
// Real-time notifications
const { notifications } = useNotifications()

<AppShell notifications={notifications} />
```

### Analytics
```tsx
// Track page views and interactions
useEffect(() => {
  analytics.pageView(pathname)
}, [pathname])
```

## File Structure

```
components/layouts/enterprise/
├── app-shell.tsx           # Main app layout (376 lines)
├── sidebar-nav.tsx         # Navigation sidebar (556 lines)
├── dashboard-layout.tsx    # Dashboard layout (509 lines)
├── index.ts                # Exports
├── README.md               # Documentation
├── EXAMPLES.md             # Usage examples
└── ARCHITECTURE.md         # This file
```

## Dependencies

### Required Packages
- `@radix-ui/react-*` - UI primitives
- `lucide-react` - Icon library
- `next` - Next.js framework
- `react` - React library
- `class-variance-authority` - Variant utilities
- `cmdk` - Command palette

### Required shadcn/ui Components
- sidebar, button, badge, card, breadcrumb
- dropdown-menu, command, avatar, collapsible
- scroll-area, separator, dialog, sheet

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Features**: CSS Grid, Flexbox, CSS Variables, Modern JavaScript

## License

Proprietary - LexiFlow Premium Legal Practice Management System
