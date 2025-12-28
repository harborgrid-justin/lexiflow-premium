import { cn } from '@/utils/cn';

export const labelStyles = (theme: any) => cn('block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5', theme.text.secondary);

export const textAreaBaseStyles = 'w-full px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

export const getTextAreaStyles = (theme: any) => cn(
  textAreaBaseStyles,
  theme.surface.input,
  theme.border.default,
  theme.text.primary,
  theme.border.focused
);
