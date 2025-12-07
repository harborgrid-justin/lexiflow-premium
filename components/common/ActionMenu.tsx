
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ActionItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  actions: ActionItem[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={cn("p-1 rounded-full transition-colors", theme.text.tertiary, `hover:${theme.surfaceHighlight}`, `hover:${theme.text.secondary}`)}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className={cn("absolute right-0 mt-2 w-40 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface, theme.border.default, "border")}>
          <div className="py-1" role="menu">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors",
                    action.variant === 'danger' 
                      ? cn(theme.status.error.text, `hover:${theme.status.error.bg}`)
                      : cn(theme.text.primary, `hover:${theme.surfaceHighlight}`)
                  )}
                  role="menuitem"
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
