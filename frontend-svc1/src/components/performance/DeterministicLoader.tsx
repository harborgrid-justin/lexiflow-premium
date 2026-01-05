import React from 'react';
import { useMinDisplayTime } from '../../hooks/performance/useMinDisplayTime';

interface DeterministicLoaderProps {
  isLoading: boolean;
  minDuration?: number;
  delay?: number;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A wrapper component that enforces deterministic loading states.
 * Prevents "flash of skeleton" and ensures loading UI doesn't flicker.
 * (Principle 4)
 */
export const DeterministicLoader: React.FC<DeterministicLoaderProps> = ({
  isLoading,
  minDuration = 500,
  delay = 100, // Don't show loader if request takes < 100ms
  fallback,
  children
}) => {
  const showLoading = useMinDisplayTime(isLoading, minDuration, delay);

  if (showLoading) {
    return <>{fallback}</>;
  }

  // If we are technically loading but within the delay window,
  // we might want to show nothing or the old content (stale-while-revalidate).
  // For this implementation, if we aren't showing loading, we show children.
  // Note: If this is the *first* load, children might be null/empty.
  // A more robust version might handle "first load" vs "update".

  return <>{children}</>;
};
