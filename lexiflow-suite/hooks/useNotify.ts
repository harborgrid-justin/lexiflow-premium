
import { useCallback } from 'react';

// In a real app, this would wrap a toast library context
export const useNotify = () => {
  const success = useCallback((message: string) => {
    console.log(`[SUCCESS]: ${message}`);
    alert(`✓ ${message}`);
  }, []);

  const error = useCallback((message: string) => {
    console.error(`[ERROR]: ${message}`);
    alert(`✕ ${message}`);
  }, []);

  const info = useCallback((message: string) => {
    console.log(`[INFO]: ${message}`);
    // alert(`ℹ ${message}`); // Optional: don't alert for info
  }, []);

  return { success, error, info };
};
