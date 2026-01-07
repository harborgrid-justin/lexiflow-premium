/**
 * GlobalBoundary - Top-level Suspense boundary
 * Uses GlobalShell as fallback
 */

import { Suspense, type ReactNode } from 'react';
import { GlobalShell } from '../GlobalShell';

interface GlobalBoundaryProps {
  children: ReactNode;
}

export function GlobalBoundary({ children }: GlobalBoundaryProps) {
  return (
    <Suspense fallback={<GlobalShell />}>
      {children}
    </Suspense>
  );
}
