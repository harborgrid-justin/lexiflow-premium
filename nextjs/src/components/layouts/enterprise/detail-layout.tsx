/**
 * @component DetailLayout
 * @description Enterprise-grade entity detail page layout
 *
 * Features:
 * - Sticky header with title, status badge, action menu
 * - Tabs for different sections (Overview, Documents, Activity, etc.)
 * - Two-column layout (main content 2/3, sidebar 1/3)
 * - Sidebar with metadata, timeline, related items
 * - Breadcrumb navigation
 * - Back button
 * - Responsive (stacks on mobile)
 *
 * @example
 * ```tsx
 * <DetailLayout
 *   title="Case #2024-001"
 *   subtitle="Smith v. Johnson"
 *   status={{ label: "Active", variant: "default" }}
 *   breadcrumbs={[
 *     { label: "Cases", href: "/cases" },
 *     { label: "Case #2024-001" }
 *   ]}
 *   tabs={[
 *     { value: "overview", label: "Overview", content: <CaseOverview /> },
 *     { value: "documents", label: "Documents", content: <Documents /> },
 *     { value: "activity", label: "Activity", content: <ActivityFeed /> }
 *   ]}
 *   actions={[
 *     { label: "Edit", onClick: handleEdit },
 *     { label: "Archive", onClick: handleArchive, variant: "destructive" }
 *   ]}
 *   metadata={[
 *     { label: "Case Number", value: "2024-001" },
 *     { label: "Client", value: "John Smith" },
 *     { label: "Filed", value: "Jan 15, 2024" }
 *   ]}
 *   onBack={() => router.back()}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { ArrowLeft, MoreVertical } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { Badge } from "@/components/ui/shadcn/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/shadcn/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card"
import { Separator } from "@/components/ui/shadcn/separator"
import { Skeleton } from "@/components/ui/shadcn/skeleton"

export interface DetailLayoutBreadcrumb {
  label: string
  href?: string
}

export interface DetailLayoutTab {
  value: string
  label: string
  content: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface DetailLayoutAction {
  label: string
  onClick: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface DetailLayoutMetadata {
  label: string
  value: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export interface DetailLayoutStatus {
  label: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export interface DetailLayoutProps {
  /**
   * Page title
   */
  title: string

  /**
   * Optional subtitle
   */
  subtitle?: string

  /**
   * Status badge
   */
  status?: DetailLayoutStatus

  /**
   * Breadcrumb navigation
   */
  breadcrumbs?: DetailLayoutBreadcrumb[]

  /**
   * Tabs configuration
   */
  tabs: DetailLayoutTab[]

  /**
   * Default active tab
   */
  defaultTab?: string

  /**
   * Controlled tab value
   */
  activeTab?: string

  /**
   * Tab change handler
   */
  onTabChange?: (value: string) => void

  /**
   * Action menu items
   */
  actions?: DetailLayoutAction[]

  /**
   * Metadata items for sidebar
   */
  metadata?: DetailLayoutMetadata[]

  /**
   * Sidebar content (below metadata)
   */
  sidebarContent?: React.ReactNode

  /**
   * Back button handler
   */
  onBack?: () => void

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Disable two-column layout (full-width tabs)
   * @default false
   */
  fullWidth?: boolean

  /**
   * Additional class names
   */
  className?: string
}

export function DetailLayout({
  title,
  subtitle,
  status,
  breadcrumbs = [],
  tabs,
  defaultTab,
  activeTab,
  onTabChange,
  actions = [],
  metadata = [],
  sidebarContent,
  onBack,
  isLoading = false,
  fullWidth = false,
  className,
}: DetailLayoutProps) {
  if (isLoading) {
    return <DetailLayoutSkeleton fullWidth={fullWidth} />
  }

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 bg-background px-6 pt-6 pb-4 border-b">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="mt-1"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {status && (
                  <Badge variant={status.variant || "default"}>
                    {status.label}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {actions.map((action, index) => {
                  const Icon = action.icon
                  const isDestructive = action.variant === "destructive"
                  return (
                    <React.Fragment key={index}>
                      {index > 0 && isDestructive && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={cn(
                          isDestructive && "text-destructive focus:text-destructive"
                        )}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-col gap-6",
          !fullWidth && "lg:flex-row lg:gap-8"
        )}
      >
        {/* Main Content (2/3) */}
        <div className={cn("flex-1", !fullWidth && "lg:w-2/3")}>
          <Tabs
            defaultValue={defaultTab || tabs[0]?.value}
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full"
          >
            <TabsList className="w-full justify-start">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {tab.label}
                    {tab.badge && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {tab.badge}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Sidebar (1/3) */}
        {!fullWidth && (metadata.length > 0 || sidebarContent) && (
          <aside className="lg:w-1/3 space-y-6">
            {/* Metadata Card */}
            {metadata.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metadata.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} className="flex flex-col gap-1">
                        <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          {item.label}
                        </dt>
                        <dd className="text-sm">
                          {typeof item.value === "string" ? (
                            <span>{item.value}</span>
                          ) : (
                            item.value
                          )}
                        </dd>
                        {index < metadata.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Additional Sidebar Content */}
            {sidebarContent}
          </aside>
        )}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for DetailLayout
 */
export function DetailLayoutSkeleton({
  fullWidth = false,
  className,
}: {
  fullWidth?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[120px]" />
      </div>

      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <Skeleton className="h-10 w-10" />
      </div>

      {/* Content skeleton */}
      <div
        className={cn(
          "flex flex-col gap-6",
          !fullWidth && "lg:flex-row lg:gap-8"
        )}
      >
        <div className={cn("flex-1", !fullWidth && "lg:w-2/3")}>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
        {!fullWidth && (
          <div className="lg:w-1/3">
            <Skeleton className="h-[300px] w-full" />
          </div>
        )}
      </div>
    </div>
  )
}
