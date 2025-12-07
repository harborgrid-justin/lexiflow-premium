
import React, { memo } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export const TableContainer = memo(function TableContainer({ children, className = '', responsive }: { children: React.ReactNode; className?: string; responsive?: 'card' }) {
  const { theme } = useTheme();
  
  let finalChildren = children;

  if (responsive === 'card') {
    const childrenArray = React.Children.toArray(children);
    const header = childrenArray.find(c => React.isValidElement(c) && c.type === TableHeader) as React.ReactElement | undefined;
    const body = childrenArray.find(c => React.isValidElement(c) && c.type === TableBody) as React.ReactElement | undefined;
    const others = childrenArray.filter(c => React.isValidElement(c) && c.type !== TableHeader && c.type !== TableBody);

    if (header && body) {
        const headerCells = React.Children.toArray((header as React.ReactElement<{ children: React.ReactNode }>).props.children);
        const headerLabels = headerCells.map(th => {
            const child = React.isValidElement(th) ? (th as React.ReactElement<{ children: React.ReactNode }>).props.children : null;
            if (typeof child === 'string') return child;
            if (React.isValidElement(child) && typeof (child as React.ReactElement<{ children: React.ReactNode }>).props.children === 'string') {
                return (child as React.ReactElement<{ children: React.ReactNode }>).props.children;
            }
            return '';
        });

        const newBody = React.cloneElement(
            body as React.ReactElement,
            {},
            React.Children.map((body as React.ReactElement<{ children: React.ReactNode }>).props.children, (row: React.ReactNode) => {
                if (!React.isValidElement(row)) return row;
                return React.cloneElement(
                    row as React.ReactElement,
                    {},
                    React.Children.map((row as React.ReactElement<{ children: React.ReactNode }>).props.children, (cell: React.ReactNode, cellIndex: number) => {
                        if (!React.isValidElement(cell)) return cell;
                        return React.cloneElement(cell as React.ReactElement, { ['data-label' as string]: headerLabels[cellIndex] || '' });
                    })
                );
            })
        );
        finalChildren = [header, newBody, ...others].filter(Boolean);
    }
  }

  return (
    <div className={cn(theme.surface.default, theme.border.default, "rounded-xl border shadow-sm overflow-hidden flex flex-col", className)}>
      <div className="overflow-x-auto flex-1 w-full">
        <table className={cn("min-w-full", responsive === 'card' ? 'responsive-card-table' : `divide-y ${theme.border.default}`)}>
          {finalChildren}
        </table>
      </div>
    </div>
  );
});

export const TableHeader = memo(function TableHeader({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <thead className={cn(theme.surface.highlight, "border-b", theme.border.default)}>
      <tr>{children}</tr>
    </thead>
  );
});

export const TableBody = memo(function TableBody({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <tbody className={cn(theme.surface.default, "divide-y", theme.border.subtle)}>
      {children}
    </tbody>
  );
});

export const TableRow = memo(function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  const { theme } = useTheme();
  return (
    <tr
      className={cn(`hover:${theme.surface.highlight} transition-colors group h-14`, className)}
      {...props}
      style={{ contentVisibility: 'auto' } as React.CSSProperties}
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
        "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0 z-10 select-none border-b whitespace-nowrap h-11",
        theme.surface.highlight,
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
    <td className={cn("px-6 py-3 text-sm whitespace-nowrap align-middle", theme.text.primary, className)} {...props}>
      {children}
    </td>
  );
});