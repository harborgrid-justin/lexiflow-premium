
import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-12 w-12 text-xl'
  };

  const initials = name.substring(0, 2).toUpperCase();
  const colors = ['bg-blue-100 text-blue-700', 'bg-slate-200 text-slate-600', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700'];
  const colorClass = colors[name.length % colors.length];

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
      role="img"
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
};
