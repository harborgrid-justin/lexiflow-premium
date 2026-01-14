/**
 * @module components/layout/MobileBottomNav
 * @category Layout - Mobile
 * @description Mobile-only bottom navigation bar displaying primary navigation items with icons
 * and labels. Fixed at bottom of viewport for thumb-friendly access on mobile devices.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.default - Navigation bar background
 * - theme.border.default - Top border
 * - theme.primary.text - Active navigation item
 * - theme.text.secondary/tertiary - Inactive items
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { MoreHorizontal } from 'lucide-react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import { NAVIGATION_ITEMS } from '@/config/nav.config';
import { cn } from '@/shared/lib/cn';

// Types
import { AppView } from '@/types';

// ========================================
// TYPES & INTERFACES
// ========================================
interface MobileBottomNavProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

// ========================================
// COMPONENT
// ========================================
/**
 * MobileBottomNav - React 18 optimized with React.memo
 */
export const MobileBottomNav = React.memo<MobileBottomNavProps>(function MobileBottomNav({ activeView, setActiveView }) {
  const { theme } = useTheme();

  // Show only the most important navigation items on mobile
  const primaryNavItems = NAVIGATION_ITEMS.slice(0, 4);

  return (
    <div className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-40 border-t shadow-lg",
      theme.surface.default,
      theme.border.default
    )}>
      <div className="flex justify-around items-center h-16 px-2">
        {primaryNavItems.map((item: unknown) => {
          const typedItem = item as { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> };
          const Icon = typedItem.icon;
          const isActive = activeView === typedItem.id;

          return (
            <button
              key={typedItem.id}
              onClick={() => setActiveView(typedItem.id as AppView)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors rounded-lg",
                isActive ? theme.primary.text : theme.text.secondary,
                !isActive && `hover:${theme.surface.highlight}`
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive ? theme.primary.text : theme.text.tertiary)} />
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? theme.primary.text : theme.text.tertiary
              )}>
                {typedItem.label}
              </span>
            </button>
          );
        })}
        <button
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition-colors rounded-lg",
            theme.text.secondary,
            `hover:${theme.surface.highlight}`
          )}
        >
          <MoreHorizontal className={cn("h-5 w-5 mb-1", theme.text.tertiary)} />
          <span className={cn("text-[10px] font-medium", theme.text.tertiary)}>
            More
          </span>
        </button>
      </div>
    </div>
  );
});

export default MobileBottomNav;
