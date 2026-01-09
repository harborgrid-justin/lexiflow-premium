'use client';

/**
 * Table Component - Wrapper around Shadcn Table for backward compatibility
 * Supports sorting, filtering, and pagination api
 */

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/shadcn/table";
import { cn } from "@/lib/utils";

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <div className="rounded-md border bg-background">
      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead
                key={idx}
                className={cn("whitespace-nowrap", column.width)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && onSort && (
                    <button
                      onClick={() => {
                        const newOrder =
                          sortBy === column.header && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc';
                        onSort(column.header, newOrder);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {sortBy === column.header ? (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-primary" />
                        )
                      ) : (
                        <ChevronUp className="h-3 w-3 text-muted-foreground/30" />
                      )}
                    </button>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column, colIdx) => (
                  <TableCell key={colIdx} className={cn(column.width)}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}
