/**
 * Custom hook for conflict checking logic
 */

import { useState, useEffect } from 'react';
import { Matter, MatterStatus } from '@/types';

export type ConflictStatus = 'pending' | 'clear' | 'conflict';

export interface UseConflictCheckResult {
  conflictStatus: ConflictStatus;
  setConflictStatus: React.Dispatch<React.SetStateAction<ConflictStatus>>;
}

export const useConflictCheck = (
  clientName: string,
  existingMatters: Matter[],
  currentId?: string
): UseConflictCheckResult => {
  const [conflictStatus, setConflictStatus] = useState<ConflictStatus>('pending');

  useEffect(() => {
    if (!clientName || clientName.length < 3) {
      setConflictStatus('pending');
      return;
    }

    const hasConflict = existingMatters.some(m =>
      m.clientName?.toLowerCase() === clientName?.toLowerCase() &&
      m.status === MatterStatus.ACTIVE &&
      m.id !== currentId
    );

    setConflictStatus(hasConflict ? 'conflict' : 'clear');
  }, [clientName, existingMatters, currentId]);

  return {
    conflictStatus,
    setConflictStatus,
  };
};
