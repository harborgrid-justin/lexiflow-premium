/**
 * @module components/common/LazyLoader
 * @category Common
 * @description Skeleton loader with adaptive bandwidth detection.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useEffect, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface LazyLoaderProps {
  message?: string;
}

export function LazyLoader({ message = "Loading..." }: LazyLoaderProps) {
  const { theme } = useTheme();
  // HYDRATION-SAFE: Initialize as false, will be set in effect
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    // HYDRATION-SAFE: Adaptive Loading - Check connection type only in browser
    if (typeof navigator === 'undefined') return;

    if ('connection' in navigator) {
      const nav = navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      };
      const conn = nav.connection;
      if (conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === '3g')) {
        setIsLowBandwidth(true);
      }
    }
  }, []);

  if (isLowBandwidth) {
    // Simplified loader for slow connections
    return (
      <div className="flex items-center justify-center h-full p-8" role="status" aria-live="polite">
        <div className="text-center">
          <div className={cn("text-sm font-bold mb-2", theme.text.secondary)}>{message}</div>
          <div className={cn("text-xs", theme.text.tertiary)}>Low Bandwidth Mode Active</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 space-y-6 overflow-hidden" role="status" aria-live="polite" aria-label={message}>
      {/* Skeleton Metrics Row - LAYOUT STABILITY: Fixed dimensions for predictable layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {/* IDENTITY-STABLE KEYS: Use stable identifiers */}
        {[1, 2, 3, 4].map((i: number) => (
          <div key={`skeleton-metric-${i}`} className={cn("h-32 rounded-xl border shadow-sm relative overflow-hidden", theme.surface.default, theme.border.default)}>
            <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 animate-shimmer", theme.surface.highlight)} style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        ))}
      </div>

      {/* Skeleton Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className={cn("lg:col-span-2 h-[400px] rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="h-full w-full bg-opacity-30 flex flex-col p-6 space-y-6">
            <div className={cn("h-6 w-1/3 rounded", theme.surface.highlight)}></div>
            <div className={cn("flex-1 rounded-lg", theme.surface.highlight)}></div>
          </div>
        </div>
        <div className={cn("h-[400px] rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
          <div className="h-full w-full bg-opacity-30 flex flex-col p-6 space-y-4">
            <div className={cn("h-6 w-1/2 rounded", theme.surface.highlight)}></div>
            <div className="space-y-3 pt-4">
              <div className={cn("h-16 w-full rounded-lg", theme.surface.highlight)}></div>
              <div className={cn("h-16 w-full rounded-lg", theme.surface.highlight)}></div>
              <div className={cn("h-16 w-full rounded-lg", theme.surface.highlight)}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <span className={cn("text-xs font-medium animate-pulse uppercase tracking-widest", theme.text.tertiary)}>{message}</span>
      </div>
    </div>
  );
}
