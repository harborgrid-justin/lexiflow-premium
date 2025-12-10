
import React, { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { LucideIcon } from 'lucide-react';

export interface ContextMenuItem {
  label: string;
  icon?: LucideIcon;
  action: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const { theme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, onClose);

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[9999] w-52 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100 border backdrop-blur-sm bg-opacity-80",
        theme.surface.default,
        theme.border.default
      )}
      style={{ top: y, left: x }}
    >
      {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
            key={index}
            onClick={() => { item.action(); onClose(); }}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                item.danger
                ? cn('text-red-600', 'hover:bg-red-50', 'dark:hover:bg-red-900/20')
                : cn(theme.text.primary, `hover:${theme.surfaceHighlight}`)
            )}
            >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
            </button>
          );
      })}
    </div>
  );
};
