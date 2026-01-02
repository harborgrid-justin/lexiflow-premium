'use client';

/**
 * Breadcrumb Component - Navigation breadcrumb trail
 * Shows current location in the application hierarchy
 */

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 dark:text-slate-50 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
