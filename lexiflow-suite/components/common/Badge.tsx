
import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    error: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    info: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    neutral: "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10",
    purple: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10"
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset
      ${variants[variant]} ${className}
    `}>
      {children}
    </span>
  );
};
