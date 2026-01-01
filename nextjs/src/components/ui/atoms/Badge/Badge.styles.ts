import { cn } from '@/utils/cn';
import type { ThemeStateValue } from '@/providers/ThemeContext.types';

export const baseBadgeStyles = 'inline-flex items-center justify-center px-2.5 h-5 rounded-full text-[10px] font-bold border ring-1 ring-inset ring-black/5 uppercase tracking-wide whitespace-nowrap';

export const getBadgeVariantStyles = (theme: ThemeStateValue['theme'], variant: string) => {
  switch (variant) {
    case 'success': return cn((theme as any).status.success.bg, (theme as any).status.success.text, (theme as any).status.success.border);
    case 'warning': return cn((theme as any).status.warning.bg, (theme as any).status.warning.text, (theme as any).status.warning.border);
    case 'error': return cn((theme as any).status.error.bg, (theme as any).status.error.text, (theme as any).status.error.border);
    case 'info': return cn((theme as any).status.info.bg, (theme as any).status.info.text, (theme as any).status.info.border);
    case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/10 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default: return cn((theme as any).status.neutral.bg, (theme as any).status.neutral.text, (theme as any).status.neutral.border);
  }
};
