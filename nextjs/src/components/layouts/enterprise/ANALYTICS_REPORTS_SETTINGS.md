# Analytics, Reports, Settings & Calendar Layouts

Production-ready page layouts for analytics, reports, settings, and legal calendar features using shadcn/ui components.

## Overview

These four specialized layouts provide enterprise-grade solutions for:
- **Analytics**: Dashboard with KPIs, charts, date range filtering, comparison mode
- **Reports**: Report builder/viewer with parameters, export, scheduling
- **Settings**: Settings pages with sidebar navigation, unsaved changes detection
- **Calendar**: Legal calendar with statute alerts, event types, court rules integration

## 1. Analytics Layout

Dashboard layout for displaying metrics and charts with advanced filtering and export capabilities.

### Features

✅ **Date Range Selection**
- Preset ranges: Today, Week, Month, Quarter, Year
- Custom date range picker with dual calendar
- Date range display with badges

✅ **KPI Metrics**
- 4-column responsive grid (2 on tablet, 1 on mobile)
- Trend indicators (up/down/neutral) with icons
- Automatic value formatting (currency, percentage, number, duration)
- Previous period comparison
- Icon support for visual identification
- Hover effects and transitions

✅ **Charts**
- Flexible grid layouts (full, half, third, quarter width)
- Recharts integration ready
- Drill-down modal for detailed view
- Configurable height per chart
- Legend toggle support
- Comparison mode overlay

✅ **Comparison Mode**
- Period-over-period toggle
- Previous period data overlay
- Visual indicators for changes

✅ **Export**
- PDF export
- PNG export
- Loading state during export

### Usage Example

```tsx
import { AnalyticsLayout, MetricData, ChartConfig } from "@/components/layouts/enterprise";
import { DollarSign, Users, FileText, Clock } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Chart component example
const RevenueChart = ({ data, showLegend, comparisonMode }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      {showLegend && <Legend />}
      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
      {comparisonMode && (
        <Line type="monotone" dataKey="previousRevenue" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
      )}
    </LineChart>
  </ResponsiveContainer>
);

function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [comparisonMode, setComparisonMode] = useState(false);

  const metrics: MetricData[] = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: 125000,
      previousValue: 110000,
      format: "currency",
      trend: "up",
      trendValue: "+13.6%",
      icon: <DollarSign className="h-4 w-4" />,
      description: "Monthly recurring revenue",
    },
    {
      id: "clients",
      label: "Active Clients",
      value: 245,
      previousValue: 230,
      format: "number",
      trend: "up",
      trendValue: "+6.5%",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "cases",
      label: "Active Cases",
      value: 89,
      previousValue: 92,
      format: "number",
      trend: "down",
      trendValue: "-3.3%",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: "billable-hours",
      label: "Billable Hours",
      value: 1245,
      previousValue: 1180,
      format: "duration",
      trend: "up",
      trendValue: "+5.5%",
      icon: <Clock className="h-4 w-4" />,
      description: "This month",
    },
  ];

  const charts: ChartConfig[] = [
    {
      id: "revenue-trend",
      title: "Revenue Trend",
      description: "Monthly revenue over the past 12 months",
      type: "line",
      layout: "full",
      data: monthlyRevenueData,
      showLegend: true,
      height: 400,
      component: RevenueChart,
    },
    {
      id: "cases-by-type",
      title: "Cases by Practice Area",
      type: "pie",
      layout: "half",
      data: casesByTypeData,
      height: 300,
      component: CasesChart,
    },
    {
      id: "billable-hours",
      title: "Billable Hours by Attorney",
      type: "bar",
      layout: "half",
      data: billableHoursData,
      height: 300,
      component: BillableHoursChart,
    },
  ];

  const handleExport = async (format: "pdf" | "png") => {
    // Implementation for exporting dashboard
    console.log(`Exporting dashboard as ${format}`);
  };

  return (
    <AnalyticsLayout
      metrics={metrics}
      charts={charts}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      comparisonMode={comparisonMode}
      onComparisonModeChange={setComparisonMode}
      onExport={handleExport}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `metrics` | `MetricData[]` | ✅ | Array of KPI metrics to display |
| `charts` | `ChartConfig[]` | ✅ | Array of chart configurations |
| `dateRange` | `DateRange` | ✅ | Current date range selection |
| `onDateRangeChange` | `(range: DateRange) => void` | ✅ | Handler for date range changes |
| `comparisonMode` | `boolean` | ❌ | Enable period comparison (default: false) |
| `onComparisonModeChange` | `(enabled: boolean) => void` | ❌ | Handler for comparison mode toggle |
| `onExport` | `(format: "pdf" \| "png") => void` | ❌ | Handler for export actions |
| `isExporting` | `boolean` | ❌ | Export loading state |
| `className` | `string` | ❌ | Additional CSS classes |

### Types

```typescript
interface MetricData {
  id: string;
  label: string;
  value: string | number;
  previousValue?: string | number;
  format?: "number" | "currency" | "percentage" | "duration";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: "line" | "bar" | "area" | "pie" | "donut" | "radar";
  data: any[];
  layout?: "full" | "half" | "third" | "quarter";
  showLegend?: boolean;
  height?: number;
  component: React.ComponentType<any>;
}

