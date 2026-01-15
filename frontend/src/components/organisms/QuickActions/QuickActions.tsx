/**
import React from 'react';
 * @module components/navigation/QuickActions
 * @category Navigation
 * @description Enterprise quick actions menu with role-based visibility, keyboard shortcuts,
 * and contextual actions. Provides rapid access to common tasks and workflows.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Menu background
 * - theme.text.primary/secondary - Action text
 * - theme.border.default - Menu borders
 * - theme.surface.highlight - Hover states
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { PlusCircle, X } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTheme } from '@/contexts/ThemeContext';

// Utils & Constants
import { cn } from '@/lib/cn';
import * as styles from './QuickActions.styles';

// Types
import type { UserRole } from '@/types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Represents a single quick action
 */
export interface QuickAction {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Action description */
  description?: string;
  /** Action icon */
  icon: LucideIcon;
  /** Icon color variant */
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Keyboard shortcut display */
  shortcut?: string;
  /** Actual keyboard shortcut (e.g., 'ctrl+n', 'cmd+k') */
  shortcutKey?: string;
  /** Roles that can access this action */
  allowedRoles?: UserRole[];
  /** Click handler */
  onClick: () => void;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Badge text */
  badge?: string;
}

/**
 * Represents a group of quick actions
 */
export interface QuickActionGroup {
  /** Group identifier */
  id: string;
  /** Group title */
  title?: string;
  /** Actions in this group */
  actions: QuickAction[];
  /** Roles that can view this group */
  allowedRoles?: UserRole[];
}

