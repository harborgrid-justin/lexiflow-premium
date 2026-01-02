'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Page Header Component
 * Displays page title, description, and action buttons
 */
export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
