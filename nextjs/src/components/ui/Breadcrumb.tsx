'use client';

import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * Displays hierarchical navigation path with links to parent pages
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-1 text-sm',
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          )}
          {item.href && !item.current ? (
            <Link
              href={item.href}
              className={cn(
                'text-blue-600 dark:text-blue-400 hover:underline'
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                'text-slate-900 dark:text-slate-100',
                item.current && 'font-semibold'
              )}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
