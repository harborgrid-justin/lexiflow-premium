"use client"

/**
 * Sidebar Component System
 * Complete enterprise-grade sidebar implementation for legal applications
 * Based on shadcn/ui specifications with full accessibility and responsive design
 *
 * Features:
 * - Cookie-based state persistence
 * - Keyboard shortcuts (Cmd+B / Ctrl+B)
 * - Multiple variants (sidebar, floating, inset)
 * - Collapsible modes (offcanvas, icon, none)
 * - Mobile responsive with touch support
 * - Full accessibility (ARIA labels, keyboard navigation)
 * - Type-safe React context
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"

// ============================================================================
// Constants and Configuration
// ============================================================================

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// ============================================================================
// Types and Interfaces
// ============================================================================

type SidebarContextType = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Mobile detection hook
 * Detects if the user is on a mobile device based on screen width
 */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)

    // Initial check
    checkMobile()

    // Add resize listener
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [breakpoint])

  return isMobile
}

/**
 * Cookie utility functions
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift()
  }

  return undefined
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return

  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`
}

// ============================================================================
// Context
// ============================================================================

const SidebarContext = React.createContext<SidebarContextType | null>(null)

/**
 * useSidebar hook
 * Access sidebar state and controls from any component
 */
export function useSidebar(): SidebarContextType {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

// ============================================================================
// Provider Component
// ============================================================================

interface SidebarProviderProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()

    // Load initial state from cookie
    const [openState, setOpenState] = React.useState<boolean>(() => {
      if (openProp !== undefined) return openProp

      const cookieValue = getCookie(SIDEBAR_COOKIE_NAME)
      if (cookieValue !== undefined) {
        return cookieValue === "true"
      }

      return defaultOpen
    })

    const [openMobile, setOpenMobile] = React.useState(false)

    // Controlled vs uncontrolled state
    const open = openProp ?? openState
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const nextOpen = typeof value === "function" ? value(open) : value

        if (setOpenProp) {
          setOpenProp(nextOpen)
        } else {
          setOpenState(nextOpen)
        }

        // Persist to cookie
        setCookie(SIDEBAR_COOKIE_NAME, String(nextOpen), SIDEBAR_COOKIE_MAX_AGE)
      },
      [setOpenProp, open]
    )

    // Toggle function
    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev)
      } else {
        setOpen((prev) => !prev)
      }
    }, [isMobile, setOpen])

    // Keyboard shortcut (Cmd+B / Ctrl+B)
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // Close mobile sidebar when switching to desktop
    React.useEffect(() => {
      if (!isMobile) {
        setOpenMobile(false)
      }
    }, [isMobile])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextType>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          ref={ref}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-screen w-full has-[[data-variant=inset]]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// ============================================================================
// Sidebar Component
// ============================================================================

const sidebarVariants = cva(
  "group peer hidden md:block text-sidebar-foreground",
  {
    variants: {
      variant: {
        sidebar: "border-r border-sidebar-border bg-sidebar",
        floating: "border-r border-sidebar-border bg-sidebar shadow-lg",
        inset: "bg-sidebar",
      },
      side: {
        left: "",
        right: "order-last",
      },
      collapsible: {
        offcanvas: "",
        icon: "",
        none: "",
      },
    },
    defaultVariants: {
      variant: "sidebar",
      side: "left",
      collapsible: "offcanvas",
    },
  }
)

