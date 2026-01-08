"use client"

/**
 * @component AppShell
 * @description Main application shell layout with sidebar, header, and content area
 * Features: Responsive navigation, breadcrumbs, search, notifications, user menu
 * Accessibility: ARIA landmarks, keyboard navigation, mobile-friendly
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  Bell,
  ChevronRight,
  Home,
  Command as CommandIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/shadcn/sidebar"
import { Button } from "@/components/ui/shadcn/button"
import { Badge } from "@/components/ui/shadcn/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/shadcn/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/shadcn/command"
import { SidebarNav } from "./sidebar-nav"

// ============================================================================
// Types
// ============================================================================

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Notification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

interface AppShellProps {
  children: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  notifications?: Notification[]
  onThemeToggle?: () => void
  theme?: "light" | "dark"
  onLogout?: () => void
}

// ============================================================================
// Default Data
// ============================================================================

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "New case filed",
    description: "Johnson v. Smith - Civil litigation",
    time: "5m ago",
    read: false,
  },
  {
    id: "2",
    title: "Discovery deadline approaching",
    description: "Anderson case - Due in 3 days",
    time: "1h ago",
    read: false,
  },
  {
    id: "3",
    title: "Invoice approved",
    description: "Invoice #2024-003 has been approved",
    time: "2h ago",
    read: true,
  },
  {
    id: "4",
    title: "Document review completed",
    description: "Contract review for Acme Corp completed",
    time: "4h ago",
    read: true,
  },
]

// Command palette search data
const searchCommands = [
  {
    group: "Quick Actions",
    items: [
      { label: "New Matter", value: "new-matter", href: "/cases/create" },
      { label: "Upload Document", value: "upload-doc", href: "/documents/upload" },
      { label: "Create Invoice", value: "create-invoice", href: "/invoices/create" },
      { label: "Log Time Entry", value: "log-time", href: "/time-entries/create" },
    ],
  },
  {
    group: "Navigation",
    items: [
      { label: "Dashboard", value: "dashboard", href: "/dashboard" },
      { label: "Matter Management", value: "cases", href: "/cases" },
      { label: "Discovery Center", value: "discovery", href: "/discovery" },
      { label: "Document Manager", value: "documents", href: "/documents" },
      { label: "Legal Research", value: "research", href: "/legal-research" },
      { label: "Billing Dashboard", value: "billing", href: "/billing-reports" },
      { label: "Analytics", value: "analytics", href: "/case-analytics" },
    ],
  },
]

// ============================================================================
// Header Component
// ============================================================================

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  notifications?: Notification[]
  onNotificationClick?: (id: string) => void
}

function Header({ breadcrumbs, title, notifications = defaultNotifications }: HeaderProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1" />

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {crumb.href && index < breadcrumbs.length - 1 ? (
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

        {/* Page Title - Fallback if no breadcrumbs */}
        {!breadcrumbs && title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Command Palette Trigger */}
        <Button
          variant="outline"
          size="sm"
          className="relative h-9 w-9 p-0 md:h-9 md:w-64 md:justify-start md:px-3"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline-flex">Search...</span>
          <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-9 w-9 rounded-full"
              aria-label={`Notifications - ${unreadCount} unread`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-2">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1 p-3",
                    !notification.read && "bg-accent/50"
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                asChild
              >
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Command Palette Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchCommands.map((group) => (
            <React.Fragment key={group.group}>
              <CommandGroup heading={group.group}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => {
                      setCommandOpen(false)
                      window.location.href = item.href
                    }}
                  >
                    <CommandIcon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

// ============================================================================
// AppShell Component
// ============================================================================

export function AppShell({
  children,
  breadcrumbs,
  title,
  user,
  notifications,
  onThemeToggle,
  theme,
  onLogout,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <SidebarNav
        user={user}
        onThemeToggle={onThemeToggle}
        theme={theme}
        onLogout={onLogout}
      />
      <SidebarInset>
        <Header
          breadcrumbs={breadcrumbs}
          title={title}
          notifications={notifications}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ============================================================================
// Exports
// ============================================================================

export type { AppShellProps, BreadcrumbItem, Notification }
