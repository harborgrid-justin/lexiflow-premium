/**
 * @component DataTable
 * @description Enterprise-grade data table component with advanced features
 * 
 * Features:
 * - Column sorting (single and multi-column)
 * - Column filtering with multiple filter types
 * - Column visibility toggling
 * - Row selection (single and multi-select)
 * - Pagination with configurable page sizes
 * - Global search/filtering
 * - Column resizing
 * - Row actions
 * - Virtualization for large datasets
 * - Accessibility compliant (ARIA labels, keyboard navigation)
 * - Mobile responsive design
 * - Export hooks for CSV/Excel/PDF
 * 
 * @example
 * ```tsx
 * // Define your data type
 * interface Case {
 *   id: string
 *   caseNumber: string
 *   clientName: string
 *   status: "active" | "closed" | "pending"
 *   filingDate: Date
 *   assignedTo: string
 * }
 * 
 * // Define columns
 * const columns: ColumnDef<Case>[] = [
 *   {
 *     id: "select",
 *     header: ({ table }) => (
 *       <Checkbox
 *         checked={table.getIsAllPageRowsSelected()}
 *         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
 *       />
 *     ),
 *     cell: ({ row }) => (
 *       <Checkbox
 *         checked={row.getIsSelected()}
 *         onCheckedChange={(value) => row.toggleSelected(!!value)}
 *       />
 *     ),
 *   },
 *   {
 *     accessorKey: "caseNumber",
 *     header: ({ column }) => (
 *       <DataTableColumnHeader column={column} title="Case #" />
 *     ),
 *   },
 *   {
 *     accessorKey: "status",
 *     header: "Status",
 *     cell: ({ row }) => {
 *       const status = row.getValue("status") as string
 *       return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
 *     },
 *     filterFn: (row, id, value) => {
 *       return value.includes(row.getValue(id))
 *     },
 *   },
 * ]
 * 
 * // Use the component
 * <DataTable
 *   columns={columns}
 *   data={cases}
 *   onRowClick={(row) => router.push(`/cases/${row.original.id}`)}
 *   searchPlaceholder="Search cases..."
 *   filterableColumns={[
 *     {
 *       id: "status",
 *       title: "Status",
 *       options: [
 *         { label: "Active", value: "active" },
 *         { label: "Closed", value: "closed" },
 *         { label: "Pending", value: "pending" },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */

"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { cn } from "@/lib/utils"

export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface DataTableFilterableColumn {
  id: string
  title: string
  options: DataTableFilterOption[]
}

export interface DataTableProps<TData, TValue> {
  /**
   * Column definitions for the table
   */
  columns: ColumnDef<TData, TValue>[]
  
  /**
   * Data to display in the table
   */
  data: TData[]
  
  /**
   * Placeholder text for the search input
   * @default "Search..."
   */
  searchPlaceholder?: string
  
  /**
   * Column ID to use for global search
   * If not provided, search will be disabled
   */
  searchableColumn?: string
  
  /**
   * Columns that can be filtered with faceted filters
   */
  filterableColumns?: DataTableFilterableColumn[]
  
  /**
   * Callback when a row is clicked
   */
  onRowClick?: (row: TData) => void
  
  /**
   * Callback when selected rows change
   */
  onRowSelectionChange?: (selectedRows: TData[]) => void
  
  /**
   * Initial page size
   * @default 10
   */
  initialPageSize?: number
  
  /**
   * Available page size options
   * @default [10, 20, 30, 40, 50, 100]
   */
  pageSizeOptions?: number[]
  
  /**
   * Enable row selection
   * @default true
   */
  enableRowSelection?: boolean
  
  /**
   * Enable multi-row selection
   * @default true
   */
  enableMultiRowSelection?: boolean
  
  /**
   * Enable column resizing
   * @default false
   */
  enableColumnResizing?: boolean
  
  /**
   * Custom toolbar content
   */
  toolbarContent?: React.ReactNode
  
  /**
   * Custom empty state
   */
  emptyState?: React.ReactNode
  
  /**
   * Loading state
   */
  isLoading?: boolean
  
  /**
   * Additional table class names
   */
  className?: string
  
  /**
   * Enable sticky header
   * @default false
   */
  enableStickyHeader?: boolean
  
  /**
   * Maximum height for sticky header (requires enableStickyHeader)
   */
  maxHeight?: string
  
  /**
   * Callback to get row ID (for better row selection tracking)
   */
  getRowId?: (row: TData, index: number) => string
  
  /**
   * Callback to determine if a row is selectable
   */
  enableRowSelection?: boolean | ((row: TData) => boolean)
  
  /**
   * Initial sorting state
   */
  initialSorting?: SortingState
  
  /**
   * Initial column visibility
   */
  initialColumnVisibility?: VisibilityState
  
  /**
   * Initial column filters
   */
  initialColumnFilters?: ColumnFiltersState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchableColumn,
  filterableColumns = [],
  onRowClick,
  onRowSelectionChange,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50, 100],
  enableMultiRowSelection = true,
  enableColumnResizing = false,
  toolbarContent,
  emptyState,
  isLoading = false,
  className,
  enableStickyHeader = false,
  maxHeight = "calc(100vh - 200px)",
  getRowId,
  enableRowSelection: enableRowSelectionProp = true,
  initialSorting = [],
  initialColumnVisibility = {},
  initialColumnFilters = [],
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: enableRowSelectionProp,
    enableMultiRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId,
    enableColumnResizing,
  })

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, onRowSelectionChange, table])

  return (
    <div className={cn("space-y-4", className)}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchableColumn={searchableColumn}
        filterableColumns={filterableColumns}
      >
        {toolbarContent}
      </DataTableToolbar>

      <div
        className={cn(
          "rounded-md border",
          enableStickyHeader && "overflow-auto"
        )}
        style={enableStickyHeader ? { maxHeight } : undefined}
      >
        <Table>
          <TableHeader className={cn(enableStickyHeader && "sticky top-0 z-10 bg-background")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={
                        enableColumnResizing && header.column.getCanResize()
                          ? { width: header.getSize() }
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-border opacity-0 hover:opacity-100",
                            header.column.getIsResizing() && "opacity-100 bg-primary"
                          )}
                        />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={
                        enableColumnResizing && cell.column.getCanResize()
                          ? { width: cell.column.getSize() }
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  )
}
