import { cn } from '@/utils/cn';

export const baseBadgeStyles = 'inline-flex items-center justify-center px-2.5 h-5 rounded-full text-[10px] font-bold border ring-1 ring-inset ring-black/5 uppercase tracking-wide whitespace-nowrap';

export const getBadgeVariantStyles = (theme: unknown, variant: string) => {
  switch (variant) {
    case 'success': return cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
    case 'warning': return cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
    case 'error': return cn(theme.status.error.bg, theme.status.error.text, theme.status.error.border);
    case 'info': return cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
    case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default: return cn(theme.status.neutral.bg, theme.status.neutral.text, theme.status.neutral.border);
  }
};
