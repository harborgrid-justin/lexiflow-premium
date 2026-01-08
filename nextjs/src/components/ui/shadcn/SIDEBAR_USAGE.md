# Sidebar Component Usage Guide

Complete guide for implementing the enterprise-grade sidebar in your legal application.

## Features

✅ **Cookie-based State Persistence** - Sidebar state persists across sessions
✅ **Keyboard Shortcuts** - Toggle with `Cmd+B` (Mac) or `Ctrl+B` (Windows/Linux)
✅ **Mobile Responsive** - Automatic mobile drawer on small screens
✅ **Multiple Variants** - sidebar, floating, inset
✅ **Collapsible Modes** - offcanvas, icon, none
✅ **Full Accessibility** - ARIA labels, keyboard navigation
✅ **Type Safety** - Complete TypeScript support

## Installation

The components are already installed. Make sure you have the required dependencies:

```bash
npm install @radix-ui/react-scroll-area @radix-ui/react-slot class-variance-authority lucide-react
```

## Basic Usage

### 1. Wrap your app with SidebarProvider

```tsx
import { SidebarProvider } from "@/components/ui/shadcn"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}
```

### 2. Create a sidebar component

```tsx
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
  SidebarRail,
} from "@/components/ui/shadcn"
import { Home, Users, FileText, Settings } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4">
          <h2 className="text-lg font-semibold">LexiFlow</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/cases">
                    <FileText />
                    <span>Cases</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/clients">
                    <Users />
                    <span>Clients</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
```

### 3. Use with SidebarInset

```tsx
import { SidebarInset, SidebarTrigger } from "@/components/ui/shadcn"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1>Dashboard</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

## Advanced Features

### Active State

```tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild isActive={pathname === "/cases"}>
    <a href="/cases">
      <FileText />
      <span>Cases</span>
    </a>
  </SidebarMenuButton>
</SidebarMenuItem>
```

### Badges

```tsx
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="/tasks">
      <CheckSquare />
      <span>Tasks</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuBadge>12</SidebarMenuBadge>
</SidebarMenuItem>
```

### Menu Actions

```tsx
import { MoreHorizontal } from "lucide-react"

<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="/projects">
      <Folder />
      <span>Projects</span>
    </a>
  </SidebarMenuButton>
  <SidebarMenuAction showOnHover>
    <MoreHorizontal />
  </SidebarMenuAction>
</SidebarMenuItem>
```

### Sub Menus

```tsx
import { ChevronRight } from "lucide-react"

<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="/documents">
      <FileText />
      <span>Documents</span>
      <ChevronRight className="ml-auto" />
    </a>
  </SidebarMenuButton>
  <SidebarMenuSub>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href="/documents/contracts">Contracts</a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild>
        <a href="/documents/pleadings">Pleadings</a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  </SidebarMenuSub>
</SidebarMenuItem>
```

### Collapsible Groups with Radix Collapsible

```tsx
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"

<Collapsible defaultOpen className="group/collapsible">
  <SidebarGroup>
    <SidebarGroupLabel asChild>
      <CollapsibleTrigger className="flex w-full items-center justify-between">
        Cases
        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
      </CollapsibleTrigger>
    </SidebarGroupLabel>
    <CollapsibleContent>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/cases/active">Active Cases</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/cases/archived">Archived Cases</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </CollapsibleContent>
  </SidebarGroup>
</Collapsible>
```

### Loading States

```tsx
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
```

### Variants

#### Floating Sidebar

```tsx
<Sidebar variant="floating" />
```

#### Inset Sidebar

```tsx
<Sidebar variant="inset" />
```

#### Icon-only Collapsed Mode

```tsx
<Sidebar collapsible="icon" />
```

### Controlled State

```tsx
"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/shadcn"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {children}
    </SidebarProvider>
  )
}
```

### Using the Hook

```tsx
"use client"

import { useSidebar } from "@/components/ui/shadcn"

export function MyComponent() {
  const {
    state,           // "expanded" | "collapsed"
    open,            // boolean
    setOpen,         // (open: boolean) => void
    openMobile,      // boolean
    setOpenMobile,   // (open: boolean) => void
    isMobile,        // boolean
    toggleSidebar,   // () => void
  } = useSidebar()

  return (
    <div>
      <p>Sidebar is {state}</p>
      <button onClick={toggleSidebar}>Toggle</button>
    </div>
  )
}
```

## Keyboard Shortcuts

- **Cmd+B** (Mac) or **Ctrl+B** (Windows/Linux) - Toggle sidebar

## Responsive Behavior

### Desktop (≥768px)
- Sidebar is visible by default
- Collapses to icon mode or hides completely
- State persists via cookies

### Mobile (<768px)
- Sidebar renders as an overlay drawer
- Includes backdrop overlay
- Slides in from left/right
- Closes when clicking outside

## CSS Variables

The sidebar uses the following CSS variables (already defined in globals.css):

```css
:root {
  --sidebar-width: 16rem;
  --sidebar-width-icon: 3rem;
  --sidebar-width-mobile: 18rem;

  /* Light mode */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  /* Dark mode */
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

## Complete Legal Application Example

```tsx
// app/layout.tsx
import { SidebarProvider } from "@/components/ui/shadcn"
import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          {children}
        </SidebarProvider>
      </body>
    </html>
  )
}

// components/app-sidebar.tsx
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
  SidebarMenuBadge,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/shadcn"
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
} from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Scale className="h-6 w-6" />
          <span className="text-lg font-semibold">LexiFlow</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <a href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Cases">
                  <a href="/cases">
                    <Scale />
                    <span>Cases</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge>24</SidebarMenuBadge>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Clients">
                  <a href="/clients">
                    <Users />
                    <span>Clients</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documents">
                  <a href="/documents">
                    <FileText />
                    <span>Documents</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Calendar">
                  <a href="/calendar">
                    <Calendar />
                    <span>Calendar</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Matters">
                  <a href="/matters">
                    <FolderOpen />
                    <span>Matters</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Time Entries">
                  <a href="/time-entries">
                    <Clock />
                    <span>Time Entries</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Billing">
                  <a href="/billing">
                    <DollarSign />
                    <span>Billing</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <a href="/settings">
                <Settings />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button onClick={() => console.log("Logout")}>
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

// app/(main)/dashboard/page.tsx
import { SidebarInset, SidebarTrigger } from "@/components/ui/shadcn"

export default function DashboardPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {/* Your dashboard content */}
        </div>
      </div>
    </SidebarInset>
  )
}
```

## Accessibility

The sidebar includes:

- **ARIA Labels** - All interactive elements have proper labels
- **Keyboard Navigation** - Full keyboard support with Tab, Enter, and arrow keys
- **Focus Management** - Proper focus indicators and management
- **Screen Reader Support** - Semantic HTML and ARIA attributes
- **Keyboard Shortcuts** - Cmd+B / Ctrl+B to toggle

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## Production Checklist

- ✅ No mocks or TODOs
- ✅ Full TypeScript type safety
- ✅ Complete accessibility
- ✅ Mobile responsive
- ✅ State persistence
- ✅ Keyboard shortcuts
- ✅ Production-ready styling
- ✅ All subcomponents implemented
- ✅ Documentation complete
