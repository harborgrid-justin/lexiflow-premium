/**
 * @module hooks/integration/useBackendAutoSave
 * @category Hooks - Backend Integration
 * 
 * Backend-integrated auto-save hook.
 * Wraps useAutoSave with DataService integration for seamless backend persistence.
 * 
 * FEATURES:
 * - Automatic backend integration via DataService
 * - Type-safe domain routing
 * - Consistent error handling
 * - Success/error notifications
 * 
 * @example
 * ```typescript
 * const { forceSave, isSaving } = useBackendAutoSave({
 *   domain: 'cases',
 *   data: caseData,
 *   onSuccess: () => notify.success('Case auto-saved'),
 *   onError: (error) => notify.error(error.message)
 * });
 * ```
 */

import { useCallback } from 'react';

import { DataService } from '@/services/data/data-service.service';
import type { BaseEntity } from '@/types';

import { useAutoSave, type UseAutoSaveOptions, type UseAutoSaveReturn } from '../core/useAutoSave';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available DataService domains for auto-save
 */
export type DataServiceDomain = 
  | 'cases'
  | 'documents'
  | 'docket'
  | 'evidence'
  | 'pleadings'
  | 'tasks'
  | 'timeEntries'
  | 'invoices'
  | 'clients'
  | 'parties'
  | 'motions'
  | 'exhibits'
  | 'depositions'
  | 'custodians'
  | 'witnesses'
  | 'legalHolds'
  | 'esiSources'
  | 'productions'
  | 'discoveryRequests'
  | 'privilegeLog'
  | 'examinations'
  | 'interviews'
  | 'users'
  | 'workflows'
  | 'projects'
  | 'risks'
  | 'calendar'
  | 'compliance'
  | 'conflicts'
  | 'correspondence'
  | 'communications'
  | 'notifications';

/**
 * Options for useBackendAutoSave hook
 */
export interface UseBackendAutoSaveOptions<T extends BaseEntity> 
  extends Omit<UseAutoSaveOptions<T>, 'onSave'> {
  /** DataService domain to use for persistence */
  domain: DataServiceDomain;
  /** Optional custom save logic (overrides default) */
  customSave?: (data: T) => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Auto-save hook with backend integration.
 * 
 * Automatically persists data to backend via DataService.
 * Provides consistent error handling and success notifications.
 * 
 * @param options - Configuration options
 * @returns Object with forceSave method and isSaving state
 */
export function useBackendAutoSave<T extends BaseEntity>({
  domain,
  data,
  customSave,
  ...options
}: UseBackendAutoSaveOptions<T>): UseAutoSaveReturn {
  
  const handleSave = useCallback(async (dataToSave: T) => {
    if (customSave) {
      await customSave(dataToSave);
      return;
    }

    // Type assertion needed for dynamic domain access
    const service = DataService[domain] as unknown as {
      update: (id: string, data: T) => Promise<T>;
    };

    if (!service || typeof service.update !== 'function') {
      throw new Error(`DataService.${domain} does not support update operation`);
    }

    await service.update(dataToSave.id, dataToSave);
  }, [domain, customSave]);

  return useAutoSave({
    ...options,
    data,
    onSave: handleSave
  });
}
