import { cn } from '@/shared/lib/cn';

interface Theme {
  text: {
    secondary: string;
    primary: string;
  };
  surface: {
    input: string;
  };
  border: {
    default: string;
    focused: string;
  };
}

export const labelStyles = (theme: unknown) => cn('block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5', (theme as Theme).text.secondary);

export const textAreaBaseStyles = 'w-full px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

export const getTextAreaStyles = (theme: unknown) => cn(
  textAreaBaseStyles,
  (theme as Theme).surface.input,
  (theme as Theme).border.default,
  (theme as Theme).text.primary,
  (theme as Theme).border.focused
);