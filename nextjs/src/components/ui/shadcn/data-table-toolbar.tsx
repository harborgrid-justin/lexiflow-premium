/**
 * @component DataTableToolbar
 * @description Toolbar with search, filters, and view options for the data table
 * 
 * Features:
 * - Global search
 * - Faceted filters
 * - Column visibility toggle
 * - Clear filters button
 * - Custom toolbar actions
 */

"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/shadcn/button"
import { Input } from "@/components/ui/shadcn/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import type { DataTableFilterableColumn } from "./data-table"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchableColumn?: string
  filterableColumns?: DataTableFilterableColumn[]
  children?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search...",
  searchableColumn,
  filterableColumns = [],
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchValue, setSearchValue] = React.useState("")

  React.useEffect(() => {
    if (searchableColumn) {
      const column = table.getColumn(searchableColumn)
      if (column) {
        column.setFilterValue(searchValue)
      }
    }
  }, [searchValue, searchableColumn, table])

  const handleClearFilters = () => {
    table.resetColumnFilters()
    setSearchValue("")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Search and filters */}
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
          {/* Search input */}
          {searchableColumn && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-8 w-full sm:w-[200px] lg:w-[300px]"
            />
          )}

          {/* Faceted filters */}
          {filterableColumns.length > 0 && (
            <>
              {filterableColumns.map((filterColumn) => {
                const column = table.getColumn(filterColumn.id)
                
                if (!column) return null

                return (
                  <DataTableFacetedFilter
                    key={filterColumn.id}
                    column={column}
                    title={filterColumn.title}
                    options={filterColumn.options}
                  />
                )
              })}
            </>
          )}

          {/* Clear filters button */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right side: Custom actions and view options */}
        <div className="flex items-center gap-2">
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}
