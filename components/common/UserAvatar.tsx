
import React from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  indicatorStatus?: 'online' | 'offline' | 'busy' | 'away';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md', className = '', indicatorStatus }) => {
  const { theme } = useTheme();

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  const indicatorColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500'
  };

  const displayName = name || '?';
  const initials = displayName.substring(0, 2).toUpperCase();
  const charCode = displayName.charCodeAt(0) || 0;
  
  let colorClass = cn(theme.status.info.bg, theme.status.info.text, theme.status.info.border);

  if (charCode % 4 === 1) {
     colorClass = cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border);
  } else if (charCode % 4 === 2) {
     colorClass = cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border);
  } else if (charCode % 4 === 3) {
     colorClass = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900";
  }

  return (
    <div className="relative inline-block">
      <div className={cn(
        sizeClasses[size], 
        colorClass,
        "rounded-full flex items-center justify-center font-bold shrink-0 border select-none",
        className
      )}>
        {initials}
      </div>
      {indicatorStatus && (
        <span className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2",
          theme.surface === 'bg-white' ? 'ring-white' : 'ring-slate-900', // Adapt ring to surface
          indicatorColors[indicatorStatus],
          size === 'xs' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'
        )} />
      )}
    </div>
  );
};
