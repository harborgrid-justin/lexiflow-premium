/**
 * @module components/navigation/MegaMenu
 * @category Navigation
 * @description Enterprise mega menu component with multi-column layouts, featured items,
 * role-based visibility, and responsive design. Perfect for complex navigation hierarchies.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Menu background
 * - theme.text.primary/secondary - Menu text
 * - theme.border.default - Dividers and borders
 * - theme.surface.highlight - Hover states
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, ExternalLink } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';
import { useClickOutside } from '@/hooks/useClickOutside';

// Utils & Constants
import { cn } from '@/utils/cn';
import * as styles from './MegaMenu.styles';
import type { MegaMenuLayout } from './MegaMenu.styles';

// Types
import type { UserRole } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Represents a single menu item within a mega menu section
 */
export interface MegaMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  path?: string;
  /** Item description */
  description?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Badge text (e.g., "New", "Beta") */
  badge?: string;
  /** Badge color variant */
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info';
  /** Whether this is an external link */
  isExternal?: boolean;
  /** Roles that can view this item */
  allowedRoles?: UserRole[];
  /** Whether item is featured/highlighted */
  isFeatured?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Represents a section within the mega menu
 */
export interface MegaMenuSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section items */
  items: MegaMenuItem[];
  /** Optional section icon */
  icon?: LucideIcon;
  /** Roles that can view this section */
  allowedRoles?: UserRole[];
}

// MegaMenuLayout type is now imported from ./MegaMenu.styles

