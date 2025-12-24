/**
 * @module hooks/useNotify
 * @category Hooks - UI Utilities
 * @description Toast notification convenience hook wrapping ToastContext with semantic methods
 * (success, error, info, warning). Provides stable callback references via useCallback for
 * use in effect dependencies and event handlers.
 * 
 * NO THEME USAGE: Wrapper hook for toast notifications
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useToast } from '../context/ToastContext';

// ============================================================================
// HOOK
// ============================================================================
export const useNotify = () => {
  const { addToast } = useToast();

  const success = useCallback((message: string) => {
    addToast(message, 'success');
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast(message, 'error');
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast(message, 'info');
  }, [addToast]);

  const warning = useCallback((message: string) => {
    addToast(message, 'warning');
  }, [addToast]);

  return { success, error, info, warning };
};
