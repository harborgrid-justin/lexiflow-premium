
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotify } from './useNotify';

export const useAutoTimeCapture = (currentPath: string, currentCaseId?: string | null) => {
  const [activeTime, setActiveTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const lastActivity = useRef(Date.now());
  const timerRef = useRef<any>(null);
  
  // Use a ref to track if we are currently idle so event listeners don't need to re-bind
  const isIdleRef = useRef(false);

  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  // Reset timer on path/case change
  useEffect(() => {
      if (activeTime > 60 && currentCaseId) {
          // In a real app, auto-log here. 
          // For demo, we just reset.
          // console.log(`[AutoTime] Captured ${activeTime}s for ${currentCaseId}`);
      }
      setActiveTime(0);
      lastActivity.current = Date.now();
      setIsIdle(false);
  }, [currentPath, currentCaseId]);

  // Stable Activity Handler
  const handleActivity = useCallback(() => {
      lastActivity.current = Date.now();
      if (isIdleRef.current) {
          setIsIdle(false);
      }
  }, []);

  // Activity Listeners - Bound ONCE
  useEffect(() => {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      
      return () => {
          window.removeEventListener('mousemove', handleActivity);
          window.removeEventListener('keydown', handleActivity);
          window.removeEventListener('click', handleActivity);
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