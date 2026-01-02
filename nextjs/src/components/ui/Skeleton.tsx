'use client';

/**
 * Skeleton Component - Loading placeholder
 */

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            bg-slate-200 dark:bg-slate-800
            rounded-lg
            animate-pulse
            ${className}
          `}
        />
      ))}
    </>
  );
}

interface SkeletonLineProps {
  className?: string;
  lines?: number;
}

export function SkeletonLine({ className = 'h-4', lines = 3 }: SkeletonLineProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`w-full ${i === lines - 1 ? 'w-4/5' : ''} ${className}`}
        />
      ))}
    </div>
  );
}
