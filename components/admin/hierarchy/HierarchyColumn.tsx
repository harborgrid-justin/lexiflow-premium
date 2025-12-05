
import React from 'react';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface HierarchyColumnProps {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
  widthClass?: string;
}

export const HierarchyColumn: React.FC<HierarchyColumnProps> = ({ title, onAdd, children, widthClass }) => {
  const { theme } = useTheme();
  return (
    <div className={cn("flex flex-col h-auto md:h-full shrink-0", widthClass, theme.border.default)}>
      <div className={cn("p-3 border-b flex justify-between items-center shrink-0", theme.surface, theme.border.default)}>
        <span className={cn("font-bold text-xs uppercase tracking-wide truncate max-w-[200px]", theme.text.tertiary)}>
          {title}
        </span>
        {onAdd && <button className={cn("hover:bg-blue-50 p-1 rounded", theme.text.primary)} onClick={onAdd}><Plus className="h-4 w-4"/></button>}
      </div>
      <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:block whitespace-nowrap md:whitespace-normal p-2 space-x-2 md:space-x-0 md:space-y-2">
        {children}
      </div>
    </div>
  );
};
