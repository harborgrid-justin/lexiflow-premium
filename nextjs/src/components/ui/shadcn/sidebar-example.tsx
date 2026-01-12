import Link from 'next/link';
"use client"

/**
 * Sidebar Example Component
 * Complete working example of the sidebar system for a legal application
 * This demonstrates all features and best practices
 */

import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar"
import {
  LayoutDashboard,
  Scale,
  Users,
  FileText,
  Calendar,
  FolderOpen,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  Plus,
  MoreHorizontal,
  ChevronRight,
  Search,
  Bell,
  User,
  Briefcase,
  Gavel,
  BookOpen,
  Shield,
  TrendingUp,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"

// ============================================================================
// Data Structure
// ============================================================================

const mainNavigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    badge: null,
  },
  {
    id: "cases",
    label: "Cases",
    icon: Scale,
    href: "/cases",
    badge: 24,
  },
  {
    id: "clients",
    label: "Clients",
    icon: Users,
    href: "/clients",
    badge: null,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    href: "/documents",
    badge: null,
    items: [
      { id: "contracts", label: "Contracts", href: "/documents/contracts" },
      { id: "pleadings", label: "Pleadings", href: "/documents/pleadings" },
      { id: "briefs", label: "Briefs", href: "/documents/briefs" },
      { id: "evidence", label: "Evidence", href: "/documents/evidence" },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
    badge: 3,
  },
]

const managementNavigation = [
  {
    id: "matters",
    label: "Matters",
    icon: FolderOpen,
    href: "/matters",
  },
  {
    id: "time-entries",
    label: "Time Entries",
    icon: Clock,
    href: "/time-entries",
  },
  {
    id: "billing",
    label: "Billing",
    icon: DollarSign,
    href: "/billing",
    badge: "!",
  },
]

const legalToolsNavigation = [
  {
    id: "research",
    label: "Legal Research",
    icon: BookOpen,
    href: "/research",
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    href: "/compliance",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: TrendingUp,
    href: "/analytics",
  },
  {
    id: "litigation",
    label: "Litigation Strategy",
    icon: Gavel,
    href: "/litigation",
  },
]

// ============================================================================
// App Sidebar Component
// ============================================================================

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("dashboard")

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="font-semibold">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Briefcase className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">LexiFlow</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Enterprise Legal OS
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon
                const hasSubItems = item.items && item.items.length > 0

                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.id}
                      asChild
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={activeItem === item.id}
                          >
                            <Icon />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={activeItem === subItem.id}
                                >
                                  <a
                                    href={subItem.href}
                                    onClick={() => setActiveItem(subItem.id)}
                                  >
                                    <span>{subItem.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={activeItem === item.id}
                    >
                      <a href={item.href} onClick={() => setActiveItem(item.id)}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Management */}
        <Collapsible defaultOpen className="group/management">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center">
                Management
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/management:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.label}
                          isActive={activeItem === item.id}
                        >
                          <a
                            href={item.href}
                            onClick={() => setActiveItem(item.id)}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator />

        {/* Legal Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Legal Tools</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {legalToolsNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={activeItem === item.id}
                    >
                      <a href={item.href} onClick={() => setActiveItem(item.id)}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <a href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <a href="/profile">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              onClick={() => console.log("Logout")}
            >
              <button>
                <LogOut />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

// ============================================================================
// Example Page Header Component
// ============================================================================

export function PageHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <SidebarSeparator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to LexiFlow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <Search className="h-4 w-4" />
          </button>
          <button className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// Loading Sidebar Component
// ============================================================================

export function LoadingSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuSkeleton />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuSkeleton key={index} showIcon />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuSkeleton />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// ============================================================================
// Complete Layout Example
// ============================================================================

export function SidebarLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <PageHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ============================================================================
// Sidebar State Display (for debugging/demo)
// ============================================================================

export function SidebarStateDisplay() {
  const sidebar = useSidebar()

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <h3 className="mb-2 font-semibold">Sidebar State</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">State:</span>
          <span className="font-mono">{sidebar.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Open:</span>
          <span className="font-mono">{String(sidebar.open)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mobile Open:</span>
          <span className="font-mono">{String(sidebar.openMobile)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Is Mobile:</span>
          <span className="font-mono">{String(sidebar.isMobile)}</span>
        </div>
      </div>
      <button
        onClick={sidebar.toggleSidebar}
        className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Toggle Sidebar
      </button>
    </div>
  )
}
