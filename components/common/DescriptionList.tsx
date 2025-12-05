
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface DescriptionItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const DescriptionList: React.FC<{ children: React.ReactNode; className?: string; cols?: number }> = ({ children, className = '', cols = 2 }) => {
  const gridCols = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 md:grid-cols-2' : cols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={cn(`grid ${gridCols} gap-6`, className)}>
      {children}
    </div>
  );
};

export const DescriptionItem: React.FC<DescriptionItemProps> = ({ label, value, className = '' }) => {
  const { theme } = useTheme();
  return (
    <div className={className}>
      <dt className={cn("text-xs font-bold uppercase mb-1", theme.text.secondary)}>{label}</dt>
      <dd className={cn("text-sm font-medium break-words", theme.text.primary)}>{value}</dd>
    </div>
  );
};