interface DateRange {
  from: Date;
  to: Date;
}
```

---

## 2. Report Layout

Professional report builder/viewer with parameter panel, export options, and scheduling capabilities.

### Features

✅ **Report Header**
- Title, description, and status badge
- Last run timestamp
- Next scheduled run information
- Generated by attribution

✅ **Parameter Panel**
- Collapsible sidebar (toggleable)
- Support for multiple input types:
  - Text inputs
  - Number inputs
  - Date pickers
  - Select dropdowns
  - Multi-select
  - Date ranges
- Required field indicators
- Field descriptions

✅ **Report Sections**
- Flexible section types:
  - Text content
  - Tables
  - Charts
  - Metrics
  - Dividers
- Configurable layouts (full, half, third)
- Section titles and descriptions

✅ **Export & Print**
- PDF export
- Excel export
- CSV export
- Print-optimized styles
- Browser print functionality

✅ **Scheduling**
- Frequency options: Once, Daily, Weekly, Monthly
- Time selection
- Day of week/month selection
- Email recipients configuration

✅ **Templates**
- Save report configuration as template
- Template name and description
- Reusable report definitions

### Usage Example

```tsx
import { ReportLayout, ReportData, ReportParameter } from "@/components/layouts/enterprise";
import { DataTable } from "@/components/ui/shadcn/data-table";

