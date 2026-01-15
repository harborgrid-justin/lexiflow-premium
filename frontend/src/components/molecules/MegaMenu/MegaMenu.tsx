/**
 * @module components/ui/molecules/MegaMenu
 * @category UI Components
 * @description Enterprise mega menu for complex hierarchical navigation with categories and quick actions.
 */

import { useTheme } from "@/hooks/useTheme";
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/cn';
import { ChevronDown, LucideIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

// ========================================
// TYPES & INTERFACES
// ========================================
export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export interface MegaMenuProps {
  /** Trigger button label */
  label: string;
  /** Menu sections */
  sections: MegaMenuSection[];
  /** Trigger icon (optional) */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
  /** Show featured items at top */
  featuredItems?: MegaMenuItem[];
}

// ========================================
// HELPER FUNCTIONS
// ========================================
const getBadgeStyles = (variant: MegaMenuItem['badgeVariant'] = 'primary') => {
  switch (variant) {
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'warning':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'primary':
    default:
      return cn('bg-blue-100 dark:bg-blue-900/30', 'text-blue-700 dark:text-blue-400');
  }
};

// ========================================
// COMPONENT
// ========================================
export const MegaMenu: React.FC<MegaMenuProps> = ({
  label,
  sections,
  icon: Icon,
  className,
  featuredItems = [],
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  const handleItemClick = (item: MegaMenuItem) => {
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm',
          theme.text.primary,
          `hover:${theme.surface.highlight}`,
          isOpen && theme.surface.highlight
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Mega Menu Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 w-[800px] rounded-lg shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200',
            theme.surface.default,
            theme.border.default
          )}
        >
          <div className="p-6">
            {/* Featured Items */}
            {featuredItems.length > 0 && (
              <div className="mb-6">
                <h3
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider mb-3',
                    theme.text.tertiary
                  )}
                >
                  Featured
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {featuredItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-all text-left',
                          theme.border.default,
                          `hover:${theme.surface.highlight}`,
                          'hover:shadow-md',
                          'group'
                        )}
                      >
                        {ItemIcon && (
                          <div
                            className={cn(
                              'p-2 rounded-lg',
                              theme.primary.main,
                              'bg-opacity-10',
                              'group-hover:bg-opacity-20',
                              'transition-all'
                            )}
                          >
                            <ItemIcon
                              className={cn('w-5 h-5', theme.primary.text)}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={cn(
                                'text-sm font-semibold truncate',
                                theme.text.primary
                              )}
                            >
                              {item.label}
                            </h4>
                            {item.badge && (
                              <span
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                                  getBadgeStyles(item.badgeVariant)
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p
                              className={cn(
                                'text-xs line-clamp-2',
                                theme.text.secondary
                              )}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu Sections */}
            <div className="grid grid-cols-3 gap-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h3
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider mb-3 px-2',
                      theme.text.tertiary
                    )}
                  >
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left group',
                            `hover:${theme.surface.highlight}`
                          )}
                        >
                          {ItemIcon && (
                            <ItemIcon
                              className={cn(
                                'w-4 h-4',
                                theme.text.tertiary,
                                `group-hover:${theme.primary.text}`
                              )}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-sm truncate',
                                  theme.text.primary
                                )}
                              >
                                {item.label}
                              </span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                                    getBadgeStyles(item.badgeVariant)
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p
                                className={cn(
                                  'text-xs truncate',
                                  theme.text.tertiary
                                )}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            className={cn(
              'px-6 py-3 border-t flex items-center justify-between',
              theme.border.default,
              theme.surface.highlight
            )}
          >
            <span className={cn('text-xs', theme.text.secondary)}>
              Need help? Contact support
            </span>
            <button
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded transition-colors',
                theme.primary.text,
                `hover:${theme.primary.main}`
              )}
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

MegaMenu.displayName = 'MegaMenu';
