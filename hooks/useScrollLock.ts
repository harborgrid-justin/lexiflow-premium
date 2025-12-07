
import { useEffect, useRef } from 'react';

const lockStack: Set<string> = new Set();

export const useScrollLock = (lockId: string, isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      if (lockStack.size === 0) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
      lockStack.add(lockId);
    }

    return () => {
      if (isLocked) {
        lockStack.delete(lockId);
        if (lockStack.size === 0) {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
      }
    };
  }, [isLocked, lockId]);
};