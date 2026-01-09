"use client"

/**
 * @component SidebarNav
 * @description Enterprise navigation sidebar for legal practice management
 * Features: Hierarchical navigation, collapsible groups, active states, notification badges
 * Accessibility: ARIA labels, keyboard navigation, screen reader support
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Search,
  FileQuestion,
  FileText,
  Target,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Building2,
  ShieldCheck,
  Scale,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/shadcn/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/shadcn/avatar"
import { Badge } from "@/components/ui/shadcn/badge"
import { Button } from "@/components/ui/shadcn/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/shadcn/collapsible"

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  items?: NavSubItem[]
}

interface NavSubItem {
  title: string
  url: string
  badge?: number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarNavProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  onThemeToggle?: () => void
  theme?: "light" | "dark"
  onLogout?: () => void
}

// ============================================================================
// Navigation Configuration - Legal Practice Management
// ============================================================================

const navigationGroups: NavGroup[] = [
  {
    title: "Recent Work",
    items: [
      {
        title: "Smith vs Jones",
        url: "/war-room/smith-v-jones",
        icon: Target,
        badge: 2,
      },
      {
        title: "Estate of H. Ford",
        url: "/cases/case-123",
        icon: Briefcase,
      },
      {
        title: "TechCorp Merger",
        url: "/documents/doc-456",
        icon: FileText,
      },
    ],
  },
  {
    title: "Cases & Matters",
    items: [
      {
        title: "Matter Management",
        url: "/cases",
        icon: Briefcase,
        badge: 12,
        items: [
          { title: "All Matters", url: "/cases" },
          { title: "Matter Intake", url: "/intake-forms", badge: 3 },
          { title: "Conflict Checking", url: "/conflicts" },
          { title: "Engagement Letters", url: "/engagement-letters" },
        ],
      },
      {
        title: "Case Strategy",
        url: "/litigation-strategy",
        icon: Target,
      },
      {
        title: "Matter Workflows",
        url: "/workflows",
        icon: Building2,
      },
    ],
  },
  {
    title: "Discovery & Research",
    items: [
      {
        title: "Legal Research",
        url: "/legal-research",
        icon: Search,
        items: [
          { title: "Case Law Research", url: "/research" },
          { title: "Statutory Research", url: "/statute-alerts" },
          { title: "Citation Management", url: "/citations" },
          { title: "Knowledge Base", url: "/knowledge-base" },
        ],
      },
      {
        title: "Discovery Center",
        url: "/discovery",
        icon: FileQuestion,
        badge: 8,
        items: [
          { title: "Discovery Dashboard", url: "/discovery" },
          { title: "Interrogatories", url: "/interrogatories" },
          { title: "Depositions", url: "/depositions", badge: 2 },
          { title: "Subpoenas", url: "/subpoenas" },
          { title: "Production Requests", url: "/production-requests" },
        ],
      },
      {
        title: "Evidence Vault",
        url: "/evidence",
        icon: ShieldCheck,
        items: [
          { title: "Evidence Dashboard", url: "/evidence" },
          { title: "Custodians", url: "/custodians" },
          { title: "Legal Holds", url: "/legal-holds" },
          { title: "Exhibit Manager", url: "/exhibits" },
        ],
      },
    ],
  },
  {
    title: "Documents & Drafting",
    items: [
      {
        title: "Document Manager",
        url: "/documents",
        icon: FileText,
        badge: 24,
        items: [
          { title: "All Documents", url: "/documents" },
          { title: "Version Control", url: "/documents/versions" },
          { title: "Approvals", url: "/documents/approvals", badge: 5 },
          { title: "Templates", url: "/templates" },
        ],
      },
      {
        title: "Document Assembly",
        url: "/drafting",
        icon: FileText,
        items: [
          { title: "Drafting Studio", url: "/drafting" },
          { title: "Pleading Builder", url: "/pleadings" },
          { title: "Clause Library", url: "/clauses" },
        ],
      },
      {
        title: "Motions & Briefs",
        url: "/motions",
        icon: Scale,
        items: [
          { title: "All Motions", url: "/motions" },
          { title: "Briefs", url: "/briefs" },
          { title: "Court Dates", url: "/calendar" },
        ],
      },
    ],
  },
  {
    title: "Litigation & Trial",
    items: [
      {
        title: "War Room",
        url: "/war-room",
        icon: Target,
        items: [
          { title: "Command Center", url: "/war-room/command" },
          { title: "Evidence Wall", url: "/war-room/evidence" },
          { title: "Witness Prep", url: "/war-room/witnesses" },
          { title: "Trial Binder", url: "/war-room/binder" },
          { title: "Advisory Board", url: "/war-room/advisory" },
          { title: "Opposition Research", url: "/war-room/opposition" },
        ]
      },
      {
        title: "Witnesses",
        url: "/witnesses",
        icon: Users,
        items: [
          { title: "Fact Witnesses", url: "/witnesses" },
          { title: "Expert Witnesses", url: "/expert-witnesses" },
        ],
      },
      {
        title: "Trial Preparation",
        url: "/trial-exhibits",
        icon: Briefcase,
        items: [
          { title: "Trial Exhibits", url: "/trial-exhibits" },
          { title: "Jury Selection", url: "/jury-selection" },
        ],
      },
      {
        title: "ADR & Settlements",
        url: "/mediation",
        icon: Target,
        items: [
          { title: "Mediation", url: "/mediation" },
          { title: "Arbitration", url: "/arbitration" },
          { title: "Settlements", url: "/settlements" },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Billing & Finance",
        url: "/billing-reports",
        icon: DollarSign,
        items: [
          { title: "Billing Dashboard", url: "/billing-reports" },
          { title: "Time Entries", url: "/time-entries" },
          { title: "Invoices", url: "/invoices", badge: 7 },
          { title: "Expenses", url: "/expenses" },
          { title: "Retainers", url: "/retainers" },
          { title: "Trust Accounting", url: "/trust-accounting" },
        ],
      },
      {
        title: "Client Relations",
        url: "/clients",
        icon: Users,
        items: [
          { title: "Clients", url: "/clients" },
          { title: "Organizations", url: "/organizations" },
          { title: "Parties", url: "/parties" },
        ],
      },
      {
        title: "Compliance & Risk",
        url: "/compliance",
        icon: ShieldCheck,
        items: [
          { title: "Compliance Dashboard", url: "/compliance" },
          { title: "Conflicts", url: "/conflicts" },
          { title: "Ethical Walls", url: "/ethical-walls" },
        ],
      },
    ],
  },
  {
    title: "Analytics & Reports",
    items: [
      {
        title: "Analytics Dashboard",
        url: "/case-analytics",
        icon: BarChart3,
        items: [
          { title: "Case Analytics", url: "/case-analytics" },
          { title: "Financial Reports", url: "/billing-reports" },
          { title: "Reports", url: "/reports" },
        ],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Integrations",
        url: "/integrations",
        icon: Settings,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

// ============================================================================
// SidebarNav Component
// ============================================================================

export function SidebarNav({
  user = {
    name: "Sarah Johnson",
    email: "sjohnson@lawfirm.com",
    role: "Senior Partner",
  },
  onThemeToggle,
  theme = "light",
  onLogout,
}: SidebarNavProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({})

  const isCollapsed = state === "collapsed"

  const toggleGroup = (itemTitle: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }))
  }

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  return (
    <Sidebar>
      {/* Header: Logo and Branding */}
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-1"
          aria-label="LexiFlow Premium - Go to Dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">LexiFlow Premium</span>
              <span className="text-xs text-muted-foreground">Legal Practice Management</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main Navigation */}
      <SidebarContent>
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0
                  const isItemActive = isActive(item.url)
                  const isOpen = openGroups[item.title] ?? isItemActive

                  if (hasSubItems) {
                    return (
                      <Collapsible
                        key={item.title}
                        open={isOpen}
                        onOpenChange={() => toggleGroup(item.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              isActive={isItemActive}
                              tooltip={item.title}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                              {item.badge && item.badge > 0 && (
                                <SidebarMenuBadge>
                                  {item.badge > 99 ? "99+" : item.badge}
                                </SidebarMenuBadge>
                              )}
                              <ChevronDown
                                className={cn(
                                  "ml-auto h-4 w-4 transition-transform duration-200",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.url}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subItem.url)}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                      {subItem.badge && subItem.badge > 0 && (
                                        <Badge
                                          variant="secondary"
                                          className="ml-auto h-5 min-w-5 px-1 text-xs"
                                        >
                                          {subItem.badge > 99 ? "99+" : subItem.badge}
                                        </Badge>
                                      )}
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
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <SidebarMenuBadge>
                              {item.badge > 99 ? "99+" : item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* Footer: User Profile and Settings */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56"
                sideOffset={8}
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onThemeToggle}
                  className="cursor-pointer"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
