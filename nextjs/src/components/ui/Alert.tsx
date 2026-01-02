'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  closeable?: boolean;
  onClose?: () => void;
  icon?: boolean;
}

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const iconMap: Record<AlertVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export function Alert({
  children,
  variant = 'info',
  title,
  closeable = false,
  onClose,
  icon = true,
}: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${variantStyles[variant]}`}>
      <div className="flex gap-3">
        {icon && <div className="mt-0.5 shrink-0">{iconMap[variant]}</div>}
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{children}</p>
        </div>
        {closeable && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 hover:opacity-75 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
