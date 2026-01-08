"use client"

/**
 * @component DashboardLayout
 * @description Dashboard page layout with metrics, charts, and activity feeds
 * Features: Responsive grid, quick actions, metric cards, chart containers
 * Accessibility: ARIA labels, semantic HTML, keyboard navigation
 */

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  Clock,
  DollarSign,
  LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { Badge } from "@/components/ui/shadcn/badge"
import { ScrollArea } from "@/components/ui/shadcn/scroll-area"
import { Separator } from "@/components/ui/shadcn/separator"

// ============================================================================
// Types
// ============================================================================

interface MetricCard {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  icon?: LucideIcon
  href?: string
}

interface ChartCard {
  title: string
  description?: string
  children: React.ReactNode
  action?: {
    label: string
    href: string
  }
}

interface QuickAction {
  label: string
  description?: string
  icon: LucideIcon
  href: string
  variant?: "default" | "outline" | "secondary"
}

interface Activity {
  id: string
  title: string
  description: string
  timestamp: string
  type?: "case" | "document" | "billing" | "deadline" | "general"
  href?: string
}

interface DashboardLayoutProps {
  metrics: MetricCard[]
  charts?: ChartCard[]
  actions?: QuickAction[]
  activities?: Activity[]
  children?: React.ReactNode
}

// ============================================================================
// MetricCard Component
// ============================================================================

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const Icon = metric.icon

  return (
    <Card className="overflow-hidden transition-colors hover:bg-accent/5">
      {metric.href ? (
        <Link href={metric.href} className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {Icon && (
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            )}
            {metric.trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    metric.trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {metric.trend.value > 0 ? "+" : ""}
                  {metric.trend.value}%
                </span>
                <span className="text-muted-foreground">{metric.trend.label}</span>
              </div>
            )}
          </CardContent>
        </Link>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {Icon && (
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            )}
            {metric.trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    metric.trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {metric.trend.value > 0 ? "+" : ""}
                  {metric.trend.value}%
                </span>
                <span className="text-muted-foreground">{metric.trend.label}</span>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

// ============================================================================
// ChartCard Component
// ============================================================================

function ChartCardComponent({ chart }: { chart: ChartCard }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{chart.title}</CardTitle>
            {chart.description && (
              <CardDescription>{chart.description}</CardDescription>
            )}
          </div>
          {chart.action && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={chart.action.href}>{chart.action.label}</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{chart.children}</CardContent>
    </Card>
  )
}

// ============================================================================
// QuickActions Component
// ============================================================================

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant={action.variant || "outline"}
                className="h-auto justify-start gap-3 px-3 py-3"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{action.label}</span>
                    {action.description && (
                      <span className="text-xs text-muted-foreground">
                        {action.description}
                      </span>
                    )}
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ActivityFeed Component
// ============================================================================

function ActivityFeed({ activities }: { activities: Activity[] }) {
  const getActivityTypeColor = (type?: string) => {
    switch (type) {
      case "case":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "document":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400"
      case "billing":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "deadline":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your cases and matters</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-6 pt-0">
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
                  <div
                    className={cn(
                      "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                      getActivityTypeColor(activity.type)
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1 space-y-1">
                    {activity.href ? (
                      <Link href={activity.href} className="block">
                        <p className="text-sm font-medium leading-none group-hover:underline">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </>
                    )}
                  </div>
                  {activity.type && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 capitalize",
                        getActivityTypeColor(activity.type)
                      )}
                    >
                      {activity.type}
                    </Badge>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardContent className="border-t pt-4">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/activity">View All Activity</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// DashboardLayout Component
// ============================================================================

export function DashboardLayout({
  metrics,
  charts = [],
  actions = [],
  activities = [],
  children,
}: DashboardLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Metrics Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCardComponent key={index} metric={metric} />
        ))}
      </div>

      {/* Charts and Actions Grid */}
      {(charts.length > 0 || actions.length > 0 || activities.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-7">
          {/* Charts Section - Takes up more space */}
          {charts.length > 0 && (
            <div className="space-y-4 lg:col-span-4">
              {charts.map((chart, index) => (
                <ChartCardComponent key={index} chart={chart} />
              ))}
            </div>
          )}

          {/* Sidebar: Quick Actions and Activity Feed */}
          {(actions.length > 0 || activities.length > 0) && (
            <div className="space-y-4 lg:col-span-3">
              {actions.length > 0 && <QuickActions actions={actions} />}
              {activities.length > 0 && <ActivityFeed activities={activities} />}
            </div>
          )}
        </div>
      )}

      {/* Custom Children Content */}
      {children && <div className="space-y-4">{children}</div>}
    </div>
  )
}

// ============================================================================
// Default Data Examples
// ============================================================================

export const defaultMetrics: MetricCard[] = [
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

export const defaultActions: QuickAction[] = [
  {
    label: "New Matter",
    description: "Create a new case or matter",
    icon: Plus,
    href: "/cases/create",
    variant: "default",
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
  {
    label: "Create Invoice",
    description: "Generate client invoice",
    icon: DollarSign,
    href: "/invoices/create",
  },
]

export const defaultActivities: Activity[] = [
  {
    id: "1",
    title: "New matter filed",
    description: "Johnson v. Smith - Civil litigation case opened",
    timestamp: "5 minutes ago",
    type: "case",
    href: "/cases/1",
  },
  {
    id: "2",
    title: "Document uploaded",
    description: "Contract agreement for Anderson Corp uploaded by Sarah Johnson",
    timestamp: "1 hour ago",
    type: "document",
    href: "/documents/1",
  },
  {
    id: "3",
    title: "Invoice approved",
    description: "Invoice #2024-003 for $45,000 approved by client",
    timestamp: "2 hours ago",
    type: "billing",
    href: "/invoices/2024-003",
  },
  {
    id: "4",
    title: "Discovery deadline approaching",
    description: "Martinez v. Technology Inc - Discovery responses due in 3 days",
    timestamp: "3 hours ago",
    type: "deadline",
    href: "/cases/2",
  },
  {
    id: "5",
    title: "Time entry logged",
    description: "8.5 hours logged for research on Thompson case",
    timestamp: "4 hours ago",
    type: "billing",
  },
  {
    id: "6",
    title: "Motion filed",
    description: "Motion to Dismiss filed in Davis v. Manufacturing LLC",
    timestamp: "5 hours ago",
    type: "case",
    href: "/motions/1",
  },
  {
    id: "7",
    title: "Deposition scheduled",
    description: "Expert witness deposition scheduled for next Tuesday",
    timestamp: "6 hours ago",
    type: "case",
  },
]

// ============================================================================
// Exports
// ============================================================================

export type {
  DashboardLayoutProps,
  MetricCard,
  ChartCard,
  QuickAction,
  Activity,
}
