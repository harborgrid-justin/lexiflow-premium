# Enterprise Layouts - Quick Reference

## 🎯 Analytics, Reports, Settings & Calendar Layouts

Four production-ready page layouts for enterprise legal tech application.

### Files Created

```
src/components/layouts/enterprise/
├── analytics-layout.tsx          (422 lines) - Analytics dashboard
├── report-layout.tsx             (568 lines) - Report builder/viewer
├── settings-layout.tsx           (289 lines) - Settings pages
├── calendar-layout.tsx           (588 lines) - Legal calendar
├── index.ts                      - Unified exports
└── ANALYTICS_REPORTS_SETTINGS.md - Full documentation
```

---

## 📊 Analytics Layout

**Purpose**: Display KPIs, metrics, and charts with date range filtering

**Key Features**:
- Date range presets (Today, Week, Month, Quarter, Year, Custom)
- 4-column KPI metric cards
- Flexible chart grid (full/half/third/quarter width)
- Comparison mode (vs previous period)
- Export to PDF/PNG
- Drill-down modals
- Trend indicators with auto-formatting

**Quick Import**:
```tsx
import { AnalyticsLayout } from "@/components/layouts/enterprise";
import type { MetricData, ChartConfig, DateRange } from "@/components/layouts/enterprise";
```

**Minimal Example**:
```tsx
<AnalyticsLayout
  metrics={metrics}      // KPI cards
  charts={charts}        // Chart configs
  dateRange={dateRange}  // { from: Date, to: Date }
  onDateRangeChange={setDateRange}
  comparisonMode={false}
  onExport={handleExport}
/>
```

**Metric Format Options**: `number`, `currency`, `percentage`, `duration`

---

## 📄 Report Layout

**Purpose**: Professional report builder/viewer with parameters and export

**Key Features**:
- Collapsible parameter panel
- Report sections (text, table, chart, metric, divider)
- Export to PDF, Excel, CSV
- Print-optimized styles
- Report scheduling (once, daily, weekly, monthly)
- Save as template
- Run report button

**Quick Import**:
```tsx
import { ReportLayout } from "@/components/layouts/enterprise";
import type { ReportData, ReportParameter } from "@/components/layouts/enterprise";
```

**Minimal Example**:
```tsx
<ReportLayout
  reportData={{
    metadata: { title, description, lastRun, status },
    sections: [{ id, title, type, content }]
  }}
  parameters={parameters}  // Filter params
  onParameterChange={handleChange}
  onExport={handleExport}
  onSchedule={handleSchedule}
  onSave={handleSaveTemplate}
/>
```

**Parameter Types**: `text`, `number`, `date`, `select`, `multiselect`, `daterange`

**Section Types**: `text`, `table`, `chart`, `metric`, `divider`

---

## ⚙️ Settings Layout

**Purpose**: Settings pages with sidebar navigation and unsaved changes detection

**Key Features**:
- Left sidebar navigation
- Section-based content areas
- Sticky save bar (appears when dirty)
- Unsaved changes warning
- Confirmation dialogs
- Section badges (e.g., "New")
- Icons for each section

**Quick Import**:
```tsx
import { SettingsLayout } from "@/components/layouts/enterprise";
import type { SettingsSection } from "@/components/layouts/enterprise";
```

**Minimal Example**:
```tsx
<SettingsLayout
  sections={[
    {
      id: "general",
      label: "General",
      icon: <User className="h-4 w-4" />,
      component: GeneralSettings
    }
  ]}
  activeSection={activeSection}
  onSectionChange={setActiveSection}
  onSave={handleSave}
  unsavedChanges={isDirty}
/>
```

**Section Component Props**: `onChange`, `data`

---

## 📅 Calendar Layout

**Purpose**: Legal calendar with statute alerts and event type color coding

**Key Features**:
- Three views: Month, Week, Day
- Mini calendar sidebar
- Today's events panel
- Upcoming deadlines (7 days)
- Statute of limitations alerts
- 9 event types with color coding
- Priority indicators (low/medium/high/critical)
- Status badges (scheduled/confirmed/cancelled/completed)
- Court rules integration

**Quick Import**:
```tsx
import { CalendarLayout } from "@/components/layouts/enterprise";
import type { CalendarEvent, CalendarView } from "@/components/layouts/enterprise";
```

