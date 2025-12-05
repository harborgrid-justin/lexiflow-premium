
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const { theme } = useTheme();
  
  return (
    <nav className={cn("flex items-center text-xs mb-4 flex-wrap", theme.text.secondary)} aria-label="Breadcrumb">
      <div className="flex items-center py-1">
         <Home className={cn("h-3 w-3 mr-1", theme.text.tertiary)} />
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className={cn("h-3 w-3 mx-1 shrink-0", theme.text.tertiary)} />
          <button 
            onClick={item.onClick}
            disabled={!item.onClick}
            className={cn(
              "transition-colors py-1 px-1 rounded -ml-1",
              item.onClick 
                ? cn(`hover:${theme.primary.text}`, `hover:${theme.surfaceHighlight}`)
                : cn("font-semibold cursor-default", theme.text.primary)
            )}
          >
            {item.label}
          </button>
        </div>
      ))}
    </nav>
  );
};
