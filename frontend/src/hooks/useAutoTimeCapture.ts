/**
 * @module hooks/useAutoTimeCapture
 * @category Hooks - Time Tracking
 * @description Passive time tracking hook monitoring user activity (mousemove, keydown) with idle
 * detection (1 minute threshold). Uses RAF throttling for performance and tracks active time in
 * seconds per page/case context. Resets on path or case change.
 * 
 * NO THEME USAGE: Utility hook for time tracking logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useState, useEffect, useRef, useCallback } from 'react';

// ========================================
// CONSTANTS
// ========================================
// define options outside to maintain reference equality
const EVENT_OPTIONS: AddEventListenerOptions = { passive: true };

// ========================================
// HOOK
// ========================================
export const useAutoTimeCapture = (currentPath: string, currentCaseId?: string | null) => {
  const [activeTime, setActiveTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const lastActivity = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Use a ref to track if we are currently idle so event listeners don't need to re-bind
  const isIdleRef = useRef(false);

  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  // Reset timer on path/case change
  useEffect(() => {
      if (activeTime > 60 && currentCaseId) {
          // In a real app, auto-log here.
      }
      setActiveTime(0);
      lastActivity.current = Date.now();
      setIsIdle(false);
  }, [currentPath, currentCaseId, activeTime]);

  // Throttled Activity Handler using RAF
  const handleActivity = useCallback(() => {
      if (rafRef.current) return;
      
      rafRef.current = requestAnimationFrame(() => {
          lastActivity.current = Date.now();
          if (isIdleRef.current) {
              setIsIdle(false);
          }
          rafRef.current = null;
      });
  }, []);

  // Activity Listeners - Optimized
  useEffect(() => {
      window.addEventListener('mousemove', handleActivity, EVENT_OPTIONS);
      window.addEventListener('keydown', handleActivity, EVENT_OPTIONS);
      // 'click' is redundant if we track mousemove/keydown and expensive if spam-clicked
      
      return () => {
          window.removeEventListener('mousemove', handleActivity, EVENT_OPTIONS);
          window.removeEventListener('keydown', handleActivity, EVENT_OPTIONS);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, [handleActivity]);

  // Timer Tick - with mounted check to prevent setState on unmounted component
  useEffect(() => {
      let isMounted = true;

      timerRef.current = setInterval(() => {
          if (!isMounted) return;

          const now = Date.now();
          if (now - lastActivity.current > 60000) { // 1 min idle threshold
              setIsIdle(true);
          } else {
              setActiveTime(prev => prev + 1);
          }
      }, 1000);

      return () => {
        isMounted = false;
        if (timerRef.current) clearInterval(timerRef.current);
      };
  }, []);

  return { activeTime, isIdle };
};
