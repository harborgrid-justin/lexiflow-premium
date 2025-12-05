
import React, { memo } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export const TableContainer = memo(function TableContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { theme } = useTheme();
  return (
    <div className={cn(theme.surface, theme.border.default, "rounded-lg border shadow-sm overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto flex-1 w-full">
        <table className={cn("min-w-full divide-y", theme.border.default)}>
          {children}
        </table>
      </div>
    </div>
  );
});

export const TableHeader = memo(function TableHeader({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <thead className={cn(theme.surfaceHighlight, "border-b", theme.border.default)}>
      <tr>{children}</tr>
    </thead>
  );
});

export const TableBody = memo(function TableBody({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <tbody className={cn(theme.surface, "divide-y", theme.border.light)}>
      {children}
    </tbody>
  );
});

export const TableRow = memo(function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  const { theme } = useTheme();
  return (
    <tr 
      className={cn(`hover:${theme.surfaceHighlight} transition-colors group`, className)} 
      {...props}
      style={{ 'contentVisibility': 'auto' } as any} 
    >
      {children}
    </tr>
  );
});

export const TableHead = memo(function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  const { theme } = useTheme();
  return (
    <th 
      className={cn(
        "px-6 py-3 text-left text-xs font-bold uppercase tracking-wider sticky top-0 z-10 select-none border-b",
        theme.surfaceHighlight,
        theme.text.secondary,
        theme.border.default,
        className
      )} 
      {...props}
    >
      {children}
    </th>
  );
});

export const TableCell = memo(function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const { theme } = useTheme();
  return (
    <td className={cn("px-6 py-4 text-sm whitespace-nowrap", theme.text.primary, className)} {...props}>
      {children}
    </td>
  );
});
