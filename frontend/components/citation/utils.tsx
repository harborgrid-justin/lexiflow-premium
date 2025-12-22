/**
 * Utility functions for Citation components
 * Extracted from individual component files for better organization and reusability
 */

import React from 'react';
import { CheckCircle, AlertTriangle, X, Book, Scale, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Sanitize HTML string by removing script tags, iframes, and event handlers
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  return html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
             .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
             .replace(/on\w+="[^"]*"/g, "");
};

/**
 * Get icon component for Shepard's signal status
 * @param signal - Shepard's signal status (Positive, Caution, Negative)
 * @returns React element with appropriate icon and color
 */
export const getSignalIcon = (signal?: string): React.ReactNode => {
  switch(signal) {
    case 'Positive': return <CheckCircle className="h-4 w-4 text-green-500"/>;
    case 'Caution': return <AlertTriangle className="h-4 w-4 text-amber-500"/>;
    case 'Negative': return <X className="h-4 w-4 text-red-500"/>;
    default: return <Book className="h-4 w-4 text-slate-400"/>;
  }
};

/**
 * Get icon component for citation type
 * @param type - Citation type (Case Law, Statute, etc.)
 * @param theme - Theme object for consistent styling
 * @returns React element with appropriate icon
 */
export const getTypeIcon = (type: string, theme: unknown): React.ReactNode => {
  if (type === 'Case Law') return <Scale className={cn("h-4 w-4", theme.text.secondary)}/>;
  if (type === 'Statute') return <FileText className={cn("h-4 w-4", theme.text.secondary)}/>;
  return <Book className={cn("h-4 w-4", theme.text.secondary)}/>;
};
