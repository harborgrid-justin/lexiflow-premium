/**
 * @module hooks/useScrollLock
 * @category Hooks - UI Utilities
 * @description Scroll lock hook managing document overflow with lock stacking for nested modals/overlays.
 * Multiple components can lock scroll simultaneously via unique lockIds. Only releases scroll when
 * all locks are cleared. Prevents body scroll on iOS Safari and desktop browsers.
 * 
 * NO THEME USAGE: Utility hook for scroll prevention logic
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useEffect, useRef } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================
const lockStack: Set<string> = new Set();

// ============================================================================
// HOOK
// ============================================================================
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