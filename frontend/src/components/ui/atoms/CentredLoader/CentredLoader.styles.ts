import { cn } from '@/utils/cn';

export const containerStyles = 'flex h-full w-full items-center justify-center p-8 flex-col gap-2';

export const spinnerStyles = (theme: any) => cn('animate-spin h-8 w-8', theme.primary.text);

export const messageStyles = (theme: any) => cn('text-xs', theme.text.secondary);
