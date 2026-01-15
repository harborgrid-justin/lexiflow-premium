import { FileText, CheckCircle, DollarSign, Flag, Gavel, Calendar, Scroll, Briefcase } from 'lucide-react';
import { Theme } from '@/theme/types';
import { cn } from '@/lib/cn';

export const getEventIcon = (type: string) => {
  switch (type) {
    case 'document': return <FileText className="h-3 w-3" />;
    case 'task': return <CheckCircle className="h-3 w-3" />;
    case 'billing': return <DollarSign className="h-3 w-3" />;
    case 'milestone': return <Flag className="h-3 w-3" />;
    case 'motion': return <Gavel className="h-3 w-3" />;
    case 'hearing': return <Calendar className="h-3 w-3" />;
    case 'docket': return <Scroll className="h-3 w-3" />;
    default: return <Briefcase className="h-3 w-3" />;
  }
};

export const getEventColor = (type: string, theme: Theme) => {
  switch (type) {
    case 'document': return cn(theme.status.info.bg, theme.status.info.border, theme.status.info.text);
    case 'task': return cn(theme.status.success.bg, theme.status.success.border, theme.status.success.text);
    case 'billing': return cn(theme.status.warning.bg, theme.status.warning.border, theme.status.warning.text);
    case 'milestone': return cn(theme.surface.highlight, theme.border.default, theme.action.primary.text);
    case 'motion': return "bg-indigo-100 border-indigo-500 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400";
    case 'hearing': return cn(theme.status.error.bg, theme.status.error.border, theme.status.error.text);
    case 'docket': return cn(theme.surface.highlight, theme.border.default, theme.text.primary);
    default: return cn(theme.surface.highlight, theme.border.default, theme.text.tertiary);
  }
};
