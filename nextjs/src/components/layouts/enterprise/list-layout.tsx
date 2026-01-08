/**
 * @component ListLayout
 * @description Enterprise-grade list/table page layout with advanced features
 *
 * Features:
 * - Page header with title and action buttons
 * - Search and filter toolbar
 * - Data table with sorting, filtering, pagination
 * - Bulk actions toolbar (appears when rows selected)
 * - Column visibility controls
 * - Export buttons (CSV, PDF)
 * - Empty state when no data
 * - Loading skeleton state
 *
 * @example
 * ```tsx
 * <ListLayout
 *   title="Cases"
 *   description="Manage all legal cases"
 *   data={cases}
 *   columns={caseColumns}
 *   actions={[
 *     { label: "New Case", onClick: handleNewCase, variant: "default" },
 *     { label: "Import", onClick: handleImport, variant: "outline" }
 *   ]}
 *   filters={[
 *     {
 *       id: "status",
 *       title: "Status",
 *       options: [
 *         { label: "Active", value: "active" },
 *         { label: "Closed", value: "closed" }
 *       ]
 *     }
 *   ]}
 *   onExportCSV={handleExportCSV}
 *   onExportPDF={handleExportPDF}
 *   searchableColumn="caseNumber"
 *   bulkActions={[
 *     { label: "Archive", onClick: handleBulkArchive },
 *     { label: "Delete", onClick: handleBulkDelete, variant: "destructive" }
 *   ]}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Download, FileDown, FileSpreadsheet, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn/button"
import { DataTable, DataTableFilterableColumn } from "@/components/ui/shadcn/data-table"
import { Skeleton } from "@/components/ui/shadcn/skeleton"
import { Separator } from "@/components/ui/shadcn/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/shadcn/alert"

export interface ListLayoutAction {
  label: string
  onClick: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

export interface ListLayoutBulkAction {
  label: string
  onClick: (selectedRows: any[]) => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  icon?: React.ComponentType<{ className?: string }>
}

export interface ListLayoutProps<TData, TValue> {
  /**
   * Page title
   */
  title: string

  /**
   * Optional page description
   */
  description?: string

  /**
   * Table data
   */
  data: TData[]

  /**
   * Table column definitions
   */
  columns: ColumnDef<TData, TValue>[]

  /**
   * Primary action buttons in header
   */
  actions?: ListLayoutAction[]

  /**
   * Filterable columns configuration
   */
  filters?: DataTableFilterableColumn[]

  /**
   * Column to use for global search
   */
  searchableColumn?: string

  /**
   * Search placeholder text
   * @default "Search..."
   */
  searchPlaceholder?: string

  /**
   * Bulk actions available when rows are selected
   */
  bulkActions?: ListLayoutBulkAction[]

  /**
   * CSV export handler
   */
  onExportCSV?: (data: TData[]) => void

  /**
   * PDF export handler
   */
  onExportPDF?: (data: TData[]) => void

  /**
   * Custom export handlers
   */
  customExports?: Array<{
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: (data: TData[]) => void
  }>

  /**
   * Callback when row is clicked
   */
  onRowClick?: (row: TData) => void

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Error message
   */
  error?: string

  /**
   * Custom empty state
   */
  emptyState?: React.ReactNode

  /**
   * Custom toolbar content
   */
  toolbarContent?: React.ReactNode

  /**
   * Enable sticky header
   * @default false
   */
  enableStickyHeader?: boolean

  /**
   * Initial page size
   * @default 20
   */
  initialPageSize?: number

  /**
   * Available page size options
   * @default [10, 20, 30, 50, 100]
   */
  pageSizeOptions?: number[]

  /**
   * Additional class names
   */
  className?: string

  /**
   * Get unique row ID
   */
  getRowId?: (row: TData, index: number) => string
}

export function ListLayout<TData, TValue>({
  title,
  description,
  data,
  columns,
  actions = [],
  filters = [],
  searchableColumn,
  searchPlaceholder = "Search...",
  bulkActions = [],
  onExportCSV,
  onExportPDF,
  customExports = [],
  onRowClick,
  isLoading = false,
  error,
  emptyState,
  toolbarContent,
  enableStickyHeader = false,
  initialPageSize = 20,
  pageSizeOptions = [10, 20, 30, 50, 100],
  className,
  getRowId,
}: ListLayoutProps<TData, TValue>) {
  const [selectedRows, setSelectedRows] = React.useState<TData[]>([])

  const handleRowSelectionChange = React.useCallback((rows: TData[]) => {
    setSelectedRows(rows)
  }, [])

  const hasExports = onExportCSV || onExportPDF || customExports.length > 0
  const showBulkActions = selectedRows.length > 0 && bulkActions.length > 0

  if (isLoading) {
    return (
      <div className={cn("flex flex-col space-y-6", className)}>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap gap-2">
          {hasExports && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onExportCSV && (
                  <DropdownMenuItem onClick={() => onExportCSV(data)}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                )}
                {onExportPDF && (
                  <DropdownMenuItem onClick={() => onExportPDF(data)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                )}
                {customExports.map((exportOption, index) => {
                  const Icon = exportOption.icon
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => exportOption.onClick(data)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {exportOption.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || "default"}
                disabled={action.disabled}
                size="default"
              >
                {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions Toolbar */}
      {showBulkActions && (
        <>
          <div className="flex items-center gap-4 rounded-lg border bg-muted/50 px-4 py-3">
            <div className="flex-1">
              <p className="text-sm font-medium">
                {selectedRows.length} {selectedRows.length === 1 ? "row" : "rows"} selected
              </p>
            </div>
            <div className="flex gap-2">
              {bulkActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={() => action.onClick(selectedRows)}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        searchableColumn={searchableColumn}
        searchPlaceholder={searchPlaceholder}
        filterableColumns={filters}
        onRowClick={onRowClick}
        onRowSelectionChange={handleRowSelectionChange}
        initialPageSize={initialPageSize}
        pageSizeOptions={pageSizeOptions}
        enableStickyHeader={enableStickyHeader}
        emptyState={emptyState}
        getRowId={getRowId}
      >
        {toolbarContent}
      </DataTable>
    </div>
  )
}

/**
 * Loading skeleton for ListLayout
 */
export function ListLayoutSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-6", className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[300px]" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
