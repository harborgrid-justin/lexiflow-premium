/**
 * Global error display component
 */

import { AlertCircle } from 'lucide-react';
import React from 'react';

export interface GlobalErrorsProps {
  errors: Record<string, string>;
}

export const GlobalErrors: React.FC<GlobalErrorsProps> = ({ errors }) => {
  if (!errors.submit) return null;

  return (
    <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">{errors.submit}</span>
      </div>
    </div>
  );
};
