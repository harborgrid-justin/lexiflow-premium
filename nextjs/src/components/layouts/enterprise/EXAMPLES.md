# Enterprise Layouts - Usage Examples

Complete examples demonstrating how to use the enterprise layouts in production.

## Example 1: Complete Dashboard Page

```tsx
// app/(main)/dashboard/page.tsx
"use client"

import { AppShell, DashboardLayout } from "@/components/layouts/enterprise"
import { FileText, Clock, DollarSign, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner",
    avatar: "/avatars/sarah.jpg"
  }

  const metrics = [
    {
      title: "Active Matters",
      value: "142",
      description: "12 new this month",
      trend: { value: 8.2, isPositive: true, label: "vs last month" },
      icon: FileText,
      href: "/cases",
    },
    {
      title: "Billable Hours",
      value: "1,247",
      description: "This month",
      trend: { value: 5.4, isPositive: true, label: "vs last month" },
      icon: Clock,
      href: "/time-entries",
    },
    {
      title: "Revenue (MTD)",
      value: "$284,920",
      description: "Month to date",
      trend: { value: 12.3, isPositive: true, label: "vs last month" },
      icon: DollarSign,
      href: "/billing-reports",
    },
    {
      title: "Pending Deadlines",
      value: "23",
      description: "7 this week",
      trend: { value: -3.1, isPositive: false, label: "vs last week" },
      icon: TrendingUp,
      href: "/calendar",
    },
  ]

  const charts = [
    {
      title: "Case Distribution",
      description: "Cases by practice area",
      children: <CaseDistributionChart />,
      action: { label: "View All", href: "/reports/case-distribution" }
    },
    {
      title: "Revenue Trend",
      description: "Monthly revenue over the past 12 months",
      children: <RevenueTrendChart />,
      action: { label: "View Details", href: "/reports/revenue" }
    }
  ]

  const quickActions = [
    {
      label: "New Matter",
      description: "Create a new case or matter",
      icon: Plus,
      href: "/cases/create",
      variant: "default" as const,
    },
    {
      label: "Upload Document",
      description: "Add documents to the system",
      icon: FileText,
      href: "/documents/upload",
    },
    {
      label: "Log Time Entry",
      description: "Record billable time",
      icon: Clock,
      href: "/time-entries/create",
    },
  ]

  const activities = [
    {
      id: "1",
      title: "New matter filed",
      description: "Johnson v. Smith - Civil litigation case opened",
      timestamp: "5 minutes ago",
      type: "case" as const,
      href: "/cases/1",
    },
    {
      id: "2",
      title: "Document uploaded",
      description: "Contract agreement for Anderson Corp uploaded",
      timestamp: "1 hour ago",
      type: "document" as const,
      href: "/documents/1",
    },
  ]

  return (
    <AppShell
      breadcrumbs={[{ label: "Dashboard" }]}
      user={user}
      onThemeToggle={() => {
        // Toggle theme logic
        console.log("Toggle theme")
      }}
      theme="light"
      onLogout={() => {
        // Logout logic
        console.log("Logout")
      }}
    >
      <DashboardLayout
        metrics={metrics}
        charts={charts}
        actions={quickActions}
        activities={activities}
      />
    </AppShell>
  )
}
```

## Example 2: Case Detail Page with Breadcrumbs

```tsx
// app/(main)/cases/[id]/page.tsx
"use client"

import { AppShell } from "@/components/layouts/enterprise"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs"

interface CaseDetailPageProps {
  params: { id: string }
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  // Fetch case data
  const caseData = {
    id: params.id,
    title: "Johnson v. Smith Corp",
    caseNumber: "2024-CV-12345",
    status: "Active",
    description: "Civil litigation matter regarding breach of contract"
  }

  const breadcrumbs = [
    { label: "Cases", href: "/cases" },
    { label: caseData.title }
  ]

  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner"
  }

  return (
    <AppShell breadcrumbs={breadcrumbs} user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-muted-foreground">Case #{caseData.caseNumber}</p>
          </div>
          <Badge variant="secondary">{caseData.status}</Badge>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{caseData.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            {/* Document list component */}
          </TabsContent>

          {/* Other tab contents */}
        </Tabs>
      </div>
    </AppShell>
  )
}
```

## Example 3: Matter List Page with Search

```tsx
// app/(main)/cases/page.tsx
"use client"

import { AppShell } from "@/components/layouts/enterprise"
import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default function CasesListPage() {
  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner"
  }

  return (
    <AppShell
      breadcrumbs={[{ label: "Matter Management" }]}
      user={user}
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matter Management</h1>
            <p className="text-muted-foreground">
              Manage all cases and matters across your practice
            </p>
          </div>
          <Button asChild>
            <Link href="/cases/create">
              <Plus className="mr-2 h-4 w-4" />
              New Matter
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">Filters</Button>
          <Button variant="outline">Export</Button>
        </div>

        {/* Case List/Table */}
        <Card>
          <CardContent className="p-0">
            {/* Your case list table component */}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
```

