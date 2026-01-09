/**
 * @module components/common/Stats
 * @category Common
 * @description Statistics grid with icons.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface StatItem {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}

interface StatsProps {
    items: StatItem[];
}

/**
 * Stats - React 18 optimized with React.memo
 */
export const Stats = React.memo<StatsProps>(({ items }) => {
    const { theme } = useTheme();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* IDENTITY-STABLE KEYS: Use label as stable identifier */}
            {items.map((item) => (
                <div key={item.label} className={cn("p-5 rounded-lg border shadow-sm flex items-start gap-4", theme.surface.default, theme.border.default)}>
                    <div className={cn("p-3 rounded-lg", item.bg)}>
                        <item.icon className={cn("h-6 w-6", item.color)} />
                    </div>
                    <div>
                        <p className={cn("text-sm font-bold uppercase tracking-wider", theme.text.secondary)}>{item.label}</p>
                        <p className={cn("text-3xl font-bold mt-1", theme.text.primary)}>{item.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
});

Stats.displayName = 'Stats';
