
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotify } from './useNotify';

export const useAutoTimeCapture = (currentPath: string, currentCaseId?: string | null) => {
  const [activeTime, setActiveTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const lastActivity = useRef(Date.now());
  const timerRef = useRef<any>(null);
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
  }, [currentPath, currentCaseId]);

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

  // Activity Listeners - Bound ONCE with passive flag for performance
  useEffect(() => {
      const options = { passive: true };
      window.addEventListener('mousemove', handleActivity, options);
      window.addEventListener('keydown', handleActivity, options);
      window.addEventListener('click', handleActivity, options);
      
      return () => {
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
          window.removeEventListener('click', handleActivity);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, [handleActivity]);

  // Timer Tick
  useEffect(() => {
      timerRef.current = setInterval(() => {
          const now = Date.now();
          if (now - lastActivity.current > 60000) { // 1 min idle threshold
              setIsIdle(true);
          } else {
              setActiveTime(prev => prev + 1);
          }
      }, 1000);

      return () => clearInterval(timerRef.current);
  }, []);

  return { activeTime, isIdle };
};