export interface MegaMenuProps {
  /** Trigger button label */
  label: string;
  /** Menu sections */
  sections: MegaMenuSection[];
  /** Current user's role for filtering */
  currentUserRole?: UserRole;
  /** Layout columns */
  layout?: MegaMenuLayout;
  /** Menu trigger icon */
  icon?: LucideIcon;
  /** Navigation callback */
  onNavigate?: (item: MegaMenuItem) => void;
  /** Custom className */
  className?: string;
  /** Whether menu is disabled */
  disabled?: boolean;
  /** Show featured items section */
  showFeatured?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * MegaMenu - Enterprise mega menu navigation component
 * Optimized with React.memo for performance
 */
export const MegaMenu = React.memo<MegaMenuProps>(({
  label,
  sections,
  currentUserRole,
  layout = 'triple',
  icon: Icon,
  onNavigate,
  className,
  disabled = false,
  showFeatured = true,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  });

  // Filter sections and items based on role permissions
  const visibleSections = React.useMemo(() => {
    return sections
      .filter(section => {
        if (!section.allowedRoles || section.allowedRoles.length === 0) {
          return true;
        }
        if (!currentUserRole) {
          return false;
        }
        return section.allowedRoles.includes(currentUserRole);
      })
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (!item.allowedRoles || item.allowedRoles.length === 0) {
            return true;
          }
          if (!currentUserRole) {
            return false;
          }
          return item.allowedRoles.includes(currentUserRole);
        }),
      }))
      .filter(section => section.items.length > 0);
  }, [sections, currentUserRole]);

  // Extract featured items
  const featuredItems = React.useMemo(() => {
    if (!showFeatured) return [];
    return visibleSections
      .flatMap(section => section.items)
      .filter(item => item.isFeatured)
      .slice(0, 3);
  }, [visibleSections, showFeatured]);

  // Flatten all items for keyboard navigation
  const allItems = React.useMemo(() => {
    const items: MegaMenuItem[] = [];
    if (showFeatured && featuredItems.length > 0) {
      items.push(...featuredItems);
    }
    visibleSections.forEach(section => {
      items.push(...section.items);
    });
    return items;
  }, [visibleSections, featuredItems, showFeatured]);

  const handleItemClick = (item: MegaMenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onNavigate && item.path) {
      onNavigate(item);
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1;
          return next >= allItems.length ? 0 : next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? allItems.length - 1 : next;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          handleItemClick(allItems[focusedIndex]);
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(allItems.length - 1);
        break;

      case 'Tab':
        // Allow tab to cycle through items
        if (e.shiftKey) {
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev - 1;
            return next < 0 ? allItems.length - 1 : next;
          });
        } else {
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev + 1;
            return next >= allItems.length ? 0 : next;
          });
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const element = itemRefs.current.get(focusedIndex);
      element?.focus();
    }
  }, [isOpen, focusedIndex]);

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <div className={cn(styles.megaMenuContainer, className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={styles.getTriggerButton(theme, isOpen, disabled)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${label} menu`}
        disabled={disabled}
        type="button"
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className={styles.getDropdownContainer(theme, layout)}
          role="menu"
          aria-label={`${label} menu items`}
        >
          {/* Featured Items Section */}
          {featuredItems.length > 0 && (
            <div className={styles.getFeaturedSection(theme)}>
              <h3 className={styles.getFeaturedTitle(theme)}>Featured</h3>
              <div className={styles.featuredGrid}>
                {featuredItems.map((item, index) => {
                  const ItemIcon = item.icon;
                  const isFocused = focusedIndex === index;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(index, el);
                      }}
                      onClick={() => handleItemClick(item)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      onKeyDown={handleKeyDown}
                      className={cn(
                        styles.getFeaturedItem(theme),
                        isFocused && 'ring-2 ring-blue-500 ring-offset-2'
                      )}
                      tabIndex={isOpen ? 0 : -1}
                      role="menuitem"
                    >
                      {ItemIcon && (
                        <div className={styles.getFeaturedIconContainer(theme)}>
                          <ItemIcon className={styles.featuredIcon} />
                        </div>
                      )}
                      <div className={styles.featuredContent}>
                        <div className={styles.featuredItemHeader}>
                          <span className={styles.getFeaturedItemLabel(theme)}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={styles.getBadge(item.badgeVariant || 'primary')}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className={styles.getFeaturedItemDescription(theme)}>
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

          {/* Sections Grid */}
          <div className={styles.getSectionsGrid(layout)}>
            {visibleSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              // Calculate the starting index for this section's items
              const sectionStartIndex = featuredItems.length +
                visibleSections.slice(0, sectionIndex).reduce((sum, s) => sum + s.items.length, 0);

              return (
                <div key={section.id} className={styles.section}>
                  <div className={styles.sectionHeader}>
                    {SectionIcon && <SectionIcon className={styles.sectionIcon} />}
                    <h3 className={styles.getSectionTitle(theme)}>{section.title}</h3>
                  </div>
                  <ul className={styles.sectionItems}>
                    {section.items.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      const globalIndex = sectionStartIndex + itemIndex;
                      const isFocused = focusedIndex === globalIndex;
                      return (
                        <li key={item.id}>
                          <button
                            ref={(el) => {
                              if (el) itemRefs.current.set(globalIndex, el);
                            }}
                            onClick={() => handleItemClick(item)}
                            onMouseEnter={() => setFocusedIndex(globalIndex)}
                            onKeyDown={handleKeyDown}
                            className={cn(
                              styles.getMenuItem(theme),
                              isFocused && 'ring-2 ring-blue-500 ring-inset'
                            )}
                            tabIndex={isOpen ? 0 : -1}
                            role="menuitem"
                          >
                            <div className={styles.menuItemContent}>
                              {ItemIcon && <ItemIcon className={styles.menuItemIcon} />}
                              <div className={styles.menuItemText}>
                                <div className={styles.menuItemHeader}>
                                  <span className={styles.getMenuItemLabel(theme)}>
                                    {item.label}
                                  </span>
                                  {item.isExternal && (
                                    <ExternalLink className="h-3 w-3 opacity-40" />
                                  )}
                                  {item.badge && (
                                    <span className={styles.getBadge(item.badgeVariant || 'primary')}>
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                {item.description && (
                                  <p className={styles.getMenuItemDescription(theme)}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

MegaMenu.displayName = 'MegaMenu';
