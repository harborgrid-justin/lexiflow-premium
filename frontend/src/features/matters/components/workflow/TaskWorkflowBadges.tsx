
import React from 'react';
import { useTheme } from '../../../providers/ThemeContext';
import { cn } from '@utils/cn';

interface TaskWorkflowBadgesProps {
  status: string | 'Pending' | 'In Progress' | 'Review' | 'Done';
}

export const TaskWorkflowBadges: React.FC<TaskWorkflowBadgesProps> = ({ status }) => {
  const { theme } = useTheme();

  let styles = cn(theme.status.neutral.bg, theme.status.neutral.text, theme.status.neutral.border);
  
  switch(status) {
    case 'In Progress':
      styles = cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);
      break;
    case 'Review':
      styles = cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border); // Using warning theme for review (purple override if preferred)
      break;
    case 'Done':
      styles = cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
      break;
    case 'Pending':
      styles = cn(theme.surface.highlight, theme.text.tertiary, theme.border.default);
      break;
  }

  return (
    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", styles)}>
      {status}
    </span>
  );
};
