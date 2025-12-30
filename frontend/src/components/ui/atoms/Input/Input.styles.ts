import { cn } from '@/utils/cn';

export const labelStyles = (theme: unknown) => cn('block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5', (theme as any).text.secondary);

export const inputBaseStyles = 'w-full h-10 px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed';

export const getInputStyles = (theme: unknown, error: boolean, mode: string) => cn(
  inputBaseStyles,
  (theme as any).surface.input,
  error ? (theme as any).border.error : cn((theme as any).border.default, (theme as any).border.focused),
  (theme as any).text.primary,
  mode === 'dark' ? 'color-scheme-dark' : ''
);

export const errorStyles = (theme: unknown) => cn('mt-1 text-xs font-medium', (theme as any).status.error.text);