interface SidebarProps extends React.ComponentPropsWithoutRef<"div">,
  VariantProps<typeof sidebarVariants> {}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ variant, side, collapsible = "offcanvas", className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          ref={ref}
          className={cn(sidebarVariants({ variant, side, collapsible }), className)}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <>
          {/* Overlay */}
          {openMobile && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setOpenMobile(false)}
              aria-hidden="true"
            />
          )}

          {/* Mobile sidebar */}
          <div
            ref={ref}
            data-state={openMobile ? "open" : "closed"}
            data-mobile="true"
            className={cn(
              "fixed inset-y-0 z-50 flex h-full w-[var(--sidebar-width-mobile)] flex-col transition-transform duration-300 md:hidden",
              side === "left" ? "left-0" : "right-0",
              openMobile
                ? "translate-x-0"
                : side === "left"
                ? "-translate-x-full"
                : "translate-x-full",
              sidebarVariants({ variant, side }),
              className
            )}
            {...props}
          >
            {children}
          </div>
        </>
      )
    }

    return (
      <div
        ref={ref}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        className={cn(
          "relative h-screen transition-[width] duration-300 ease-in-out",
          state === "collapsed" && collapsible === "icon"
            ? "w-[var(--sidebar-width-icon)]"
            : "w-[var(--sidebar-width)]",
          collapsible === "offcanvas" && state === "collapsed" && "w-0",
          sidebarVariants({ variant, side, collapsible }),
          className
        )}
        {...props}
      >
        <div className="flex h-full flex-col">
          {children}
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// ============================================================================
// SidebarTrigger Component
// ============================================================================

interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  asChild?: boolean
}

export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, onClick, asChild = false, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-sidebar="trigger"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        aria-label="Toggle sidebar"
        {...props}
      >
        <PanelLeft className="h-4 w-4" />
      </Comp>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

// ============================================================================
// SidebarRail Component
// ============================================================================

export const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarRail.displayName = "SidebarRail"

// ============================================================================
// SidebarInset Component
// ============================================================================

export const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"main">>(
  ({ className, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "relative flex min-h-screen flex-1 flex-col bg-background",
          "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarInset.displayName = "SidebarInset"

// ============================================================================
// SidebarHeader Component
// ============================================================================

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="header"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"

// ============================================================================
// SidebarFooter Component
// ============================================================================

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="footer"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    )
  }
)
SidebarFooter.displayName = "SidebarFooter"

// ============================================================================
// SidebarContent Component
// ============================================================================

export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <ScrollArea
        ref={ref}
        data-sidebar="content"
        className={cn("flex-1 overflow-auto", className)}
        {...props}
      />
    )
  }
)
SidebarContent.displayName = "SidebarContent"

// ============================================================================
// SidebarGroup Component
// ============================================================================

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
      />
    )
  }
)
SidebarGroup.displayName = "SidebarGroup"

// ============================================================================
// SidebarGroupLabel Component
// ============================================================================

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// ============================================================================
// SidebarGroupAction Component
// ============================================================================

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

// ============================================================================
// SidebarGroupContent Component
// ============================================================================

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
)
SidebarGroupContent.displayName = "SidebarGroupContent"

// ============================================================================
// SidebarMenu Component
// ============================================================================

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
)
SidebarMenu.displayName = "SidebarMenu"

// ============================================================================
// SidebarMenuItem Component
// ============================================================================

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

// ============================================================================
// SidebarMenuButton Component
// ============================================================================

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<"button">,
  VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<"div">
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = { children: tooltip }
    }

    return (
      <div
        className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
        title={state === "collapsed" && !isMobile && typeof tooltip.children === "string" ? tooltip.children : undefined}
      >
        {button}
      </div>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// ============================================================================
// SidebarMenuAction Component
// ============================================================================

export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

// ============================================================================
// SidebarMenuBadge Component
// ============================================================================

export const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-sidebar="menu-badge"
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
)
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// ============================================================================
// SidebarMenuSkeleton Component
// ============================================================================

export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  const [width, setWidth] = React.useState("50%")

  React.useEffect(() => {
    setWidth(`${Math.floor(Math.random() * 40) + 50}%`)
  }, [])

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <div className="size-4 animate-pulse rounded-md bg-sidebar-accent" />
      )}
      <div
        className="h-4 max-w-[--skeleton-width] flex-1 animate-pulse rounded-md bg-sidebar-accent"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// ============================================================================
// SidebarMenuSub Component
// ============================================================================

export const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
)
SidebarMenuSub.displayName = "SidebarMenuSub"

// ============================================================================
// SidebarMenuSubItem Component
// ============================================================================

export const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ ...props }, ref) => <li ref={ref} {...props} />
)
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// ============================================================================
// SidebarMenuSubButton Component
// ============================================================================

export const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
    size?: "sm" | "md"
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/50",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

// ============================================================================
// SidebarSeparator Component
// ============================================================================

export const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border h-px", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"