## Example 4: Document Upload Page

```tsx
// app/(main)/documents/upload/page.tsx
"use client"

import { AppShell } from "@/components/layouts/enterprise"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { Upload } from "lucide-react"

export default function DocumentUploadPage() {
  const breadcrumbs = [
    { label: "Documents", href: "/documents" },
    { label: "Upload" }
  ]

  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner"
  }

  return (
    <AppShell breadcrumbs={breadcrumbs} user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Documents</h1>
          <p className="text-muted-foreground">
            Add new documents to the document management system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center hover:border-muted-foreground/50">
              <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Upload files</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground">
                  Drag and drop your files here, or click to browse
                </p>
                <Button>Choose Files</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
```

## Example 5: Analytics/Reports Page

```tsx
// app/(main)/case-analytics/page.tsx
"use client"

import { AppShell, DashboardLayout } from "@/components/layouts/enterprise"
import { BarChart3, PieChart, TrendingUp } from "lucide-react"

export default function AnalyticsPage() {
  const breadcrumbs = [
    { label: "Analytics & Reports" },
    { label: "Case Analytics" }
  ]

  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner"
  }

  const metrics = [
    {
      title: "Total Cases",
      value: "487",
      description: "Lifetime cases",
      icon: BarChart3,
    },
    {
      title: "Win Rate",
      value: "73.2%",
      description: "Based on resolved cases",
      trend: { value: 5.1, isPositive: true, label: "vs last year" },
      icon: TrendingUp,
    },
    {
      title: "Avg Case Duration",
      value: "8.4 months",
      description: "From filing to resolution",
      trend: { value: -2.3, isPositive: true, label: "vs last year" },
      icon: PieChart,
    },
  ]

  const charts = [
    {
      title: "Cases by Practice Area",
      description: "Distribution of cases across practice areas",
      children: <PracticeAreaChart />,
    },
    {
      title: "Case Outcomes",
      description: "Win/loss ratio over time",
      children: <OutcomeTrendChart />,
      action: { label: "Export Data", href: "/reports/outcomes/export" }
    },
    {
      title: "Case Duration Analysis",
      description: "Average time to resolution by case type",
      children: <DurationChart />,
    },
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs} user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights across all matters
          </p>
        </div>

        <DashboardLayout
          metrics={metrics}
          charts={charts}
        />
      </div>
    </AppShell>
  )
}
```

## Example 6: Settings Page

```tsx
// app/(main)/settings/page.tsx
"use client"

import { AppShell } from "@/components/layouts/enterprise"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs"
import { Label } from "@/components/ui/shadcn/label"
import { Input } from "@/components/ui/shadcn/input"
import { Switch } from "@/components/ui/shadcn/switch"
import { Button } from "@/components/ui/shadcn/button"

export default function SettingsPage() {
  const user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner"
  }

  return (
    <AppShell
      breadcrumbs={[{ label: "Settings" }]}
      user={user}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in the app
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
```

## Key Patterns

### 1. Consistent User Object
Always pass the same user object structure:
```tsx
const user = {
  name: "Sarah Johnson",
  email: "sjohnson@lawfirm.com",
  role: "Senior Partner",
  avatar: "/avatars/sarah.jpg" // optional
}
```

### 2. Breadcrumb Navigation
Use breadcrumbs for all pages except the dashboard:
```tsx
const breadcrumbs = [
  { label: "Parent", href: "/parent" },
  { label: "Current Page" } // No href on last item
]
```

### 3. Consistent Spacing
Use the standard spacing pattern:
```tsx
<div className="space-y-6">
  {/* Page header */}
  {/* Content sections */}
</div>
```

### 4. Page Headers
Consistent page header structure:
```tsx
<div>
  <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
  <p className="text-muted-foreground">Page description</p>
</div>
```

### 5. Action Buttons
Place primary actions in the header:
```tsx
<div className="flex items-center justify-between">
  <div>{/* Title */}</div>
  <Button>{/* Primary Action */}</Button>
</div>
```

## Responsive Design Notes

- **Mobile**: Single column layout, hamburger menu for navigation
- **Tablet** (md: ≥768px): Two-column grids, visible sidebar
- **Desktop** (lg: ≥1024px): Multi-column layouts, expanded sidebar

## Accessibility Checklist

- [ ] All buttons have aria-labels or visible text
- [ ] Form inputs have associated labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color is not the only indicator of state
- [ ] Images have alt text
- [ ] Headings follow proper hierarchy (h1, h2, h3)
