/**
 * @module components/common/ContextMenu
 * @category Common
 * @description Right-click context menu with custom actions.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef, useId } from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';
import { useClickOutside } from '@/hooks/useClickOutside';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
  const menuId = useId();
  useClickOutside(menuRef as React.RefObject<HTMLElement>, onClose);

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-label="Context menu"
      className={cn(
        "fixed z-[9999] w-52 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100 border backdrop-blur-sm bg-opacity-80",
        theme.surface.default,
        theme.border.default
      )}
      style={{ top: y, left: x }}
    >
      {/* IDENTITY-STABLE KEYS: Use label as key */}
      {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
            key={item.label}
            onClick={() => { item.action(); onClose(); }}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                item.danger
                ? cn('text-red-600', 'hover:bg-red-50', 'dark:hover:bg-red-900/20')
                : cn(theme.text.primary, `hover:${theme.surface.highlight}`)
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
