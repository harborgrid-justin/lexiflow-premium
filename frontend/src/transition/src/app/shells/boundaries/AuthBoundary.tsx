/**
 * AuthBoundary - Auth-aware Suspense boundary
 * Uses AppShell as fallback
 */

import { Suspense, type ReactNode } from 'react';
import { AppShell } from '../AppShell';

interface AuthBoundaryProps {
  children: ReactNode;
}

export function AuthBoundary({ children }: AuthBoundaryProps) {
  return (
    <Suspense fallback={<AppShell />}>
      {children}
    </Suspense>
  );
}
