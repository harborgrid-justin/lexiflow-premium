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
    error: string;
    default: string;
    focused: string;
  };
  status: {
    error: {
      text: string;
    };
  };
}

export const labelStyles = (theme: unknown) => cn('block text-xs font-semibold uppercase tracking-wide mb-1.5 ml-0.5', (theme as Theme).text.secondary);

export const inputBaseStyles = 'w-full h-10 px-3 py-2 border rounded-md text-sm shadow-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed';

export const getInputStyles = (theme: unknown, error: boolean, mode: string) => cn(
  inputBaseStyles,
  (theme as Theme).surface.input,
  error ? (theme as Theme).border.error : cn((theme as Theme).border.default, (theme as Theme).border.focused),
  (theme as Theme).text.primary,
  mode === 'dark' ? 'color-scheme-dark' : ''
);

export const errorStyles = (theme: unknown) => cn('mt-1 text-xs font-medium', (theme as Theme).status.error.text);