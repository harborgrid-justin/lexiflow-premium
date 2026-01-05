
import React from 'react';
import { Skeleton } from './Primitives.tsx';

export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
    <div className="overflow-x-auto flex-1 w-full">
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-50 border-b border-slate-200">
    <tr>{children}</tr>
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="bg-white divide-y divide-slate-100">
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-slate-50/80 transition-colors group ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th 
    className={`
      px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider 
      sticky top-0 bg-slate-50 z-10 border-b border-slate-200 select-none
      ${className}
    `} 
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 text-sm whitespace-nowrap text-slate-700 ${className}`} {...props}>
    {children}
  </td>
);

// Enhanced Table Skeleton (Principle 1 & 4)
// Allows precise matching of row heights to prevent CLS
interface TableSkeletonProps {
    rows?: number;
    cols?: number;
    rowClassName?: string;
    cellClassName?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
    rows = 5, 
    cols = 4,
    rowClassName = "h-16",
    cellClassName = "px-6 py-4"
}) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className={`border-b border-slate-50 last:border-0 ${rowClassName}`}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <td key={j} className={cellClassName}>
                            <Skeleton className="h-4 w-full rounded" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};
