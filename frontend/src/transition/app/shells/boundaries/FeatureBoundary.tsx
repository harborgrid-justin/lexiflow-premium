/**
 * FeatureBoundary - Feature-level Suspense boundary
 * Uses FeatureShell as fallback
 */

import { Suspense, type ReactNode } from 'react';
import { FeatureShell } from '../FeatureShell';

interface FeatureBoundaryProps {
  children: ReactNode;
  variant?: 'table' | 'chart' | 'form' | 'generic';
}

export function FeatureBoundary({ children, variant = 'generic' }: FeatureBoundaryProps) {
  return (
    <Suspense fallback={<FeatureShell variant={variant} />}>
      {children}
    </Suspense>
  );
}
