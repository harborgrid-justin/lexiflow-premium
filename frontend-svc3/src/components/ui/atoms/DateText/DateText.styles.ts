import { cn } from '@/utils/cn';

interface Theme {
  text: {
    secondary: string;
  };
}

export const containerStyles = (theme: unknown) => cn('flex items-center text-xs', (theme as Theme).text.secondary);

export const iconStyles = 'h-3 w-3 mr-1 opacity-70';