export interface QuickActionsProps {
  /** Action groups */
  groups: QuickActionGroup[];
  /** Current user's role for filtering */
  currentUserRole?: UserRole;
  /** Trigger button label */
  label?: string;
  /** Trigger button icon */
  icon?: LucideIcon;
  /** Custom trigger button */
  trigger?: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Position of the dropdown */
  position?: 'left' | 'right' | 'center';
  /** Whether menu is disabled */
  disabled?: boolean;
  /** Maximum width of the menu */
  maxWidth?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * QuickActions - Enterprise quick actions menu component
 * Optimized with React.memo for performance
 */
export const QuickActions = React.memo<QuickActionsProps>(function QuickActions({
  groups,
  currentUserRole,
  label = 'Quick Add',
  icon: TriggerIcon = PlusCircle,
  trigger,
  className,
  position = 'right',
  disabled = false,
  maxWidth = 'md',
}: QuickActionsProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const actionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useClickOutside(menuRef as React.RefObject<HTMLElement>, () => {
    setIsOpen(false);
    setFocusedIndex(-1);
  });

  // Filter groups and actions based on role permissions
  const visibleGroups = React.useMemo(() => {
    return groups
      .filter(group => {
        if (!group.allowedRoles || group.allowedRoles.length === 0) {
          return true;
        }
        if (!currentUserRole) {
          return false;
        }
        return group.allowedRoles.includes(currentUserRole);
      })
      .map(group => ({
        ...group,
        actions: group.actions.filter(action => {
          if (!action.allowedRoles || action.allowedRoles.length === 0) {
            return true;
          }
          if (!currentUserRole) {
            return false;
          }
          return action.allowedRoles.includes(currentUserRole);
        }),
      }))
      .filter(group => group.actions.length > 0);
  }, [groups, currentUserRole]);

  // Flatten all actions for keyboard navigation
  const allActions = React.useMemo(() => {
    return visibleGroups.flatMap(group => group.actions);
  }, [visibleGroups]);

  // Keyboard shortcut handling
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for registered shortcuts
      const key = `${e.ctrlKey || e.metaKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;

      for (const group of visibleGroups) {
        for (const action of group.actions) {
          if (action.shortcutKey === key && !action.disabled) {
            e.preventDefault();
            action.onClick();
            setIsOpen(false);
            setFocusedIndex(-1);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, visibleGroups]);

  // Focus management
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const element = actionRefs.current.get(focusedIndex);
      element?.focus();
    }
  }, [isOpen, focusedIndex]);

  const handleActionClick = (action: QuickAction) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
      setFocusedIndex(-1);
    }
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
          let next = prev + 1;
          // Skip disabled items
          while (next < allActions.length && allActions[next]?.disabled) {
            next++;
          }
          return next >= allActions.length ? 0 : next;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          let next = prev - 1;
          // Skip disabled items
          while (next >= 0 && allActions[next]?.disabled) {
            next--;
          }
          return next < 0 ? allActions.length - 1 : next;
        });
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allActions.length) {
          const action = allActions[focusedIndex];
          if (action && !action.disabled) {
            handleActionClick(action);
          }
        }
        break;

      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case 'End':
        e.preventDefault();
        setFocusedIndex(allActions.length - 1);
        break;

      case 'Tab':
        // Allow tab to cycle through items
        if (e.shiftKey) {
          e.preventDefault();
          setFocusedIndex(prev => {
            let next = prev - 1;
            while (next >= 0 && allActions[next]?.disabled) {
              next--;
            }
            return next < 0 ? allActions.length - 1 : next;
          });
        } else {
          e.preventDefault();
          setFocusedIndex(prev => {
            let next = prev + 1;
            while (next < allActions.length && allActions[next]?.disabled) {
              next++;
            }
            return next >= allActions.length ? 0 : next;
          });
        }
        break;
    }
  };

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <div className={cn(styles.quickActionsContainer, className)} ref={menuRef}>
      {/* Trigger Button */}
      {trigger ? (
        <div
          onClick={handleTriggerClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {trigger}
        </div>
      ) : (
        <button
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          className={styles.getTriggerButton(theme, disabled)}
          disabled={disabled}
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          type="button"
        >
          <TriggerIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      )}

      {/* Actions Dropdown */}
      {isOpen && (
        <div
          className={styles.getDropdownContainer(theme, position, maxWidth)}
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className={styles.getHeader(theme)}>
            <h3 className={styles.getHeaderTitle(theme)}>Quick Actions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.getCloseButton(theme)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Groups */}
          <div className={styles.groupsContainer}>
            {visibleGroups.map((group, groupIndex) => {
              // Calculate the starting index for this group's actions
              const groupStartIndex = visibleGroups
                .slice(0, groupIndex)
                .reduce((sum, g) => sum + g.actions.length, 0);

              return (
                <div key={group.id} className={styles.actionGroup}>
                  {/* Group Title */}
                  {group.title && (
                    <h4 className={styles.getGroupTitle(theme)}>{group.title}</h4>
                  )}

                  {/* Actions */}
                  <div className={styles.actionsContainer}>
                    {group.actions.map((action, actionIndex) => {
                      const ActionIcon = action.icon;
                      const globalIndex = groupStartIndex + actionIndex;
                      const isFocused = focusedIndex === globalIndex;
                      return (
                        <button
                          key={action.id}
                          ref={(el) => {
                            if (el) actionRefs.current.set(globalIndex, el);
                          }}
                          onClick={() => handleActionClick(action)}
                          onMouseEnter={() => setFocusedIndex(globalIndex)}
                          onKeyDown={handleKeyDown}
                          className={cn(
                            styles.getActionButton(theme, action.disabled || false),
                            isFocused && 'ring-2 ring-blue-500 ring-inset'
                          )}
                          disabled={action.disabled}
                          tabIndex={isOpen ? 0 : -1}
                          role="menuitem"
                          aria-disabled={action.disabled}
                        >
                          {/* Icon */}
                          <div
                            className={styles.getActionIconContainer(
                              action.iconVariant || 'primary'
                            )}
                          >
                            <ActionIcon className={styles.actionIcon} />
                          </div>

                          {/* Content */}
                          <div className={styles.actionContent}>
                            <div className={styles.actionHeader}>
                              <span className={styles.getActionLabel(theme)}>
                                {action.label}
                              </span>
                              {action.badge && (
                                <span className={styles.getBadge()}>
                                  {action.badge}
                                </span>
                              )}
                            </div>
                            {action.description && (
                              <p className={styles.getActionDescription(theme)}>
                                {action.description}
                              </p>
                            )}
                          </div>

                          {/* Keyboard Shortcut */}
                          {action.shortcut && (
                            <div className={styles.shortcut}>
                              {action.shortcut.split('+').map((key, i, arr) => (
                                <React.Fragment key={i}>
                                  <kbd className={styles.getShortcutKey(theme)}>
                                    {key}
                                  </kbd>
                                  {i < arr.length - 1 && (
                                    <span className="mx-0.5">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider between groups */}
                  {groupIndex < visibleGroups.length - 1 && (
                    <div className={styles.getDivider(theme)} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';