function BillingReport() {
  const [parameters, setParameters] = useState<ReportParameter[]>([
    {
      id: "startDate",
      label: "Start Date",
      type: "date",
      value: "2024-01-01",
      required: true,
      description: "Beginning of reporting period",
    },
    {
      id: "endDate",
      label: "End Date",
      type: "date",
      value: "2024-01-31",
      required: true,
      description: "End of reporting period",
    },
    {
      id: "practiceArea",
      label: "Practice Area",
      type: "select",
      value: "all",
      options: [
        { label: "All Areas", value: "all" },
        { label: "Litigation", value: "litigation" },
        { label: "Corporate", value: "corporate" },
        { label: "Real Estate", value: "real-estate" },
        { label: "Family Law", value: "family-law" },
      ],
    },
    {
      id: "attorney",
      label: "Attorney",
      type: "select",
      value: "all",
      options: [
        { label: "All Attorneys", value: "all" },
        { label: "John Smith", value: "john-smith" },
        { label: "Jane Doe", value: "jane-doe" },
      ],
    },
  ]);

  const reportData: ReportData = {
    metadata: {
      title: "Monthly Billing Report",
      description: "Detailed breakdown of billable hours and revenue by attorney and practice area",
      lastRun: new Date("2024-01-31T09:00:00"),
      nextScheduled: new Date("2024-02-28T09:00:00"),
      generatedBy: "John Smith",
      status: "published",
    },
    sections: [
      {
        id: "summary",
        title: "Executive Summary",
        type: "text",
        content: (
          <div className="space-y-2">
            <p>Total billable hours: <strong>1,245</strong></p>
            <p>Total revenue: <strong>$312,500</strong></p>
            <p>Average hourly rate: <strong>$251</strong></p>
          </div>
        ),
      },
      {
        id: "divider-1",
        type: "divider",
        content: null,
      },
      {
        id: "revenue-table",
        title: "Revenue by Attorney",
        type: "table",
        content: <DataTable data={revenueData} columns={revenueColumns} />,
      },
      {
        id: "hours-chart",
        title: "Billable Hours Trend",
        type: "chart",
        layout: "full",
        content: <BillableHoursChart data={chartData} />,
      },
    ],
  };

  const handleParameterChange = (parameterId: string, value: any) => {
    setParameters(prev =>
      prev.map(p => p.id === parameterId ? { ...p, value } : p)
    );
  };

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting report as ${format}`);
    // Implementation
  };

  const handleSchedule = async (schedule: ScheduleConfig) => {
    console.log("Scheduling report:", schedule);
    // Implementation
  };

  const handleSave = async (name: string, description?: string) => {
    console.log("Saving template:", name, description);
    // Implementation
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ReportLayout
      reportData={reportData}
      parameters={parameters}
      onParameterChange={handleParameterChange}
      onExport={handleExport}
      onSchedule={handleSchedule}
      onSave={handleSave}
      onPrint={handlePrint}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `reportData` | `ReportData` | ✅ | Report metadata and sections |
| `parameters` | `ReportParameter[]` | ✅ | Report filter parameters |
| `onParameterChange` | `(parameterId: string, value: any) => void` | ❌ | Parameter change handler |
| `onExport` | `(format: "pdf" \| "excel" \| "csv") => void` | ❌ | Export handler |
| `onPrint` | `() => void` | ❌ | Print handler |
| `onSave` | `(name: string, description?: string) => void` | ❌ | Save template handler |
| `onSchedule` | `(schedule: ScheduleConfig) => void` | ❌ | Schedule handler |
| `onRunReport` | `() => void` | ❌ | Run report handler |
| `isLoading` | `boolean` | ❌ | Loading state |
| `className` | `string` | ❌ | Additional CSS classes |

---

## 3. Settings Layout

Settings page with sidebar navigation, form sections, and unsaved changes protection.

### Features

✅ **Sidebar Navigation**
- Section icons and labels
- Active section highlighting
- Optional badges for new features
- Section descriptions
- Responsive with mobile support

✅ **Section Content**
- Dynamic section components
- Form groups with clear labels
- Consistent spacing and layout
- Accessible form inputs

✅ **Unsaved Changes**
- Automatic detection
- Sticky save bar at bottom
- Warning icon and message
- Save/Discard actions

✅ **Navigation Protection**
- Confirmation dialog when navigating with unsaved changes
- Destructive action confirmation
- User-friendly messaging

✅ **State Management**
- Form data tracking
- Section-specific data
- Save/discard handlers

### Usage Example

```tsx
import { SettingsLayout, SettingsSection } from "@/components/layouts/enterprise";
import { User, Shield, CreditCard, Plug, Users, Bell } from "lucide-react";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Switch } from "@/components/ui/shadcn/switch";

