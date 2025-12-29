import { cn } from '@/utils/cn';

export const getSuccessStyles = (theme: unknown) => cn(theme.status.success.text, theme.status.success.bg, theme.status.success.border);
