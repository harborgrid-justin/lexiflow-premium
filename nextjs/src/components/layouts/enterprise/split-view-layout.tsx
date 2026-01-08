/**
 * @component SplitViewLayout
 * @description Enterprise-grade list-detail split view layout
 *
 * Features:
 * - Left panel: List/table of items (resizable, min 300px, max 600px)
 * - Right panel: Detail view of selected item
 * - Resize handle between panels with smooth drag interaction
 * - Mobile: Stack vertically with slide drawer for detail view
 * - Keyboard navigation (Tab, Escape)
 * - Persistent panel size in localStorage
 * - Empty state when no item selected
 *
 * @example
 * ```tsx
 * <SplitViewLayout
 *   listComponent={
 *     <CaseList
 *       cases={cases}
 *       onSelectCase={setSelectedCase}
 *       selectedCaseId={selectedCase?.id}
 *     />
 *   }
 *   detailComponent={
 *     selectedCase ? (
 *       <CaseDetail case={selectedCase} />
 *     ) : (
 *       <EmptyState message="Select a case to view details" />
 *     )
 *   }
 *   defaultSplit={400}
 *   minPanelSize={300}
 *   maxPanelSize={600}
 *   storageKey="cases-split-view"
 * />
 * ```
 */

"use client"

import * as React from "react"
import { GripVertical, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/shadcn/drawer"

export interface SplitViewLayoutProps {
  /**
   * Left panel content (list/table)
   */
  listComponent: React.ReactNode

  /**
   * Right panel content (detail view)
   */
  detailComponent: React.ReactNode

  /**
   * Default split position in pixels
   * @default 400
   */
  defaultSplit?: number

  /**
   * Minimum left panel size in pixels
   * @default 300
   */
  minPanelSize?: number

  /**
   * Maximum left panel size in pixels
   * @default 600
   */
  maxPanelSize?: number

  /**
   * LocalStorage key for persisting panel size
   */
  storageKey?: string

  /**
   * Mobile breakpoint in pixels
   * @default 1024
   */
  mobileBreakpoint?: number

  /**
   * Show detail as drawer on mobile
   * @default true
   */
  mobileDrawer?: boolean

  /**
   * Control drawer open state (mobile)
   */
  isDetailOpen?: boolean

  /**
   * Drawer close handler (mobile)
   */
  onDetailClose?: () => void

  /**
   * Detail panel title (mobile drawer)
   */
  detailTitle?: string

  /**
   * Additional class names
   */
  className?: string

  /**
   * Show resize handle
   * @default true
   */
  showResizeHandle?: boolean
}

export function SplitViewLayout({
  listComponent,
  detailComponent,
  defaultSplit = 400,
  minPanelSize = 300,
  maxPanelSize = 600,
  storageKey,
  mobileBreakpoint = 1024,
  mobileDrawer = true,
  isDetailOpen,
  onDetailClose,
  detailTitle,
  className,
  showResizeHandle = true,
}: SplitViewLayoutProps) {
  const [leftWidth, setLeftWidth] = React.useState(defaultSplit)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Load saved split position from localStorage
  React.useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed)) {
          setLeftWidth(Math.min(Math.max(parsed, minPanelSize), maxPanelSize))
        }
      }
    }
  }, [storageKey, minPanelSize, maxPanelSize])

  // Detect mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [mobileBreakpoint])

  // Handle mouse drag
  const handleMouseDown = React.useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left

      const clampedWidth = Math.min(
        Math.max(newWidth, minPanelSize),
        maxPanelSize
      )

      setLeftWidth(clampedWidth)
    },
    [isDragging, minPanelSize, maxPanelSize]
  )

  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Save to localStorage
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, leftWidth.toString())
      }
    }
  }, [isDragging, leftWidth, storageKey])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Touch support for mobile/tablet
  const handleTouchStart = React.useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return

      const touch = e.touches[0]
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = touch.clientX - containerRect.left

      const clampedWidth = Math.min(
        Math.max(newWidth, minPanelSize),
        maxPanelSize
      )

      setLeftWidth(clampedWidth)
    },
    [isDragging, minPanelSize, maxPanelSize]
  )

  const handleTouchEnd = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(storageKey, leftWidth.toString())
      }
    }
  }, [isDragging, leftWidth, storageKey])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("touchend", handleTouchEnd)
      return () => {
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [isDragging, handleTouchMove, handleTouchEnd])

  // Mobile drawer view
  if (isMobile && mobileDrawer) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {listComponent}
        <Drawer open={isDetailOpen} onOpenChange={onDetailClose}>
          <DrawerContent className="h-[85vh]">
            <DrawerHeader className="border-b">
              <div className="flex items-center justify-between">
                <DrawerTitle>{detailTitle || "Details"}</DrawerTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDetailClose}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto p-4">{detailComponent}</div>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  // Mobile stacked view (no drawer)
  if (isMobile && !mobileDrawer) {
    return (
      <div className={cn("flex flex-col h-full space-y-4", className)}>
        <div className="flex-shrink-0">{listComponent}</div>
        <div className="flex-1 overflow-y-auto">{detailComponent}</div>
      </div>
    )
  }

  // Desktop split view
  return (
    <div
      ref={containerRef}
      className={cn("flex h-full overflow-hidden", className)}
      style={{ cursor: isDragging ? "col-resize" : "default" }}
    >
      {/* Left Panel */}
      <div
        className="flex-shrink-0 overflow-y-auto border-r bg-background"
        style={{ width: `${leftWidth}px` }}
      >
        {listComponent}
      </div>

      {/* Resize Handle */}
      {showResizeHandle && (
        <div
          className={cn(
            "group relative flex-shrink-0 w-1 bg-border hover:bg-primary/20 transition-colors cursor-col-resize",
            isDragging && "bg-primary/40"
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setLeftWidth((prev) => Math.max(prev - 20, minPanelSize))
            } else if (e.key === "ArrowRight") {
              setLeftWidth((prev) => Math.min(prev + 20, maxPanelSize))
            }
          }}
        >
          <div
            className={cn(
              "absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
              isDragging && "opacity-100"
            )}
          >
            <div className="rounded-sm bg-border p-0.5">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Right Panel */}
      <div className="flex-1 overflow-y-auto bg-background">
        {detailComponent}
      </div>
    </div>
  )
}

/**
 * Empty state component for detail panel
 */
export function SplitViewEmptyState({
  title = "No item selected",
  description = "Select an item from the list to view details",
  icon: Icon,
  className,
}: {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full p-8 text-center",
        className
      )}
    >
      {Icon && <Icon className="h-16 w-16 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}