// Example section component
const GeneralSettings = ({ onChange, data }) => {
  const [formData, setFormData] = useState(data || {
    companyName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
    </div>
  );
};

const SecuritySettings = ({ onChange, data }) => {
  const [formData, setFormData] = useState(data || {
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Two-Factor Authentication</Label>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
        <Switch
          checked={formData.twoFactorEnabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, twoFactorEnabled: checked })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
        <Input
          id="sessionTimeout"
          type="number"
          value={formData.sessionTimeout}
          onChange={(e) =>
            setFormData({ ...formData, sessionTimeout: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
};

function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sections: SettingsSection[] = [
    {
      id: "general",
      label: "General",
      icon: <User className="h-4 w-4" />,
      description: "Basic account settings",
      component: GeneralSettings,
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="h-4 w-4" />,
      description: "Password and authentication",
      badge: "New",
      component: SecuritySettings,
    },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="h-4 w-4" />,
      description: "Subscription and payment",
      component: BillingSettings,
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: <Plug className="h-4 w-4" />,
      description: "Connect external services",
      component: IntegrationsSettings,
    },
    {
      id: "team",
      label: "Team",
      icon: <Users className="h-4 w-4" />,
      description: "Manage team members",
      component: TeamSettings,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      description: "Email and push notifications",
      component: NotificationSettings,
    },
  ];

  const handleSave = async (sectionId: string, data: any) => {
    setIsSaving(true);
    try {
      await saveSettings(sectionId, data);
      setUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setUnsavedChanges(false);
  };

  return (
    <SettingsLayout
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onSave={handleSave}
      onDiscard={handleDiscard}
      unsavedChanges={unsavedChanges}
      isSaving={isSaving}
    />
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sections` | `SettingsSection[]` | ✅ | Array of settings sections |
| `activeSection` | `string` | ✅ | Currently active section ID |
| `onSectionChange` | `(sectionId: string) => void` | ✅ | Section change handler |
| `onSave` | `(sectionId: string, data: any) => Promise<void>` | ❌ | Save handler |
| `onDiscard` | `() => void` | ❌ | Discard changes handler |
| `unsavedChanges` | `boolean` | ❌ | Whether there are unsaved changes |
| `isSaving` | `boolean` | ❌ | Saving state |
| `className` | `string` | ❌ | Additional CSS classes |

---

## 4. Calendar Layout

Legal calendar with multiple views, statute of limitations alerts, and event type color coding.

### Features

✅ **Multiple Views**
- Month view with grid calendar
- Week view with hourly time slots
- Day view with detailed schedule
- View toggle in header
- Navigation controls (Previous/Next/Today)

✅ **Event Types** (with color coding)
- Court Hearings (blue) - `court_hearing`
- Depositions (purple) - `deposition`
- Deadlines (red) - `deadline`
- Meetings (green) - `meeting`
- Statute of Limitations (orange) - `statute_limitation`
- Filings (indigo) - `filing`
- Conferences (teal) - `conference`
- Trials (rose) - `trial`
- Other (gray) - `other`

✅ **Legal-Specific Features**
- Statute of limitations alerts banner
- Days remaining countdown
- Jurisdiction and statute references
- Court rules integration
- Case association

✅ **Event Details**
- Priority levels (low, medium, high, critical)
- Status badges (scheduled, confirmed, cancelled, completed)
- Location information
- Attendee lists
- All-day event support

✅ **Sidebar Panels**
- Mini calendar for quick navigation
- Today's events list
- Upcoming deadlines (next 7 days)
- Event type legend

✅ **Interactions**
- Event click handlers
- Create new event button
- Date navigation
- View switching

### Usage Example

```tsx
import { CalendarLayout, CalendarEvent, CalendarView } from "@/components/layouts/enterprise";
import { addDays } from "date-fns";

function LegalCalendar() {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Deposition: John Smith",
      description: "Expert witness deposition for medical malpractice case",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 12, 0),
      type: "deposition",
      location: "Conference Room A, 123 Legal Plaza",
      caseId: "CASE-001",
      caseName: "Smith v. Johnson Medical Center",
      priority: "high",
      status: "confirmed",
      attendees: ["Attorney A", "Attorney B", "Court Reporter"],
    },
    {
      id: "2",
      title: "Filing Deadline: Motion to Dismiss",
      start: new Date(2024, 0, 20, 17, 0),
      end: new Date(2024, 0, 20, 17, 0),
      type: "deadline",
      allDay: true,
      caseId: "CASE-002",
      caseName: "Acme Corp v. Widget Inc",
      priority: "critical",
      status: "scheduled",
    },
    {
      id: "3",
      title: "Statute of Limitations: Personal Injury",
      start: new Date(2024, 0, 25, 0, 0),
      end: new Date(2024, 0, 25, 23, 59),
      type: "statute_limitation",
      allDay: true,
      caseId: "CASE-003",
      caseName: "Doe v. ABC Company",
      priority: "critical",
      statuteDeadline: {
        daysRemaining: 10,
        jurisdiction: "California",
        statute: "CCP § 335.1",
      },
    },
    {
      id: "4",
      title: "Court Hearing: Summary Judgment",
      start: new Date(2024, 0, 18, 9, 0),
      end: new Date(2024, 0, 18, 11, 0),
      type: "court_hearing",
      location: "Superior Court of California, Department 12",
      caseId: "CASE-001",
      caseName: "Smith v. Johnson Medical Center",
      priority: "high",
      status: "confirmed",
      courtRules: ["Local Rule 3.57", "CCP § 437c"],
    },
    {
      id: "5",
      title: "Client Meeting: Settlement Discussion",
      start: new Date(2024, 0, 16, 14, 0),
      end: new Date(2024, 0, 16, 15, 30),
      type: "meeting",
      location: "Video Conference",
      caseId: "CASE-002",
      caseName: "Acme Corp v. Widget Inc",
      priority: "medium",
      status: "confirmed",
      attendees: ["Client Contact", "Lead Attorney", "Associate"],
    },
  ];

  const statuteAlerts = events.filter(e => e.type === "statute_limitation");
  const upcomingDeadlines = events.filter(e =>
    e.type === "deadline" &&
    e.start >= new Date() &&
    e.start <= addDays(new Date(), 7)
  );

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // Open event detail modal or navigate to event page
  };

  const handleCreateEvent = () => {
    console.log("Create new event");
    // Open create event modal
  };

  return (
    <CalendarLayout
      events={events}
      view={view}
      selectedDate={selectedDate}
      onViewChange={setView}
      onDateChange={setSelectedDate}
      onEventClick={handleEventClick}
      onCreateEvent={handleCreateEvent}
      statuteAlerts={statuteAlerts}
      upcomingDeadlines={upcomingDeadlines}
    />
  );
}
```

### Event Type Colors

| Type | Background | Text | Border |
|------|------------|------|--------|
| Court Hearing | Blue 100 | Blue 900 | Blue 300 |
| Deposition | Purple 100 | Purple 900 | Purple 300 |
| Deadline | Red 100 | Red 900 | Red 300 |
| Meeting | Green 100 | Green 900 | Green 300 |
| Statute Limitation | Orange 100 | Orange 900 | Orange 300 |
| Filing | Indigo 100 | Indigo 900 | Indigo 300 |
| Conference | Teal 100 | Teal 900 | Teal 300 |
| Trial | Rose 100 | Rose 900 | Rose 300 |
| Other | Gray 100 | Gray 900 | Gray 300 |

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `CalendarEvent[]` | ✅ | Array of calendar events |
| `view` | `CalendarView` | ✅ | Current view (month/week/day) |
| `selectedDate` | `Date` | ✅ | Currently selected date |
| `onViewChange` | `(view: CalendarView) => void` | ✅ | View change handler |
| `onDateChange` | `(date: Date) => void` | ✅ | Date change handler |
| `onEventClick` | `(event: CalendarEvent) => void` | ✅ | Event click handler |
| `onCreateEvent` | `() => void` | ❌ | Create event handler |
| `statuteAlerts` | `CalendarEvent[]` | ❌ | Statute of limitations alerts |
| `upcomingDeadlines` | `CalendarEvent[]` | ❌ | Upcoming deadlines |
| `className` | `string` | ❌ | Additional CSS classes |

---

## Common Features

All four layouts share these characteristics:

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly on mobile devices
- Optimized layouts for different screen sizes

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

### Theming
- Light/dark mode support via next-themes
- CSS variables for colors
- Consistent with shadcn/ui design system

### TypeScript
- Fully typed components and props
- Type exports for easy integration
- IntelliSense support

### Performance
- React best practices
- Memoization where appropriate
- Efficient re-renders
- Code splitting ready

## Dependencies

All required dependencies are already installed:

```json
{
  "date-fns": "^4.1.0",
  "lucide-react": "^0.562.0",
  "recharts": "^3.6.0",
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

## Integration

Import layouts from the enterprise package:

```tsx
import {
  AnalyticsLayout,
  ReportLayout,
  SettingsLayout,
  CalendarLayout,
} from "@/components/layouts/enterprise";

import type {
  MetricData,
  ChartConfig,
  ReportData,
  SettingsSection,
  CalendarEvent,
} from "@/components/layouts/enterprise";
```

## Best Practices

1. **Data Fetching**: Fetch data in parent components, pass as props
2. **State Management**: Use React state or Zustand/Jotai for complex state
3. **Error Handling**: Wrap layouts in error boundaries
4. **Loading States**: Show skeleton loaders during data fetching
5. **Validation**: Validate form data before saving
6. **Accessibility**: Test with keyboard and screen readers
7. **Testing**: Write component tests with React Testing Library
8. **Documentation**: Document custom section components

## File Structure

```
src/components/layouts/enterprise/
├── analytics-layout.tsx
├── report-layout.tsx
├── settings-layout.tsx
├── calendar-layout.tsx
├── index.ts
└── ANALYTICS_REPORTS_SETTINGS.md
```

## Support

For issues or questions:
1. Check the type definitions
2. Review the usage examples
3. Verify required props are provided
4. Check the console for errors
5. Ensure dependencies are installed
