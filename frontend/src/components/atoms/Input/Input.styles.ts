import { cn } from '@/lib/cn';

export const labelStyles = 'block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5 text-text-muted';

export const inputBaseStyles = 'w-full h-10 px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed bg-background text-text';

export const getInputStyles = (error: boolean) => cn(
  inputBaseStyles,
  error 
    ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error" 
    : "border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
);

export const errorStyles = 'mt-1 text-xs font-medium text-error';