**Minimal Example**:
```tsx
<CalendarLayout
  events={events}
  view="month"  // or "week" or "day"
  selectedDate={new Date()}
  onViewChange={setView}
  onDateChange={setDate}
  onEventClick={handleEventClick}
  onCreateEvent={handleCreate}
  statuteAlerts={statuteAlerts}
  upcomingDeadlines={deadlines}
/>
```

**Event Types**: `court_hearing`, `deposition`, `deadline`, `meeting`, `statute_limitation`, `filing`, `conference`, `trial`, `other`

**Event Colors**:
- Court Hearing: Blue
- Deposition: Purple
- Deadline: Red
- Meeting: Green
- Statute Limitation: Orange
- Filing: Indigo
- Conference: Teal
- Trial: Rose
- Other: Gray

---

## 🔧 Common Props

All layouts support:

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional Tailwind classes |

---

## 📦 Import Everything

```tsx
// Layouts
import {
  AnalyticsLayout,
  ReportLayout,
  SettingsLayout,
  CalendarLayout,
} from "@/components/layouts/enterprise";

// Types
import type {
  // Analytics
  AnalyticsLayoutProps,
  MetricData,
  ChartConfig,
  DateRange,
  DateRangePreset,

  // Reports
  ReportLayoutProps,
  ReportData,
  ReportMetadata,
  ReportParameter,
  ReportSection,
  ScheduleConfig,

  // Settings
  SettingsLayoutProps,
  SettingsSection,

  // Calendar
  CalendarLayoutProps,
  CalendarEvent,
  CalendarView,
  EventType,
} from "@/components/layouts/enterprise";
```

---

## 🎨 Styling

All layouts use:
- **shadcn/ui components** - Consistent design system
- **Tailwind CSS** - Utility-first styling
- **Responsive breakpoints** - Mobile-first (sm/md/lg/xl)
- **Light/dark mode** - Via next-themes
- **Print styles** - Optimized for reports

---

## ♿ Accessibility

All layouts include:
- Keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader support
- Semantic HTML

---

## 📝 TypeScript

Fully typed with:
- Strict prop types
- Exported interfaces
- IntelliSense support
- Type inference

---

## 🚀 Performance

Optimized with:
- React best practices
- Memoization where needed
- Efficient re-renders
- Code splitting ready

---

## 📚 Full Documentation

See `ANALYTICS_REPORTS_SETTINGS.md` for:
- Detailed usage examples
- All prop definitions
- Advanced features
- Best practices
- Integration guides
- Type definitions
- Troubleshooting

---

## 🧪 Testing

Each layout can be tested with:
```tsx
import { render, screen } from "@testing-library/react";
import { AnalyticsLayout } from "@/components/layouts/enterprise";

test("renders analytics layout", () => {
  render(
    <AnalyticsLayout
      metrics={mockMetrics}
      charts={mockCharts}
      dateRange={mockRange}
      onDateRangeChange={jest.fn()}
    />
  );

  expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
});
```

---

## ⚡ Dependencies

All required dependencies are installed:
- `date-fns` - Date manipulation
- `lucide-react` - Icons
- `recharts` - Charts
- `react` & `react-dom` - Framework
- shadcn/ui components

---

## 💡 Tips

1. **Fetch data in parent components**, pass as props
2. **Use React state or Zustand** for complex state
3. **Wrap in error boundaries** for error handling
4. **Show skeleton loaders** during data fetching
5. **Validate forms** before saving
6. **Test keyboard navigation** for accessibility
7. **Check responsive layouts** on mobile

---

## 📍 File Locations

All layouts are in:
```
/workspaces/lexiflow-premium/nextjs/src/components/layouts/enterprise/
```

Import from:
```tsx
"@/components/layouts/enterprise"
```

---

## 🎯 Production Ready

All layouts are:
- ✅ Fully typed with TypeScript
- ✅ No TODOs or placeholders
- ✅ Using real shadcn/ui components
- ✅ Responsive and accessible
- ✅ Print-friendly (reports)
- ✅ Theme-aware (light/dark)
- ✅ Documented with examples

---

**Need Help?** Check `ANALYTICS_REPORTS_SETTINGS.md` for comprehensive documentation.
