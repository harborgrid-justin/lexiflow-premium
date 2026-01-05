/**
 * @module components/common/ActionMenu
 * @category Common
 * @description Dropdown action menu with icons.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useRef, useId } from 'react';
import { MoreVertical } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useClickOutside } from '@/hooks/useClickOutside';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
  const menuId = useId();
  const buttonId = useId();

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        id={buttonId}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={cn("p-1 rounded-full transition-colors", theme.text.tertiary, `hover:${theme.surface.highlight}`, `hover:${theme.text.secondary}`)}
        aria-label="More actions"
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div id={menuId} className={cn("absolute right-0 mt-2 w-40 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in-95 duration-100", theme.surface.default, theme.border.default, "border")}>
          <div className="py-1" role="menu" aria-labelledby={buttonId}>
            {/* IDENTITY-STABLE KEYS: Use label as key */}
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs flex items-center gap-2 transition-colors",
                    action.variant === 'danger'
                      ? cn(theme.status.error.text, theme.action.danger.hover)
                      : cn(theme.text.primary, `hover:${theme.surface.highlight}`)
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
