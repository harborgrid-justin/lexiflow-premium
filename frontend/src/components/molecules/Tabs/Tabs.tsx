/**
 * @module components/common/Tabs
 * @category Common
 * @description Tab navigation with variants.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useRef } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Utils & Constants
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  tabs: (string | TabItem)[];
  activeTab: string;
  onChange: (tab: string) => void;
  className?: string;
  variant?: 'pills' | 'underline' | 'segmented';
}

export function Tabs({ tabs, activeTab, onChange, className = '', variant = 'segmented' }: TabsProps) {
  const { theme } = useTheme();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Normalizing tabs to objects
  const normalizedTabs: TabItem[] = tabs.map(t =>
    typeof t === 'string' ? { id: t, label: t.charAt(0).toUpperCase() + t.slice(1).replace(/([A-Z])/g, ' $1').trim() } : t
  );

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % normalizedTabs.length;
      onChange(normalizedTabs[nextIndex]!.id);
      tabRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + normalizedTabs.length) % normalizedTabs.length;
      onChange(normalizedTabs[prevIndex]!.id);
      tabRefs.current[prevIndex]?.focus();
    }
  };

  if (variant === 'underline') {
    return (
      <div className={cn("border-b w-full", theme.border.default, className)}>
        <nav className="-mb-px flex space-x-6 px-4" aria-label="Tabs" role="tablist">
          {normalizedTabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={el => { if (el) tabRefs.current[index] = el; }}
                onClick={() => onChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 relative top-px outline-none rounded-t",
                  isActive
                    ? cn(theme.border.focused.split(' ')[0], theme.primary.text) // Use border color portion
                    : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`, `hover:border-slate-300`)
                )}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
              >
                {Icon && <Icon className={cn("h-4 w-4", isActive ? "text-current" : theme.text.tertiary)} />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Default Segmented Style
  return (
    <div className={cn("inline-flex rounded-lg p-1 border", theme.surface.highlight, theme.border.default, className)} role="tablist">
      {normalizedTabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={el => { if (el) tabRefs.current[index] = el; }}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-w-[80px] outline-none",
              theme.border.focused.replace('border-', 'focus-visible:ring-').split(' ')[0], // Hacky but reuses the theme color for ring
              isActive
                ? cn(theme.surface.default, theme.text.primary, "shadow-sm ring-1 ring-black/5")
                : cn("bg-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
            )}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
          >
            {Icon && <Icon className={cn("h-3.5 w-3.5", isActive ? theme.primary.text : "opacity-70")} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
