/**
 * @module hooks/useNotify
 * @category Hooks - UI Utilities
 * 
 * Provides toast notification interface with semantic methods.
 * Must be used within ToastProvider.
 * 
 * @example
 * ```typescript
 * const notify = useNotify();
 * 
 * notify.success('Case created successfully');
 * notify.error('Failed to save document');
 * notify.info('Background sync in progress');
 * notify.warning('Session expires in 5 minutes');
 * ```
 * 
 * @throws {Error} If used outside ToastProvider context
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useToast } from '@/providers';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useNotify hook
 * Provides semantic notification methods
 */
export interface UseNotifyReturn {
  /** Display success notification */
  success: (message: string) => void;
  /** Display error notification */
  error: (message: string) => void;
  /** Display info notification */
  info: (message: string) => void;
  /** Display warning notification */
  warning: (message: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Provides toast notification interface.
 * 
 * @returns Object with semantic notification methods
 * @throws {Error} If used outside ToastProvider
 */
export function useNotify(): UseNotifyReturn {
  const toastContext = useToast();
  
  if (!toastContext || !toastContext.addToast) {
    throw new Error('useNotify must be used within ToastProvider');
  }
  
  const { addToast } = toastContext;

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
}
