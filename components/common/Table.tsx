import React, { memo } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export const TableContainer = memo(function TableContainer({ children, className = '', responsive }: { children: React.ReactNode; className?: string; responsive?: 'card' }) {
  const { theme } = useTheme();
  
  let finalChildren = children;

  if (responsive === 'card') {
    const childrenArray = React.Children.toArray(children);
    const header = childrenArray.find(c => (c as React.ReactElement).type === TableHeader) as React.ReactElement | undefined;
    const body = childrenArray.find(c => (c as React.ReactElement).type === TableBody) as React.ReactElement | undefined;
    const others = childrenArray.filter(c => (c as React.ReactElement).type !== TableHeader && (c as React.ReactElement).type !== TableBody);

    if (header && body) {
        const headerCells = React.Children.toArray(header.props.children);
        const headerLabels = headerCells.map(th => {
            const child = (th as React.ReactElement).props.children;
            if (typeof child === 'string') return child;
            // Attempt to get text from a simple element, otherwise ignore
            if (React.isValidElement(child) && typeof child.props.children === 'string') {
                return child.props.children;
            }
            return '';
        });

        const newBody = React.cloneElement(
            body,
            {},
            React.Children.map(body.props.children, (row: React.ReactNode) => {
                if (!React.isValidElement(row)) return row;
                return React.cloneElement(
                    row as React.ReactElement,
                    {},
                    React.Children.map((row as React.ReactElement).props.children, (cell: React.ReactNode, cellIndex: number) => {
                        if (!React.isValidElement(cell)) return cell;
                        return React.cloneElement(cell as React.ReactElement, { 'data-label': headerLabels[cellIndex] || '' });
                    })
                );
            })
        );
        finalChildren = [header, newBody, ...others].filter(Boolean);
    }
  }

  return (
    <div className={cn(theme.surface, theme.border.default, "rounded-lg border shadow-sm overflow-hidden flex flex-col", className)}>
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