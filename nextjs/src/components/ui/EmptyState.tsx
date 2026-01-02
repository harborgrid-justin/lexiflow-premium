'use client';

/**
 * Empty State Component - Display when no data available
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <div className="text-slate-400 dark:text-slate-600 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
