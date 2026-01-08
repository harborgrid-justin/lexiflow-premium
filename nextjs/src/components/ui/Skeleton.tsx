'use client';

/**
 * @deprecated Use @/components/ui/shadcn/skeleton instead
 * Adapter component for backward compatibility
 */

import { Skeleton as ShadcnSkeleton } from '@/components/ui/shadcn/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export function Skeleton({ className, count = 1, ...props }: SkeletonProps) {
  if (count === 1) {
    return <ShadcnSkeleton className={className} {...props} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ShadcnSkeleton
          key={i}
          className={cn(i > 0 && "mt-2", className)}
          {...props}
        />
      ))}
    </>
  );
}
